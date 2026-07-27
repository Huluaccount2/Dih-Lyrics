"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const ws_1 = require("ws");
const node_path_1 = require("node:path");
const node_child_process_1 = require("node:child_process");
const Settings_1 = require("../Settings");
const SpotifyService_1 = require("../SpotifyService");
const EmojiCache_1 = require("../EmojiCache");
function spotifyControl(method, endpoint) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!SpotifyService_1.SpotifyService.token)
            return { ok: false, error: "No Spotify token available." };
        const request = yield fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
            method,
            headers: { "Authorization": "Bearer " + SpotifyService_1.SpotifyService.token }
        });
        // Spotify's player-control endpoints return 204 with no body on success, and 404 when
        // there's no active playback device to control - both worth surfacing distinctly.
        if (request.status === 204)
            return { ok: true };
        if (request.status === 404)
            return { ok: false, error: "No active Spotify playback device found." };
        if (request.status === 403)
            return { ok: false, error: "Spotify rejected the control request - Premium is required for playback control, and if you're using the App auth method the token needs the user-modify-playback-state scope (re-authorize to pick it up)." };
        return { ok: false, error: `Spotify returned HTTP ${request.status}.` };
    });
}
function quoteCmd(value) {
    return `"${value.replace(/"/g, '""')}"`;
}
function restartLyricStatus() {
    const projectRoot = (0, node_path_1.join)(__dirname, "../..");
    const startBat = (0, node_path_1.join)(projectRoot, "start.bat");
    const command = [
        "timeout /t 1 /nobreak >nul",
        "taskkill /F /IM node.exe >nul 2>nul",
        "timeout /t 1 /nobreak >nul",
        `start "Lyric Status" ${quoteCmd(startBat)}`
    ].join(" & ");
    const child = (0, node_child_process_1.spawn)("cmd.exe", ["/d", "/s", "/c", command], {
        cwd: projectRoot,
        detached: true,
        windowsHide: true,
        stdio: "ignore"
    });
    child.unref();
}
function songOffsetKey(songName, artist) {
    return `${songName || ""}::${artist || ""}`.trim().toLowerCase();
}
function getCurrentSongOffset(playbackState) {
    if (!Settings_1.Settings.songOffsets.enabled || !Array.isArray(Settings_1.Settings.songOffsets.entries))
        return 0;
    const key = songOffsetKey(playbackState.songName, playbackState.songAuthor);
    const entry = Settings_1.Settings.songOffsets.entries.find((candidate) => candidate.key === key);
    return entry ? Number(entry.offsetMs) || 0 : 0;
}
function getFallbackEffectiveOffset(playbackState) {
    const manualOffset = Number(Settings_1.Settings.timings.sendTimeOffset) || 0;
    return manualOffset + getCurrentSongOffset(playbackState);
}
function getCurrentLineIndex(playbackState, effectiveOffset) {
    var _a;
    const lines = ((_a = playbackState.lyrics) === null || _a === void 0 ? void 0 : _a.lines) || [];
    if (!lines.length)
        return -1;
    const offset = effectiveOffset ? effectiveOffset() : getFallbackEffectiveOffset(playbackState);
    const position = Math.max(0, playbackState.songProgress + offset);
    let currentLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line || typeof line.time !== "number")
            continue;
        if (line.time > position)
            break;
        currentLineIndex = i;
    }
    return currentLineIndex;
}
function startServer(playbackState, runtimeStatus, effectiveOffset) {
    const app = (0, express_1.default)();
    const httpServer = (0, node_http_1.createServer)(app);
    const wss = new ws_1.WebSocketServer({
        server: httpServer,
        path: "/ws"
    });
    app.use("/", express_1.default.static((0, node_path_1.join)(__dirname, "../../static")));
    app.get("/", (req, res) => {
        res.sendFile((0, node_path_1.join)(__dirname, "../../static/index.html"));
    });
    app.get("/api/emojis", (req, res) => {
        const data = EmojiCache_1.EmojiCache.load();
        res.json(data || { guilds: [], emojisByGuild: {}, fetchedAt: 0 });
    });
    app.post("/api/emojis/refresh", express_1.default.json(), (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (!Settings_1.Settings.credentials.token) {
            res.status(400).json({ error: "No token configured." });
            return;
        }
        try {
            const data = yield EmojiCache_1.EmojiCache.refresh(Settings_1.Settings.credentials.token);
            res.json(data);
        }
        catch (e) {
            res.status(500).json({ error: (e === null || e === void 0 ? void 0 : e.message) || "Failed to refresh emojis." });
        }
    }));
    app.post("/api/spotify/check-cookie", express_1.default.json(), (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!((_a = Settings_1.Settings.credentials.spotifyCookie) === null || _a === void 0 ? void 0 : _a.trim())) {
            res.status(400).json({ ok: false, error: "No cookie configured." });
            return;
        }
        try {
            const ok = yield SpotifyService_1.SpotifyService.refreshViaCookie();
            if (!ok) {
                res.json({ ok: false, error: "Cookie was rejected or came back anonymous - it's likely expired, invalid, or was copied incorrectly." });
                return;
            }
            res.json({ ok: true, expiresAt: SpotifyService_1.SpotifyService.tokenExpiresAt });
        }
        catch (e) {
            res.status(500).json({ ok: false, error: (e === null || e === void 0 ? void 0 : e.message) || "Request to Spotify failed." });
        }
    }));
    app.post("/api/playback/:action", express_1.default.json(), (req, res) => __awaiter(this, void 0, void 0, function* () {
        const action = req.params.action;
        const map = {
            play: ["PUT", "play"],
            pause: ["PUT", "pause"],
            next: ["POST", "next"],
            previous: ["POST", "previous"]
        };
        const entry = map[action];
        if (!entry) {
            res.status(400).json({ ok: false, error: "Unknown action." });
            return;
        }
        const result = yield spotifyControl(entry[0], entry[1]);
        res.status(result.ok ? 200 : 400).json(result);
    }));
    app.post("/api/restart", express_1.default.json(), (req, res) => {
        res.json({ ok: true, message: "Restarting Lyric Status. This closes all node.exe processes." });
        restartLyricStatus();
    });
    app.get("/callback", (req, res) => {
        if (Settings_1.Settings.credentials.useExternalAuthServer) {
            if (!req.query.refresh_token)
                return res.sendStatus(401);
            const refreshToken = req.query.refresh_token;
            console.log(refreshToken);
            Settings_1.Settings.credentials.refreshToken = refreshToken;
            Settings_1.Settings.save();
        }
        else {
            if (!req.query.code)
                return res.sendStatus(401);
            const code = req.query.code;
            Settings_1.Settings.credentials.code = code;
            SpotifyService_1.SpotifyService.exchange().then(() => Settings_1.Settings.save());
        }
        res.send("OK. You can close this page now.");
    });
    wss.on("connection", (ws) => {
        ws.on("message", (data) => {
            const settings = JSON.parse(data.toString());
            // Not typed but it's necessary
            Settings_1.Settings.credentials = settings.credentials;
            Settings_1.Settings.view = settings.view;
            Settings_1.Settings.timings = settings.timings;
            Settings_1.Settings.update = settings.update;
            if (settings.sources)
                Settings_1.Settings.sources = settings.sources;
            if (settings.playback)
                Settings_1.Settings.playback = settings.playback;
            if (settings.gateway)
                Settings_1.Settings.gateway = Object.assign(Object.assign({}, Settings_1.Settings.gateway), settings.gateway);
            if (settings.statusFlash)
                Settings_1.Settings.statusFlash = Object.assign(Object.assign({}, Settings_1.Settings.statusFlash), settings.statusFlash);
            if (settings.statusEmojis)
                Settings_1.Settings.statusEmojis = Object.assign(Object.assign({}, Settings_1.Settings.statusEmojis), settings.statusEmojis);
            if (settings.terminal)
                Settings_1.Settings.terminal = Object.assign(Object.assign({}, Settings_1.Settings.terminal), settings.terminal);
            if (settings.songOffsets)
                Settings_1.Settings.songOffsets = Object.assign(Object.assign({}, Settings_1.Settings.songOffsets), settings.songOffsets);
            if (settings.profiles)
                Settings_1.Settings.profiles = Object.assign(Object.assign({}, Settings_1.Settings.profiles), settings.profiles);
            Settings_1.Settings.save();
        });
        const settings = JSON.stringify({
            type: "settings",
            data: {
                credentials: Settings_1.Settings.credentials,
                view: Settings_1.Settings.view,
                timings: Settings_1.Settings.timings,
                update: Settings_1.Settings.update,
                sources: Settings_1.Settings.sources,
                playback: Settings_1.Settings.playback,
                gateway: Settings_1.Settings.gateway,
                statusFlash: Settings_1.Settings.statusFlash,
                statusEmojis: Settings_1.Settings.statusEmojis,
                terminal: Settings_1.Settings.terminal,
                songOffsets: Settings_1.Settings.songOffsets,
                profiles: Settings_1.Settings.profiles
            }
        });
        ws.send(settings);
    });
    // Pushes live song/lyrics info to any connected panel clients so the Now Playing
    // sidebar can render without polling. Cheap enough to just always run - it's a no-op
    // when nobody's connected, and the payload's small.
    if (playbackState) {
        setInterval(() => {
            var _a;
            if (!wss.clients.size)
                return;
            const currentLineIndex = getCurrentLineIndex(playbackState, effectiveOffset);
            const currentSongOffsetKey = songOffsetKey(playbackState.songName, playbackState.songAuthor);
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
                    canControl: Settings_1.Settings.playback.source === "spotify",
                    songOffsetKey: currentSongOffsetKey,
                    lines: ((_a = playbackState.lyrics) === null || _a === void 0 ? void 0 : _a.lines) || [],
                    currentLineIndex,
                    gateway: runtimeStatus ? runtimeStatus() : null
                }
            });
            wss.clients.forEach((client) => {
                if (client.readyState === ws_1.WebSocket.OPEN)
                    client.send(payload);
            });
        }, 500);
    }
    httpServer.listen(8999);
}
