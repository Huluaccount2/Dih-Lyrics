import { PlaybackState } from "./PlaybackState";
import { LyricsFetcher } from "./LyricsFetcher";
import { SpotifyService } from "./SpotifyService";
import { Settings } from "./Settings";
import { ExternalAuthServerAPI } from "./ExternalAuthServerAPI";
import { Debug } from "./Debug";

interface PlaybackResponse {
  item: {
    name: string;
    id: string;
    artists: { name: string }[];
    duration_ms: number;
    album: {
      name: string;
      images: { url: string; width: number; height: number }[];
    } | null;
  } | null;
  progress_ms: number;
  is_playing: boolean;
}

export class PlaybackStateUpdater {
  public playbackState: PlaybackState;
  public lyricsFetcher: LyricsFetcher;
  public rateLimitedUntil: number;

  constructor(playbackState: PlaybackState, lyricsFetcher: LyricsFetcher) {
    this.playbackState = playbackState;
    this.lyricsFetcher = lyricsFetcher;
    this.rateLimitedUntil = 0;
  }

  public async update(): Promise<void> {
    if (Date.now() < this.rateLimitedUntil) return;

    const roundTripTimeStart = Date.now();

    // Fetch current playback from Spotify
    const request = await fetch("https://api.spotify.com/v1/me/player", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + SpotifyService.token,
      },
    });

    // Handle auth/refresh
    if (request.status === 401 || request.status === 400) {
      if (Settings.credentials?.useExternalAuthServer) {
        SpotifyService.token = (await ExternalAuthServerAPI.getToken()) || "";
      } else {
        await SpotifyService.refresh();
      }
      return; // try again on next tick
    }

    if (request.status === 429) {
      const retryAfterSeconds = parseInt(request.headers.get("retry-after") || "2", 10);
      this.rateLimitedUntil = Date.now() + Math.max(1, retryAfterSeconds) * 1000;
      Debug.write(`PLAYBACK POLL RATE LIMITED: backing off for ${retryAfterSeconds}s`);
      return;
    }

    if (request.status !== 200) {
      return; // nothing to do
    }

    const json = (await request.json()) as PlaybackResponse;
    const item = json.item;
    if (!item) return;

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
      playbackState.songAuthor = (item.artists && item.artists[0]?.name) || "";
      playbackState.albumName = item.album?.name || "";
      playbackState.albumArtUrl = item.album?.images?.[0]?.url || "";
      playbackState.oldSongId = playbackState.songId;
      playbackState.songId = item.id;
      playbackState.songDuration = item.duration_ms;

      // Fetch lyrics using the exact title with parentheses intact
      playbackState.lyrics = await this.lyricsFetcher.fetchLyrics(
        playbackState.songName,
        playbackState.songAuthor
      );
      playbackState.currentLine = null;
      playbackState.hasLyrics = !!playbackState.lyrics;
      playbackState.needsLineReset = true;
    }

    // Safety: if we switched songs and hadn't yet fetched correct lyrics,
    // re-fetch to ensure we’re synced to the exact (Live) vs studio version.
    if (
      this.lyricsFetcher.lastFetchedFor !==
      playbackState.songName + playbackState.songAuthor
    ) {
      playbackState.lyrics = await this.lyricsFetcher.fetchLyrics(
        playbackState.songName,
        playbackState.songAuthor
      );
      playbackState.hasLyrics = !!playbackState.lyrics;
    }
  }
}
