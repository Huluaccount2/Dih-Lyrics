"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = exports.DEFAULT_SOURCE_ORDER = void 0;
const node_fs_1 = require("node:fs");
const Debug_1 = require("./Debug");
exports.DEFAULT_SOURCE_ORDER = ["LrcLib", "Spotify", "QQMusic", "NetEase", "Musixmatch", "Genius", "Kugou"];
class Settings {
    static save() {
        (0, node_fs_1.writeFileSync)("./settings.json", JSON.stringify({
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
        }));
    }
    static load() {
        var _a, _b, _c;
        let settings;
        try {
            settings = JSON.parse((0, node_fs_1.readFileSync)("./settings.json").toString());
        }
        catch (e) {
            Debug_1.Debug.write("An error occurred while trying to read settings from file. Using defaults. Error: " + e.stack);
        }
        if (settings) {
            this.credentials = Object.assign(Object.assign({}, this.credentials), (settings.credentials || {}));
            this.view = Object.assign(Object.assign(Object.assign({}, this.view), (settings.view || {})), { advanced: Object.assign(Object.assign(Object.assign({}, this.view.advanced), ((settings.view && settings.view.advanced) || {})), { emojiRotation: Object.assign(Object.assign({}, this.view.advanced.emojiRotation), ((settings.view && settings.view.advanced && settings.view.advanced.emojiRotation) || {})) }) });
            this.timings = Object.assign(Object.assign(Object.assign({}, this.timings), (settings.timings || {})), { rateLimit: Object.assign(Object.assign(Object.assign({}, this.timings.rateLimit), ((settings.timings && settings.timings.rateLimit) || {})), { smartMerge: Object.assign(Object.assign({}, this.timings.rateLimit.smartMerge), ((settings.timings && settings.timings.rateLimit && settings.timings.rateLimit.smartMerge) || {})) }) });
            this.update = Object.assign(Object.assign({}, this.update), (settings.update || {}));
            this.sources = Object.assign(Object.assign(Object.assign({}, this.sources), (settings.sources || {})), { order: (settings.sources && Array.isArray(settings.sources.order) && settings.sources.order.length)
                    ? settings.sources.order
                    : this.sources.order });
            // If a new source gets added in an update, make sure it shows up in the saved
            // order instead of silently never running.
            for (const name of exports.DEFAULT_SOURCE_ORDER) {
                if (!this.sources.order.includes(name))
                    this.sources.order.push(name);
            }
            this.playback = Object.assign(Object.assign({}, this.playback), (settings.playback || {}));
            this.gateway = Object.assign(Object.assign({}, this.gateway), (settings.gateway || {}));
            this.statusFlash = Object.assign(Object.assign({}, this.statusFlash), (settings.statusFlash || {}));
            this.statusFlash.states = Array.isArray((_a = settings.statusFlash) === null || _a === void 0 ? void 0 : _a.states) && settings.statusFlash.states.length
                ? settings.statusFlash.states
                : this.statusFlash.states;
            this.statusEmojis = Object.assign(Object.assign({}, this.statusEmojis), (settings.statusEmojis || {}));
            this.statusEmojis.playing = this.fixMojibakeEmoji(this.statusEmojis.playing, "\uD83C\uDFB6");
            this.statusEmojis.paused = this.fixMojibakeEmoji(this.statusEmojis.paused, "\u23F8");
            this.statusEmojis.noLyrics = this.fixMojibakeEmoji(this.statusEmojis.noLyrics, "\uD83D\uDD0D");
            this.statusEmojis.fallback = this.fixMojibakeEmoji(this.statusEmojis.fallback, "\uD83C\uDFB6");
            this.terminal = Object.assign(Object.assign({}, this.terminal), (settings.terminal || {}));
            this.songOffsets = Object.assign(Object.assign(Object.assign({}, this.songOffsets), (settings.songOffsets || {})), { entries: Array.isArray((_b = settings.songOffsets) === null || _b === void 0 ? void 0 : _b.entries) ? settings.songOffsets.entries : this.songOffsets.entries });
            this.profiles = Object.assign(Object.assign(Object.assign({}, this.profiles), (settings.profiles || {})), { items: Array.isArray((_c = settings.profiles) === null || _c === void 0 ? void 0 : _c.items) ? settings.profiles.items : this.profiles.items });
        }
    }
    static fixMojibakeEmoji(value, fallback) {
        const text = String(value || "");
        if (!text || text.includes("Ã") || text.includes("ðŸ"))
            return fallback;
        return text;
    }
}
exports.Settings = Settings;
Settings.credentials = {
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
};
Settings.sources = {
    enableSpotify: true,
    enableLrcLib: true,
    enableQQMusic: true,
    enableNetEase: true,
    enableGenius: false,
    enableKugou: false,
    enableMusixmatch: false,
    order: [...exports.DEFAULT_SOURCE_ORDER]
};
Settings.playback = {
    // "spotify": poll the Spotify Web API directly (needs the app credentials above).
    // "discordPresence": read your "Listening to Spotify" activity off your own Discord
    // presence instead - no Spotify app/OAuth needed, but requires being in a Discord
    // server for presence events to reach this connection, and is a little less precise
    // (see GatewayPresenceUpdater.ts for the tradeoffs).
    source: "spotify"
};
Settings.gateway = {
    enabled: false,
    presenceStatus: "online",
    minIntervalMs: 5000
};
Settings.statusFlash = {
    enabled: false,
    states: ["online", "idle", "dnd"],
    intervalMs: 2000,
    restoreStatus: ""
};
Settings.statusEmojis = {
    enabled: false,
    playing: "\uD83C\uDFB6",
    paused: "\u23F8",
    noLyrics: "\uD83D\uDD0D",
    fallback: "\uD83C\uDFB6"
};
Settings.terminal = {
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
};
Settings.songOffsets = {
    enabled: false,
    entries: []
};
Settings.profiles = {
    active: "",
    items: []
};
Settings.view = {
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
        }
    }
};
Settings.timings = {
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
    }
};
Settings.update = {
    enableAutoupdate: true
};
