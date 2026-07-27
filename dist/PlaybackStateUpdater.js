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
exports.PlaybackStateUpdater = void 0;
const SpotifyService_1 = require("./SpotifyService");
const Settings_1 = require("./Settings");
const ExternalAuthServerAPI_1 = require("./ExternalAuthServerAPI");
const Debug_1 = require("./Debug");
class PlaybackStateUpdater {
    constructor(playbackState, lyricsFetcher) {
        this.playbackState = playbackState;
        this.lyricsFetcher = lyricsFetcher;
        this.rateLimitedUntil = 0;
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            if (Date.now() < this.rateLimitedUntil)
                return;
            const roundTripTimeStart = Date.now();
            // Fetch current playback from Spotify
            const request = yield fetch("https://api.spotify.com/v1/me/player", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + SpotifyService_1.SpotifyService.token,
                },
            });
            // Handle auth/refresh
            if (request.status === 401 || request.status === 400) {
                if ((_a = Settings_1.Settings.credentials) === null || _a === void 0 ? void 0 : _a.useExternalAuthServer) {
                    SpotifyService_1.SpotifyService.token = (yield ExternalAuthServerAPI_1.ExternalAuthServerAPI.getToken()) || "";
                }
                else {
                    yield SpotifyService_1.SpotifyService.refresh();
                }
                return; // try again on next tick
            }
            if (request.status === 429) {
                const retryAfterSeconds = parseInt(request.headers.get("retry-after") || "2", 10);
                this.rateLimitedUntil = Date.now() + Math.max(1, retryAfterSeconds) * 1000;
                Debug_1.Debug.write(`PLAYBACK POLL RATE LIMITED: backing off for ${retryAfterSeconds}s`);
                return;
            }
            if (request.status !== 200) {
                return; // nothing to do
            }
            const json = (yield request.json());
            const item = json.item;
            if (!item)
                return;
            const playbackState = this.playbackState;
            const previousProgress = playbackState.songProgress;
            const wasSameSong = playbackState.songId === item.id;
            // account for network latency so progress stays smooth
            const newProgress = json.progress_ms + (Date.now() - roundTripTimeStart);
            // A rewind/seek backward (or replaying the same song from the start) leaves stale
            // "already sent" lines behind that would otherwise silently block lyrics from
            // reappearing until playback passes the point it previously reached. A small
            // threshold avoids false positives from normal polling/network jitter.
            if (wasSameSong && newProgress < previousProgress - 1500) {
                playbackState.needsLineReset = true;
            }
            playbackState.songProgress = newProgress;
            playbackState.isPlaying = json.is_playing;
            // Detect song change
            if (playbackState.songId !== item.id) {
                // IMPORTANT: keep parentheses; DO NOT strip with a regex.
                // This preserves titles like "Enough (Live)" so the correct lyrics can be fetched.
                playbackState.songName = item.name; // ← parentheses fix (no )
                playbackState.songAuthor = (item.artists && ((_b = item.artists[0]) === null || _b === void 0 ? void 0 : _b.name)) || "";
                playbackState.albumName = ((_c = item.album) === null || _c === void 0 ? void 0 : _c.name) || "";
                playbackState.albumArtUrl = ((_f = (_e = (_d = item.album) === null || _d === void 0 ? void 0 : _d.images) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.url) || "";
                playbackState.oldSongId = playbackState.songId;
                playbackState.songId = item.id;
                playbackState.songDuration = item.duration_ms;
                // Fetch lyrics using the exact title with parentheses intact
                playbackState.lyrics = yield this.lyricsFetcher.fetchLyrics(playbackState.songName, playbackState.songAuthor);
                playbackState.currentLine = null;
                playbackState.hasLyrics = !!playbackState.lyrics;
                playbackState.needsLineReset = true;
            }
            // Safety: if we switched songs and hadn't yet fetched correct lyrics,
            // re-fetch to ensure we’re synced to the exact (Live) vs studio version.
            if (this.lyricsFetcher.lastFetchedFor !==
                playbackState.songName + playbackState.songAuthor) {
                playbackState.lyrics = yield this.lyricsFetcher.fetchLyrics(playbackState.songName, playbackState.songAuthor);
                playbackState.hasLyrics = !!playbackState.lyrics;
            }
        });
    }
}
exports.PlaybackStateUpdater = PlaybackStateUpdater;
