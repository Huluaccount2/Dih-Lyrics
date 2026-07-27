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
Object.defineProperty(exports, "__esModule", { value: true });
const LyricsFetcher_1 = require("./LyricsFetcher");
const SpotifySource_1 = require("./Sources/SpotifySource");
const NetEaseMusicSource_1 = require("./Sources/NetEaseMusicSource");
const LrcLibSource_1 = require("./Sources/LrcLibSource");
const QQMusicSource_1 = require("./Sources/QQMusicSource");
const GeniusSource_1 = require("./Sources/GeniusSource");
const KugouSource_1 = require("./Sources/KugouSource");
const MusixmatchSource_1 = require("./Sources/MusixmatchSource");
const PlaybackStateUpdater_1 = require("./PlaybackStateUpdater");
const GatewayPresenceUpdater_1 = require("./GatewayPresenceUpdater");
const PlaybackState_1 = require("./PlaybackState");
const StatusChanger_1 = require("./StatusChanger");
const Debug_1 = require("./Debug");
const Server_1 = require("./Panel/Server");
const Settings_1 = require("./Settings");
const Updater_1 = require("./Updater");
const SpotifyService_1 = require("./SpotifyService");
const uuid_1 = require("uuid");
const ExternalAuthServerAPI_1 = require("./ExternalAuthServerAPI");
const GatewayStatusClient_1 = require("./GatewayStatusClient");
const TerminalRenderer_1 = require("./TerminalRenderer");
Settings_1.Settings.load();
if (Settings_1.Settings.update.enableAutoupdate) {
    Updater_1.Updater.tryUpdate()
        .then(() => {
        init();
    })
        .catch((e) => {
        Debug_1.Debug.write("LyricsStatus failed to update. Error: " + e.stack);
        init();
    });
}
else {
    init();
}
function init() {
    if (!Settings_1.Settings.credentials.uuid) {
        Settings_1.Settings.credentials.uuid = (0, uuid_1.v4)();
        Settings_1.Settings.save();
    }
    ExternalAuthServerAPI_1.ExternalAuthServerAPI.register();
    SpotifyService_1.SpotifyService.refresh();
    const lyricsFetcher = new LyricsFetcher_1.LyricsFetcher();
    // Sources are built in the order (and only for the ones) the user picked in the
    // Sources tab of the panel. Anything not enabled there is skipped entirely so it
    // never gets touched during playback.
    const sourceRegistry = {
        LrcLib: { enabled: Settings_1.Settings.sources.enableLrcLib, make: () => new LrcLibSource_1.LrcLibSource() },
        Spotify: { enabled: Settings_1.Settings.sources.enableSpotify, make: () => new SpotifySource_1.SpotifySource() },
        QQMusic: { enabled: Settings_1.Settings.sources.enableQQMusic, make: () => new QQMusicSource_1.QQMusicSource() },
        NetEase: { enabled: Settings_1.Settings.sources.enableNetEase, make: () => new NetEaseMusicSource_1.NetEaseMusicSource() },
        Musixmatch: { enabled: Settings_1.Settings.sources.enableMusixmatch, make: () => new MusixmatchSource_1.MusixmatchSource() },
        Genius: { enabled: Settings_1.Settings.sources.enableGenius, make: () => new GeniusSource_1.GeniusSource() },
        Kugou: { enabled: Settings_1.Settings.sources.enableKugou, make: () => new KugouSource_1.KugouSource() }
    };
    for (const name of Settings_1.Settings.sources.order) {
        const entry = sourceRegistry[name];
        if (!entry || !entry.enabled)
            continue;
        lyricsFetcher.addSource(entry.make());
    }
    if (!lyricsFetcher.sources.length) {
        Debug_1.Debug.write("No lyrics sources are enabled - falling back to LrcLib so something works.");
        lyricsFetcher.addSource(new LrcLibSource_1.LrcLibSource());
    }
    const playbackState = new PlaybackState_1.PlaybackState();
    const playbackStateUpdater = Settings_1.Settings.playback.source === "discordPresence"
        ? new GatewayPresenceUpdater_1.DiscordPresenceUpdater(playbackState, lyricsFetcher, Settings_1.Settings.credentials.token)
        : new PlaybackStateUpdater_1.PlaybackStateUpdater(playbackState, lyricsFetcher);
    const gatewayStatusClient = new GatewayStatusClient_1.GatewayStatusClient();
    if (Settings_1.Settings.gateway.enabled)
        gatewayStatusClient.connect();
    const statusChanger = new StatusChanger_1.StatusChanger(playbackState, gatewayStatusClient);
    const terminalRenderer = new TerminalRenderer_1.TerminalRenderer();
    const pollPlayback = () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield playbackStateUpdater.update();
        }
        catch (e) {
            Debug_1.Debug.write(`PLAYBACK POLL CRASH: ${(e === null || e === void 0 ? void 0 : e.stack) || e}`);
        }
        setTimeout(() => void pollPlayback(), Math.max(250, Settings_1.Settings.timings.playbackPollInterval || 1000));
    });
    void pollPlayback();
    let now = Date.now();
    setInterval(() => {
        statusChanger.changeStatus();
        playbackState.songProgress += Date.now() - now;
        if (playbackState.ended)
            statusChanger.songChanged();
        terminalRenderer.render({
            playbackState,
            lyricsFetcher,
            statusChanger,
            gatewayStatusClient
        });
        now = Date.now();
    }, 1000 / 60);
    (0, Server_1.startServer)(playbackState, () => gatewayStatusClient.getDebugState(), () => statusChanger.getEffectiveOffset());
}
process.on("uncaughtException", (e) => {
    Debug_1.Debug.write(e.stack + "\n" + e.cause);
    if (!e.message.includes("fetch failed")) {
        process.exit(1);
    }
});
