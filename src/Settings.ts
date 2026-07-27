import { readFileSync, writeFileSync } from "node:fs"
import { Debug } from "./Debug"
import { EmojiRotationSettings } from "./EmojiCache"

interface SmartMergeSettings {
    enabled: boolean
    maxCombinedWords: number
    soloWordThreshold: number
}

interface RateLimitSettings {
    enabled: boolean
    autoBackoff: boolean
    backoffDurationMs: number
    minSendInterval: number
    mergeLines: boolean
    mergeLineCount: number
    smartMerge: SmartMergeSettings
}

export const DEFAULT_SOURCE_ORDER = ["LrcLib", "Spotify", "QQMusic", "NetEase", "Musixmatch", "Genius", "Kugou"]

interface SourcesSettings {
    enableSpotify: boolean
    enableLrcLib: boolean
    enableQQMusic: boolean
    enableNetEase: boolean
    enableGenius: boolean
    enableKugou: boolean
    enableMusixmatch: boolean
    order: string[]
}

export class Settings {
    public static credentials = {
        token: "",
        cookies: "",
        clientID: "",
        clientSecret: "",
        useExternalAuthServer: "",
        code: "",
        refreshToken: "",
        uuid: "",
        customRedirectUri: "",
        // Auto-generated/managed by MusixmatchSource - not user-editable.
        musixmatchToken: "",
        // Alternative to the clientID/clientSecret app flow above: "app" (default, existing
        // OAuth flow) or "cookie" (use spotifyCookie below instead - no app registration).
        spotifyAuthMethod: "app",
        // The sp_dc cookie value from a logged-in open.spotify.com session. Only used when
        // spotifyAuthMethod is "cookie".
        spotifyCookie: ""
    }

    public static sources: SourcesSettings = {
        enableSpotify: true,
        enableLrcLib: true,
        enableQQMusic: true,
        enableNetEase: true,
        enableGenius: false,
        enableKugou: false,
        enableMusixmatch: false,
        order: [...DEFAULT_SOURCE_ORDER]
    }

    public static playback = {
        // "spotify": poll the Spotify Web API directly (needs the app credentials above).
        // "discordPresence": read your "Listening to Spotify" activity off your own Discord
        // presence instead - no Spotify app/OAuth needed, but requires being in a Discord
        // server for presence events to reach this connection, and is a little less precise
        // (see GatewayPresenceUpdater.ts for the tradeoffs).
        source: "spotify"
    }

    public static gateway = {
        enabled: false,
        presenceStatus: "online",
        minIntervalMs: 5000
    }

    public static statusFlash = {
        enabled: false,
        states: ["online", "idle", "dnd"],
        intervalMs: 2000,
        restoreStatus: ""
    }

    public static statusEmojis = {
        enabled: false,
        playing: "\uD83C\uDFB6",
        paused: "\u23F8",
        noLyrics: "\uD83D\uDD0D",
        fallback: "\uD83C\uDFB6"
    }

    public static terminal = {
        preset: "dashboard",
        refreshMs: 1000,
        showAlbumArt: true,
        albumArtWidth: 28,
        showSong: true,
        showLyrics: true,
        showSources: true,
        showWebSocket: true,
        showRateLimit: true,
        showDebug: false,
        sectionOrder: ["albumArt", "song", "lyrics", "sources", "webSocket", "rateLimit", "debug"],
        backgroundColor: "#121314",
        textColor: "#e8ebf0",
        accentColor: "#50c882"
    }

    public static songOffsets = {
        enabled: false,
        entries: [] as { key: string; songName: string; artist: string; offsetMs: number }[]
    }

    public static profiles = {
        active: "",
        items: [] as { id: string; name: string; data: Record<string, unknown> }[]
    }

    public static view = {
        timestamp: true,
        label: true,
        advanced: {
            enabled: false,
            customEmoji: "🎶",
            customStatus: "[{timestamp}] [{lyrics}]",
            fontStyle: "none",
            emojiRotation: {
                enabled: false,
                mode: "custom",
                customEmojis: [],
                guildId: "",
                nitroFilter: "both",
                order: "sequential"
            } as EmojiRotationSettings
        }
    }

    public static timings = {
        sendTimeOffset: 500,
        enableAutooffset: true,
        autooffset: 3,
        playbackPollInterval: 1000,
        rateLimit: {
            enabled: true,
            autoBackoff: true,
            // Floor for how long a backoff pause lasts. Discord's own retry_after is
            // always respected too (whichever is longer wins) - this just lets you force
            // a more conservative minimum pause if you'd rather back off harder than
            // Discord strictly requires.
            backoffDurationMs: 30000,
            minSendInterval: 2500,
            mergeLines: false,
            mergeLineCount: 2,
            smartMerge: {
                enabled: false,
                maxCombinedWords: 20,
                soloWordThreshold: 10
            }
        } as RateLimitSettings
    }

    public static update = {
        enableAutoupdate: true
    }

    public static save(): void {
        writeFileSync("./settings.json", JSON.stringify({
            credentials: this.credentials,
            view: this.view,
            timings: this.timings,
            update: this.update,
            sources: this.sources,
            playback: this.playback,
            gateway: this.gateway,
            statusFlash: this.statusFlash,
            statusEmojis: this.statusEmojis,
            terminal: this.terminal,
            songOffsets: this.songOffsets,
            profiles: this.profiles
        }))
    }

    public static load(): void {
        let settings

        try {
            settings = JSON.parse(readFileSync("./settings.json").toString())
        } catch(e) {
            Debug.write("An error occurred while trying to read settings from file. Using defaults. Error: " + (e as Error).stack)
        }

        if (settings) {
            this.credentials = { ...this.credentials, ...(settings.credentials || {}) }
            this.view = {
                ...this.view,
                ...(settings.view || {}),
                advanced: {
                    ...this.view.advanced,
                    ...((settings.view && settings.view.advanced) || {}),
                    emojiRotation: {
                        ...this.view.advanced.emojiRotation,
                        ...((settings.view && settings.view.advanced && settings.view.advanced.emojiRotation) || {})
                    }
                }
            }
            this.timings = {
                ...this.timings,
                ...(settings.timings || {}),
                rateLimit: {
                    ...this.timings.rateLimit,
                    ...((settings.timings && settings.timings.rateLimit) || {}),
                    smartMerge: {
                        ...this.timings.rateLimit.smartMerge,
                        ...((settings.timings && settings.timings.rateLimit && settings.timings.rateLimit.smartMerge) || {})
                    }
                }
            }
            this.update = { ...this.update, ...(settings.update || {}) }
            this.sources = {
                ...this.sources,
                ...(settings.sources || {}),
                order: (settings.sources && Array.isArray(settings.sources.order) && settings.sources.order.length)
                    ? settings.sources.order
                    : this.sources.order
            }

            // If a new source gets added in an update, make sure it shows up in the saved
            // order instead of silently never running.
            for (const name of DEFAULT_SOURCE_ORDER) {
                if (!this.sources.order.includes(name)) this.sources.order.push(name)
            }

            this.playback = { ...this.playback, ...(settings.playback || {}) }
            this.gateway = { ...this.gateway, ...(settings.gateway || {}) }
            this.statusFlash = { ...this.statusFlash, ...(settings.statusFlash || {}) }
            this.statusFlash.states = Array.isArray(settings.statusFlash?.states) && settings.statusFlash.states.length
                ? settings.statusFlash.states
                : this.statusFlash.states
            this.statusEmojis = { ...this.statusEmojis, ...(settings.statusEmojis || {}) }
            this.statusEmojis.playing = this.fixMojibakeEmoji(this.statusEmojis.playing, "\uD83C\uDFB6")
            this.statusEmojis.paused = this.fixMojibakeEmoji(this.statusEmojis.paused, "\u23F8")
            this.statusEmojis.noLyrics = this.fixMojibakeEmoji(this.statusEmojis.noLyrics, "\uD83D\uDD0D")
            this.statusEmojis.fallback = this.fixMojibakeEmoji(this.statusEmojis.fallback, "\uD83C\uDFB6")
            this.terminal = { ...this.terminal, ...(settings.terminal || {}) }
            this.songOffsets = {
                ...this.songOffsets,
                ...(settings.songOffsets || {}),
                entries: Array.isArray(settings.songOffsets?.entries) ? settings.songOffsets.entries : this.songOffsets.entries
            }
            this.profiles = {
                ...this.profiles,
                ...(settings.profiles || {}),
                items: Array.isArray(settings.profiles?.items) ? settings.profiles.items : this.profiles.items
            }
        }
    }

    private static fixMojibakeEmoji(value: string, fallback: string): string {
        const text = String(value || "")

        if (!text || text.includes("Ã") || text.includes("ðŸ")) return fallback

        return text
    }
}

