import { LyricsFetcher } from "./LyricsFetcher"
import { BaseSource } from "./Sources/BaseSource"
import { SpotifySource} from "./Sources/SpotifySource"
import { NetEaseMusicSource } from "./Sources/NetEaseMusicSource"
import { LrcLibSource } from "./Sources/LrcLibSource"
import { QQMusicSource } from "./Sources/QQMusicSource"
import { GeniusSource } from "./Sources/GeniusSource"
import { KugouSource } from "./Sources/KugouSource"
import { MusixmatchSource } from "./Sources/MusixmatchSource"
import { PlaybackStateUpdater } from "./PlaybackStateUpdater"
import { DiscordPresenceUpdater } from "./GatewayPresenceUpdater"
import { PlaybackState } from "./PlaybackState"
import { StatusChanger } from "./StatusChanger"
import { Debug } from "./Debug"
import { startServer } from "./Panel/Server"
import { Settings } from "./Settings"
import { Updater } from "./Updater"
import { SpotifyService } from "./SpotifyService"
import { v4 as uuidv4 } from "uuid"
import { ExternalAuthServerAPI } from "./ExternalAuthServerAPI"
import { GatewayStatusClient } from "./GatewayStatusClient"
import { TerminalRenderer } from "./TerminalRenderer"

Settings.load()

if (Settings.update.enableAutoupdate) {
    Updater.tryUpdate()
        .then(() => {
            init()
        })
        .catch((e) => {
            Debug.write("LyricsStatus failed to update. Error: " + e.stack)

            init()
        })
} else {
    init()
}

function init(): void {
    if (!Settings.credentials.uuid) {
        Settings.credentials.uuid = uuidv4()

        Settings.save()
    }
    ExternalAuthServerAPI.register()

    SpotifyService.refresh()

    const lyricsFetcher = new LyricsFetcher()

    // Sources are built in the order (and only for the ones) the user picked in the
    // Sources tab of the panel. Anything not enabled there is skipped entirely so it
    // never gets touched during playback.
    const sourceRegistry: Record<string, { enabled: boolean; make: () => BaseSource }> = {
        LrcLib:     { enabled: Settings.sources.enableLrcLib,     make: () => new LrcLibSource() },
        Spotify:    { enabled: Settings.sources.enableSpotify,    make: () => new SpotifySource() },
        QQMusic:    { enabled: Settings.sources.enableQQMusic,    make: () => new QQMusicSource() },
        NetEase:    { enabled: Settings.sources.enableNetEase,    make: () => new NetEaseMusicSource() },
        Musixmatch: { enabled: Settings.sources.enableMusixmatch, make: () => new MusixmatchSource() },
        Genius:     { enabled: Settings.sources.enableGenius,     make: () => new GeniusSource() },
        Kugou:      { enabled: Settings.sources.enableKugou,      make: () => new KugouSource() }
    }

    for (const name of Settings.sources.order) {
        const entry = sourceRegistry[name]

        if (!entry || !entry.enabled) continue

        lyricsFetcher.addSource(entry.make())
    }

    if (!lyricsFetcher.sources.length) {
        Debug.write("No lyrics sources are enabled - falling back to LrcLib so something works.")
        lyricsFetcher.addSource(new LrcLibSource())
    }

    const playbackState = new PlaybackState()

    const playbackStateUpdater: { update(): Promise<void> } =
        Settings.playback.source === "discordPresence"
            ? new DiscordPresenceUpdater(playbackState, lyricsFetcher, Settings.credentials.token)
            : new PlaybackStateUpdater(playbackState, lyricsFetcher)

    const gatewayStatusClient = new GatewayStatusClient()
    if (Settings.gateway.enabled) gatewayStatusClient.connect()

    const statusChanger = new StatusChanger(playbackState, gatewayStatusClient)
    const terminalRenderer = new TerminalRenderer()

    const pollPlayback = async (): Promise<void> => {
        try {
            await playbackStateUpdater.update()
        } catch (e) {
            Debug.write(`PLAYBACK POLL CRASH: ${(e as Error)?.stack || e}`)
        }

        setTimeout(() => void pollPlayback(), Math.max(250, Settings.timings.playbackPollInterval || 1000))
    }

    void pollPlayback()

    let now = Date.now()
    setInterval(() => {
        statusChanger.changeStatus()

        playbackState.songProgress += Date.now() - now

        if (playbackState.ended) statusChanger.songChanged()

        terminalRenderer.render({
            playbackState,
            lyricsFetcher,
            statusChanger,
            gatewayStatusClient
        })

        now = Date.now()
    }, 1000 / 60)

    startServer(playbackState, () => gatewayStatusClient.getDebugState(), () => statusChanger.getEffectiveOffset())
}

process.on("uncaughtException", (e) => {
    Debug.write(e.stack + "\n" + e.cause)

    if (!e.message.includes("fetch failed")) {
        process.exit(1)
    }
})
