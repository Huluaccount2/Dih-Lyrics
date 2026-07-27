# Changelog

## 3.4.2

The real fix for the cover-clipping/drifting-background issue - 3.4.1 improved things but didn't get the actual cause.

Root cause: the auto-scroll-to-current-line code used `element.scrollIntoView({ block: "center" })`. That method is allowed to scroll *any* scrollable ancestor to bring its target into view - and critically, an element with `overflow: hidden` still counts as scrollable for this purpose, even though users can't scroll it by hand. So every time the current lyric line changed, `scrollIntoView` was reaching past the lyrics list and scrolling `#now-playing-sidebar` itself - which is exactly what dragged the album cover, title, and backdrop out of place and left blank space below.

Fixed by replacing `scrollIntoView` with a direct scroll calculation against the lyrics list's own `scrollTop` - it now physically cannot touch anything outside the lyrics list, ancestor or not.

Verified by forcing the current line to jump (the exact trigger for the bug) and confirming the sidebar/cover/title's on-screen position is pixel-identical before and after - not just eyeballing a screenshot.

Also: removed the "Spotify returned ___" popup on playback control errors (previous/play-pause/next). Failures are now silent (logged to the browser console only) instead of interrupting with a dialog.

## 3.4.1

Fixed a real bug in the Now Playing sidebar from 3.4.0: the album cover and song name could get clipped, and scrolling through lyrics would drag the whole sidebar (backdrop included) instead of just scrolling the lyrics list, leaving blank space below once you scrolled past it.

Root cause: `#np-content` was sized with `height: 100%`, but its parent never actually had a definite height for that percentage to resolve against - it only had a fixed *width* (`flex: 0 0 300px`), not a height. With no real height to anchor to, the lyrics list never got capped, just kept growing to fit all the lyrics at once, and dragged everything else in the sidebar along with it once it overflowed. Replaced the percentage-height chain with a proper nested flex layout (`flex: 1 1 auto` + `min-height: 0` at every level) so the lyrics list is now the only thing that scrolls, and it's actually bounded.

Also added:
- A responsive layout for narrow screens (sidebar stacks above the settings instead of squeezing into a fixed 300px column) - this was going to be broken on mobile regardless of the bug above.
- Scroll containment (`overscroll-behavior: contain`) so scrolling the lyrics list can't leak/chain into scrolling anything else, on touch devices in particular.

Verified this one with actual rendering (headless Chrome) at both desktop and mobile viewport sizes, stress-tested with 40 lyric lines, before packaging - not just read through the CSS.

## 3.4.0

The last two items on the list: a cookie-based Spotify auth option, and the Now Playing sidebar.

### Added
- **Cookie-based Spotify auth.** General tab → Connection → "Spotify auth method" now lets you pick "Cookie (sp_dc)" instead of the app-based flow. Paste your `sp_dc` cookie from a logged-in open.spotify.com session and there's nothing else to register or authorize. Uses Spotify's internal `get_access_token` endpoint - same category of "reverse-engineered but widely used" trick as the Musixmatch token elsewhere in this app. A "Check" button verifies it's working and shows how long the resulting token is valid for. The original app-based (Client ID/Secret) method is still there and still the default - this is an alternative, not a replacement.
- **Now Playing sidebar.** Permanent panel on the left of the settings UI (all tabs). Shows a blurred/gradient backdrop pulled from the album art, the cover itself, song name, artist, elapsed/total time with a progress bar, playback controls (previous/play-pause/next), and the lyrics scrolling below with the current line highlighted - same idea as Spotify's own now-playing view. Updates live over the existing panel WebSocket, no polling from the browser side.
- **Playback controls actually control playback** - the prev/play-pause/next buttons hit real Spotify Web API endpoints (`/me/player/play|pause|next|previous`). Only enabled when the playback source is set to Spotify API (grayed out under Discord presence, since that source is read-only and there's nothing to send control commands through). If you're using the App auth method, re-authorize once to pick up the new `user-modify-playback-state` scope the buttons need - Cookie auth doesn't need this since the cookie-derived token already carries full web-player control.

### Notes
- The Now Playing sidebar takes over the space in the panel that used to just be empty next to the tabs - nothing else moved, tabs work the same as before.
- If Discord's presence data doesn't include album art for some reason, the sidebar just doesn't show a backdrop/cover - text and lyrics still display fine either way.

## 3.3.0

Discord Rich Presence as a song source.

### Added
- **Playback source toggle** (General tab): choose between "Spotify API" (existing behavior - polls Spotify directly) and "Discord presence" (new - reads your "Listening to Spotify" activity off your own Discord presence instead).
- `GatewayPresenceClient.ts` - a plain, read-only Discord gateway connection used only to receive your own presence updates. It identifies honestly as itself, never sends status/presence writes over this connection (status is still set the same way it always was, via the existing REST call), and doesn't do any traffic-shaping/timing tricks - heartbeats run on the fixed interval Discord's own Hello payload specifies, per the protocol spec.
- `GatewayPresenceUpdater.ts` - wires that gateway connection's Spotify activity data into the same `PlaybackState`/lyrics pipeline the Spotify-poll source uses, so nothing else in the app needed to change to support it.

### Worth knowing before turning this on
- You need to be in at least one Discord server - presence events won't reach a connection that isn't in any shared server.
- Discord's own Spotify activity data can run a few seconds behind actual playback, and isn't always kept perfectly current by Discord itself.
- No explicit "paused" event exists in presence data - a pause shows up as the activity disappearing rather than a clean paused state, so paused playback will just stop advancing rather than showing "paused."
- This is unrelated to (and doesn't replace) the WebSocket rate-limit-bypass approach that was intentionally left out of this project - that one spoofs a client identity specifically to evade Discord's automation detection when *writing* status updates. This one only *reads* your own presence, identifies honestly, and doesn't touch how status gets sent at all.

## 3.2.0

Three of the six items from the latest list - fonts, backoff duration, and a proper launcher. The rest (Discord Rich Presence as a song source, the Spotify cookie flow, and the Now Playing widget) are bigger builds and are coming in a follow-up.

### Added
- **Font styles.** Status display tab has a Font dropdown - Bold, Italic, Script, Fraktur, Monospace, Double-struck, Underline, Strikethrough, and combinations like Bold Italic. Discord doesn't support real fonts in a status, so this works by remapping your letters onto different Unicode blocks that render as different-looking type - the same trick "fancy text" generators use. Applies live, with a preview in the panel.
- **Configurable backoff duration.** `Settings.timings.rateLimit.backoffDurationMs` (default 30000). When Discord rate-limits a status update, Lyric Status now waits at least this long before trying again - Discord's own `retry_after` is always respected too, whichever is longer wins. Editable from the Timings & Merging tab.
- **`start.bat`.** Double-click to run instead of opening a terminal and typing commands manually. First run auto-installs dependencies and builds if needed. Keeps the same live console dashboard (song/playback/rate-limit status) the terminal always showed - the window doesn't just vanish if the app exits, so crash output stays visible, and there's a restart prompt.

## 3.1.0

New lyric sources, and control over which ones get used and in what order.

### Added
- **Genius** as a lyric source. No API key needed - it scrapes the public lyrics page. Not time-synced (Genius doesn't provide timestamps), so lines are spaced out at a fixed rate and can drift out of sync on longer songs. Off by default.
- **Kugou** as a lyric source. Another fallback, mostly useful for Chinese-language tracks. Off by default.
- **Musixmatch** as a lyric source, via `@stef-0012/synclyrics`. It's time-synced. Musixmatch requires a "usertoken" to use its API - one is generated automatically the first time Musixmatch is used and saved to `settings.json`, nothing to configure by hand. Off by default.
- **Sources tab** in the settings panel:
  - Enable/disable any source with a checkbox.
  - Drag and drop to reorder sources. Sources are tried top to bottom - the first one that returns lyrics for the current song wins, and anything unchecked is skipped entirely.
  - A "Clear saved token" button for Musixmatch, in case the saved token ever goes stale and needs to be regenerated.

### Changed
- Source list is no longer hardcoded in `index.ts` - it's built from the Sources tab settings (`Settings.sources.order` + the per-source `enable*` flags) at startup.
- `settings.json` gained a `sources` block. Existing installs will get sensible defaults on first load (Spotify, LrcLib, QQ Music, and NetEase enabled like before; Genius, Kugou, and Musixmatch off until turned on).

### Not included
- The gateway/WebSocket presence trick some forks use to bypass Discord's REST rate limits by spoofing a mobile client's identity. That specifically evades Discord's anti-automation protections and puts the account it's used on at risk, so it wasn't ported here.
