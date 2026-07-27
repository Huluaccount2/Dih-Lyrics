# dihlyrics

Real-time Spotify lyrics -> Discord custom status

Fork/continuation of `lyrics-status`, expanded with WebSocket status updates, a richer settings panel, terminal album art, profiles, status effects, and per-song timing tools.

## What it does

dihlyrics syncs your Discord custom status to the lyrics of your currently playing Spotify track, line by line.

It runs locally, opens a browser settings panel at `http://localhost:8999`, fetches lyrics from multiple sources, and updates your Discord status as the song plays. You can tune timing, sources, WebSocket behavior, terminal display, status formatting, emoji behavior, and profiles without editing config files manually.

## Features

| Feature | Details |
| --- | --- |
| Multiple lyric sources | Spotify, LrcLib, Musixmatch, QQ Music, NetEase, Genius, Kugou |
| Source ordering | Toggle and drag lyric sources in the panel |
| Spotify playback | Supports Spotify API playback detection |
| Discord presence playback | Can read Spotify playback from Discord presence instead of Spotify API |
| Discord Gateway mode | Sends status updates through Discord Gateway WebSocket when enabled |
| REST fallback | Falls back to the normal REST status update path if Gateway is unavailable |
| Status flash | Cycles Discord presence states while lyrics are active |
| Presence controls | Online, Idle, Do Not Disturb, Invisible, and restore behavior |
| Custom status templates | Use variables like lyrics, timestamp, song name, and artist |
| Unicode font styles | Normal, bold, italic, script, fraktur, monospace, underline, and more |
| Emoji support | Static emoji, custom Discord emoji, emoji picker, and emoji rotation |
| Status emojis | Different emoji behavior for playing, paused, no lyrics, and fallback states |
| Smart line merging | Combines short nearby lyric lines to reduce update spam |
| Rate-limit protection | Minimum send interval, backoff handling, and merge controls |
| Per-song offsets | Save timing offsets for specific songs that need adjustment |
| Autooffset | Learns request timing and applies correction automatically |
| Terminal dashboard | Live terminal view with song, lyrics, sources, Gateway, rate limits, and debug info |
| Album art terminal display | Shows album cover as terminal art, with improved rendering where supported |
| Terminal presets | Dashboard, Compact, Karaoke, and Ops terminal layouts |
| Profiles | Save and apply groups of settings for different setups |
| Live panel | Browser UI with now-playing sidebar, lyric preview, settings, and playback controls |
| Restart button | Restart Lyric Status from the panel |

## Status template variables

```txt
{lyrics}
{lyrics_upper}
{lyrics_lower}
{lyrics_letters_only}

{timestamp}

{song_name}
{song_name_upper}
{song_name_lower}
{song_name_cropped}

{song_author}
{song_author_upper}
{song_author_lower}
