# dihlyrics

Puts your Youtube videos and songs into your discord status

Fork and actively developed continuation of `lyrics-status`, expanded with YouTube support, Discord Gateway updates, Rich Presence, community profiles, customizable interfaces, terminal album art, advanced timing tools, and much more.

## What it does

dihlyrics follows what you are listening to and displays synchronized lyric lines through Discord custom status, Rich Presence, or both.

Everything runs locally and is configured through a browser panel at `http://localhost:8999`. You can control playback detection, lyric sources, timing, formatting, privacy, appearance, caching, and Discord output without manually editing configuration files.

## Features

| Feature | Details |
| --- | --- |
| Multiple lyric sources | Spotify, LrcLib, Musixmatch, QQ Music, NetEase, Genius, and Kugou |
| Source ordering | Enable, disable, and drag sources into your preferred search order |
| Spotify API playback | Detects songs, playback state, progress, album artwork, and playback speed |
| Spotify Discord Connection | Reads the Spotify account connected to Discord without requiring Spotify cookies |
| Discord presence playback | Uses the Spotify activity already displayed on your Discord profile |
| Automatic Spotify fallback | Can switch to Discord presence playback if Spotify temporarily rate-limits requests |
| YouTube support | Displays timed transcripts from regular YouTube videos through the bundled extension |
| YouTube Shorts | Detects Shorts and retrieves captions through normalized watch-video handling |
| YouTube Music | Detects YouTube Music playback and searches normal music lyric sources |
| YouTube auto-detection | Temporarily switches to YouTube when a video starts and returns to music afterward |
| Playback-speed synchronization | Keeps lyrics aligned with sped-up or slowed-down Spotify Web playback |
| YouTube transcript cache | Stores video transcripts separately using readable video and channel names |
| Discord Gateway mode | Sends real-time presence updates through the Discord Gateway WebSocket |
| REST fallback | Uses normal REST status updates when Gateway mode is unavailable |
| Custom status output | Sends lyrics through your Discord custom status |
| Rich Presence output | Displays lyrics with album artwork, song information, and playback progress |
| Two-line Rich Presence | Shows the current lyric and surrounding lyric together for a more natural display |
| Independent Rich Presence merging | Configure merging separately from custom-status line merging |
| Alternating output | Alternate between custom status and Rich Presence after configurable song counts |
| Full-listen detection | Songs only count toward alternating output after at least one minute of listening |
| Status templates | Format output with lyrics, song, artist, timestamp, source, progress, and other variables |
| Unicode fonts | Normal, bold, italic, script, fraktur, monospace, underlined, and additional styles |
| Font cycling | Rotate selected fonts by song, every line, or every chosen number of lines |
| Random font rotation | Randomly select from enabled fonts instead of following sequential order |
| Status emojis | Different emojis for playing, paused, missing lyrics, and fallback states |
| Discord emoji support | Supports normal Unicode emoji and custom Discord emoji |
| Emoji rotation | Automatically refreshes and cycles available Discord emoji |
| Status flash | Cycles Online, Idle, Do Not Disturb, and Invisible presence states |
| Smart line merging | Groups nearby short lines while keeping lyric timing and readable formatting |
| Repeated-line skipping | Avoids unnecessary Discord updates when identical lines repeat |
| Pause behavior | Choose what Discord displays while playback is paused |
| No-lyrics behavior | Keep the song visible, use custom text, clear the status, or take no action |
| Main timing offset | Shift all music lyrics earlier or later |
| Per-song offsets | Save corrections for individual songs without changing global timing |
| Per-video offsets | Save separate timing corrections for individual YouTube videos |
| Autooffset | Measures delivery timing and automatically applies synchronization corrections |
| Song and video rules | Apply custom output behavior to specific tracks, artists, channels, or videos |
| Smart privacy | Automatically hides selected artists, songs, videos, channels, or lyric content |
| Cache reloads | Recheck cached songs after a chosen number of full listens |
| Cache exemptions | Protect manually corrected or unavailable lyrics from automatic replacement |
| Undo cache | Restore the previous cache if refreshed lyrics are worse |
| Lyrics JSON converter | Convert SRT and timed lyrics into dihlyrics song or YouTube cache files |
| Three settings interfaces | Choose Classic, Modern, or the minimal Focus settings layout |
| Live lyrics sidebar | View lyrics, playback progress, album art, and controls directly in the panel |
| Community leaderboard | View opted-in dihlyrics users, their current lyrics, songs, profiles, and effects |
| Community privacy controls | Choose exactly which profile and playback details are shared |
| Dynamic Album theme | Extends colors and artwork from the current album across the settings panel |
| Dynamic Weather theme | Changes the panel background using local time and real-world weather conditions |
| Panel customization | Adjustable transparency, themes, draggable tabs, widgets, and settings sections |
| Terminal dashboard | Displays songs, lyrics, sources, Gateway state, timing, and optional diagnostics |
| Terminal album artwork | Renders album covers using ANSI or terminal image support where available |
| Terminal presets | Dashboard, Compact, Karaoke, and Ops layouts |
| Profiles | Save and apply complete groups of settings for different setups |
| Built-in tutorial | Interactive first-launch walkthrough with highlighted settings |
| Help center | Includes setup instructions for Discord, Spotify, YouTube, timing, and troubleshooting |
| Active-user counter | Displays how many opted-in dihlyrics clients are currently running |
| Optional Equicord tools | Build and inject the included Equicord integration from the settings panel |
| Automatic setup | Windows launcher can install a local Node.js runtime and required dependencies |
| Windows and macOS builds | Separate platform-friendly launchers and packaged files |
| Release updater | Checks GitHub releases and installs newer dihlyrics versions |
