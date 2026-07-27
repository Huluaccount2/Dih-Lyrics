import { PlaybackState } from "./PlaybackState"
import { LyricsFetcher } from "./LyricsFetcher"
import { GatewayPresenceClient } from "./GatewayPresenceClient"
import { Settings } from "./Settings"
import { Debug } from "./Debug"

// Same role as PlaybackStateUpdater, but sourced from your Discord "Listening to Spotify"
// presence instead of polling the Spotify Web API. Useful if you don't want to register a
// Spotify app / manage OAuth at all - if Discord can already show you're listening to
// something, this reads that instead.
//
// Tradeoffs vs the Spotify API source, worth knowing:
//   - Requires you to be in at least one Discord server for presence events to reach this
//     connection (that's just how presence delivery works, nothing this app controls).
//   - Discord's Spotify activity data is itself intermittently a few seconds behind actual
//     playback, and Discord silently drops the activity a couple minutes into some tracks
//     for accounts without Nitro in certain cases - if lyrics seem to lag or vanish, that's
//     Discord's own presence data, not a bug here.
//   - No pause/seek granularity: Discord doesn't send an explicit "paused" event, so a pause
//     shows up as the activity disappearing entirely rather than isPlaying flipping to false
//     mid-song.
export class DiscordPresenceUpdater {
    public playbackState: PlaybackState
    public lyricsFetcher: LyricsFetcher
    public connected = false

    private client: GatewayPresenceClient
    private pendingSongId: string | null = null

    constructor(playbackState: PlaybackState, lyricsFetcher: LyricsFetcher, token: string) {
        this.playbackState = playbackState
        this.lyricsFetcher = lyricsFetcher

        this.client = new GatewayPresenceClient(token)
        this.client.onSpotifyActivity = (activity) => this.handleActivity(activity)
        this.client.onConnectedChange = (connected) => {
            this.connected = connected
            Debug.write(`[DiscordPresence] ${connected ? "Connected" : "Disconnected"}`)
        }
        this.client.connect()
    }

    public stop(): void {
        this.client.disconnect()
    }

    private handleActivity(activity: {
        songId: string
        name: string
        artist: string
        album: string
        albumArtUrl: string
        startTimestamp: number
        endTimestamp: number
    } | null): void {
        const state = this.playbackState

        if (!activity) {
            // Discord dropped the Spotify activity - most likely paused/stopped. Keep the
            // last known song info in place (matches how the Spotify-poll source behaves
            // when playback pauses) and just stop advancing progress.
            state.isPlaying = false

            return
        }

        const changed = state.songId !== activity.songId

        if (changed) {
            state.songName = activity.name
            state.songAuthor = activity.artist
            state.albumName = activity.album
            state.albumArtUrl = activity.albumArtUrl
            state.oldSongId = state.songId
            state.songId = activity.songId
            state.songDuration = Math.max(0, activity.endTimestamp - activity.startTimestamp)
            state.needsLineReset = true
            state.currentLine = null

            this.pendingSongId = activity.songId
        }

        state.songProgress = Date.now() - activity.startTimestamp
        state.isPlaying = true
    }

    // Called on the same tick interval as PlaybackStateUpdater.update() so index.ts doesn't
    // need two different loop shapes. Presence updates arrive over the gateway connection in
    // the background; this only handles the lyric fetch once a new song has actually shown up.
    public async update(): Promise<void> {
        if (!this.pendingSongId) return
        if (this.pendingSongId !== this.playbackState.songId) return // superseded already

        this.pendingSongId = null

        const state = this.playbackState

        state.lyrics = await this.lyricsFetcher.fetchLyrics(state.songName, state.songAuthor)
        state.hasLyrics = !!state.lyrics
    }
}
