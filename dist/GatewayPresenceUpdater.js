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
exports.DiscordPresenceUpdater = void 0;
const GatewayPresenceClient_1 = require("./GatewayPresenceClient");
const Debug_1 = require("./Debug");
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
class DiscordPresenceUpdater {
    constructor(playbackState, lyricsFetcher, token) {
        this.connected = false;
        this.pendingSongId = null;
        this.playbackState = playbackState;
        this.lyricsFetcher = lyricsFetcher;
        this.client = new GatewayPresenceClient_1.GatewayPresenceClient(token);
        this.client.onSpotifyActivity = (activity) => this.handleActivity(activity);
        this.client.onConnectedChange = (connected) => {
            this.connected = connected;
            Debug_1.Debug.write(`[DiscordPresence] ${connected ? "Connected" : "Disconnected"}`);
        };
        this.client.connect();
    }
    stop() {
        this.client.disconnect();
    }
    handleActivity(activity) {
        const state = this.playbackState;
        if (!activity) {
            // Discord dropped the Spotify activity - most likely paused/stopped. Keep the
            // last known song info in place (matches how the Spotify-poll source behaves
            // when playback pauses) and just stop advancing progress.
            state.isPlaying = false;
            return;
        }
        const changed = state.songId !== activity.songId;
        if (changed) {
            state.songName = activity.name;
            state.songAuthor = activity.artist;
            state.albumName = activity.album;
            state.albumArtUrl = activity.albumArtUrl;
            state.oldSongId = state.songId;
            state.songId = activity.songId;
            state.songDuration = Math.max(0, activity.endTimestamp - activity.startTimestamp);
            state.needsLineReset = true;
            state.currentLine = null;
            this.pendingSongId = activity.songId;
        }
        state.songProgress = Date.now() - activity.startTimestamp;
        state.isPlaying = true;
    }
    // Called on the same tick interval as PlaybackStateUpdater.update() so index.ts doesn't
    // need two different loop shapes. Presence updates arrive over the gateway connection in
    // the background; this only handles the lyric fetch once a new song has actually shown up.
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.pendingSongId)
                return;
            if (this.pendingSongId !== this.playbackState.songId)
                return; // superseded already
            this.pendingSongId = null;
            const state = this.playbackState;
            state.lyrics = yield this.lyricsFetcher.fetchLyrics(state.songName, state.songAuthor);
            state.hasLyrics = !!state.lyrics;
        });
    }
}
exports.DiscordPresenceUpdater = DiscordPresenceUpdater;
