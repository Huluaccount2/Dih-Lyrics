import express from "express"
import { createServer } from "node:http"
import { WebSocketServer, WebSocket } from "ws"
import { join } from "node:path"
import { spawn } from "node:child_process"
import { Settings } from "../Settings"
import { SpotifyService } from "../SpotifyService"
import { EmojiCache } from "../EmojiCache"
import { PlaybackState } from "../PlaybackState"

async function spotifyControl(method: string, endpoint: string): Promise<{ ok: boolean; error?: string }> {
    if (!SpotifyService.token) return { ok: false, error: "No Spotify token available." }

    const request = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method,
        headers: { "Authorization": "Bearer " + SpotifyService.token }
    })

    // Spotify's player-control endpoints return 204 with no body on success, and 404 when
    // there's no active playback device to control - both worth surfacing distinctly.
    if (request.status === 204) return { ok: true }
    if (request.status === 404) return { ok: false, error: "No active Spotify playback device found." }
    if (request.status === 403) return { ok: false, error: "Spotify rejected the control request - Premium is required for playback control, and if you're using the App auth method the token needs the user-modify-playback-state scope (re-authorize to pick it up)." }

    return { ok: false, error: `Spotify returned HTTP ${request.status}.` }
}

function quoteCmd(value: string): string {
    return `"${value.replace(/"/g, '""')}"`
}

function restartLyricStatus(): void {
    const projectRoot = join(__dirname, "../..")
    const startBat = join(projectRoot, "start.bat")
    const command = [
        "timeout /t 1 /nobreak >nul",
        "taskkill /F /IM node.exe >nul 2>nul",
        "timeout /t 1 /nobreak >nul",
        `start "Lyric Status" ${quoteCmd(startBat)}`
    ].join(" & ")

    const child = spawn("cmd.exe", ["/d", "/s", "/c", command], {
        cwd: projectRoot,
        detached: true,
        windowsHide: true,
        stdio: "ignore"
    })

    child.unref()
}

function songOffsetKey(songName: string, artist: string): string {
    return `${songName || ""}::${artist || ""}`.trim().toLowerCase()
}

function getCurrentSongOffset(playbackState: PlaybackState): number {
    if (!Settings.songOffsets.enabled || !Array.isArray(Settings.songOffsets.entries)) return 0

    const key = songOffsetKey(playbackState.songName, playbackState.songAuthor)
    const entry = Settings.songOffsets.entries.find((candidate) => candidate.key === key)

    return entry ? Number(entry.offsetMs) || 0 : 0
}

function getFallbackEffectiveOffset(playbackState: PlaybackState): number {
    const manualOffset = Number(Settings.timings.sendTimeOffset) || 0

    return manualOffset + getCurrentSongOffset(playbackState)
}

function getCurrentLineIndex(playbackState: PlaybackState, effectiveOffset?: () => number): number {
    const lines = playbackState.lyrics?.lines || []
    if (!lines.length) return -1

    const offset = effectiveOffset ? effectiveOffset() : getFallbackEffectiveOffset(playbackState)
    const position = Math.max(0, playbackState.songProgress + offset)
    let currentLineIndex = -1

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        if (!line || typeof line.time !== "number") continue
        if (line.time > position) break

        currentLineIndex = i
    }

    return currentLineIndex
}

export function startServer(playbackState?: PlaybackState, runtimeStatus?: () => Record<string, number | string | boolean>, effectiveOffset?: () => number): void {
    const app = express()
    const httpServer = createServer(app)
    const wss = new WebSocketServer({
        server: httpServer,
        path: "/ws"
    })

    app.use("/", express.static(join(__dirname, "../../static")))

    app.get("/", (req, res) => {
        res.sendFile(join(__dirname, "../../static/index.html"))
    })

    app.get("/api/emojis", (req, res) => {
        const data = EmojiCache.load()

        res.json(data || { guilds: [], emojisByGuild: {}, fetchedAt: 0 })
    })

    app.post("/api/emojis/refresh", express.json(), async (req, res) => {
        if (!Settings.credentials.token) {
            res.status(400).json({ error: "No token configured." })
            return
        }

        try {
            const data = await EmojiCache.refresh(Settings.credentials.token)
            res.json(data)
        } catch (e) {
            res.status(500).json({ error: (e as Error)?.message || "Failed to refresh emojis." })
        }
    })

    app.post("/api/spotify/check-cookie", express.json(), async (req, res) => {
        if (!Settings.credentials.spotifyCookie?.trim()) {
            res.status(400).json({ ok: false, error: "No cookie configured." })
            return
        }

        try {
            const ok = await SpotifyService.refreshViaCookie()

            if (!ok) {
                res.json({ ok: false, error: "Cookie was rejected or came back anonymous - it's likely expired, invalid, or was copied incorrectly." })
                return
            }

            res.json({ ok: true, expiresAt: SpotifyService.tokenExpiresAt })
        } catch (e) {
            res.status(500).json({ ok: false, error: (e as Error)?.message || "Request to Spotify failed." })
        }
    })

    app.post("/api/playback/:action", express.json(), async (req, res) => {
        const action = req.params.action
        const map: Record<string, [string, string]> = {
            play: ["PUT", "play"],
            pause: ["PUT", "pause"],
            next: ["POST", "next"],
            previous: ["POST", "previous"]
        }

        const entry = map[action]

        if (!entry) {
            res.status(400).json({ ok: false, error: "Unknown action." })
            return
        }

        const result = await spotifyControl(entry[0], entry[1])

        res.status(result.ok ? 200 : 400).json(result)
    })

    app.post("/api/restart", express.json(), (req, res) => {
        res.json({ ok: true, message: "Restarting Lyric Status. This closes all node.exe processes." })

        restartLyricStatus()
    })

    app.get("/callback", (req, res) => {
        if (Settings.credentials.useExternalAuthServer) {
            if (!req.query.refresh_token) return res.sendStatus(401)

            const refreshToken = req.query.refresh_token
            console.log(refreshToken)
            Settings.credentials.refreshToken = refreshToken as string
            Settings.save()
        } else {
            if (!req.query.code) return res.sendStatus(401)

            const code = req.query.code
            Settings.credentials.code = code as string
            SpotifyService.exchange().then(() => Settings.save())
        }

        res.send("OK. You can close this page now.")
    })

    wss.on("connection", (ws) => {
        ws.on("message", (data) => {
            const settings = JSON.parse(data.toString())
            // Not typed but it's necessary

            Settings.credentials = settings.credentials
            Settings.view = settings.view
            Settings.timings = settings.timings
            Settings.update = settings.update
            if (settings.sources) Settings.sources = settings.sources
            if (settings.playback) Settings.playback = settings.playback
            if (settings.gateway) Settings.gateway = { ...Settings.gateway, ...settings.gateway }
            if (settings.statusFlash) Settings.statusFlash = { ...Settings.statusFlash, ...settings.statusFlash }
            if (settings.statusEmojis) Settings.statusEmojis = { ...Settings.statusEmojis, ...settings.statusEmojis }
            if (settings.terminal) Settings.terminal = { ...Settings.terminal, ...settings.terminal }
            if (settings.songOffsets) Settings.songOffsets = { ...Settings.songOffsets, ...settings.songOffsets }
            if (settings.profiles) Settings.profiles = { ...Settings.profiles, ...settings.profiles }

            Settings.save()
        })

        const settings = JSON.stringify({
            type: "settings",
            data: {
                credentials: Settings.credentials,
                view: Settings.view,
                timings: Settings.timings,
                update: Settings.update,
                sources: Settings.sources,
                playback: Settings.playback,
                gateway: Settings.gateway,
                statusFlash: Settings.statusFlash,
                statusEmojis: Settings.statusEmojis,
                terminal: Settings.terminal,
                songOffsets: Settings.songOffsets,
                profiles: Settings.profiles
            }
        })

        ws.send(settings)
    })

    // Pushes live song/lyrics info to any connected panel clients so the Now Playing
    // sidebar can render without polling. Cheap enough to just always run - it's a no-op
    // when nobody's connected, and the payload's small.
    if (playbackState) {
        setInterval(() => {
            if (!wss.clients.size) return

            const currentLineIndex = getCurrentLineIndex(playbackState, effectiveOffset)
            const currentSongOffsetKey = songOffsetKey(playbackState.songName, playbackState.songAuthor)

            const payload = JSON.stringify({
                type: "nowPlaying",
                data: {
                    songName: playbackState.songName,
                    songAuthor: playbackState.songAuthor,
                    albumName: playbackState.albumName,
                    albumArtUrl: playbackState.albumArtUrl,
                    songDuration: playbackState.songDuration,
                    songProgress: playbackState.songProgress,
                    isPlaying: playbackState.isPlaying,
                    canControl: Settings.playback.source === "spotify",
                    songOffsetKey: currentSongOffsetKey,
                    lines: playbackState.lyrics?.lines || [],
                    currentLineIndex,
                    gateway: runtimeStatus ? runtimeStatus() : null
                }
            })

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) client.send(payload)
            })
        }, 500)
    }

    httpServer.listen(8999)
}
