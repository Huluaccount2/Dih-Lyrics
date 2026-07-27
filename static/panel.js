$(`
<div id="menu-UI">
    <div id="menu-header">
        <div id="app-title"><span id="app-title-accent">dih</span>lyrics</div>
        <div id="menu-tabs">
            <button id="settings-tab-button" class="tab-button">General</button>
            <button id="websocket-tab-button" class="tab-button">WebSocket</button>
            <button id="terminal-tab-button" class="tab-button">Terminal</button>
            <button id="status-tab-button" class="tab-button">Status &amp; Emoji</button>
            <button id="profiles-tab-button" class="tab-button">Profiles</button>
            <button id="timings-tab-button" class="tab-button">Timings &amp; Merging</button>
            <button id="sources-tab-button" class="tab-button">Sources</button>
        </div>
    </div>
    <div id="menu-contents">
        <div id="now-playing-sidebar">
            <div id="np-backdrop"></div>
            <div id="np-backdrop-overlay"></div>
            <div id="np-content">
                <div id="np-empty">Nothing playing right now</div>
                <div id="np-playing" class="hid">
                    <img id="np-cover" src="" alt="">
                    <div id="np-title"></div>
                    <div id="np-artist"></div>
                    <div id="np-progress-row">
                        <span id="np-time-elapsed">0:00</span>
                        <div id="np-progress-track"><div id="np-progress-fill"></div></div>
                        <span id="np-time-total">0:00</span>
                    </div>
                    <div id="np-controls">
                        <button id="np-prev" class="np-control-btn" title="Previous">⏮</button>
                        <button id="np-playpause" class="np-control-btn np-control-btn-main" title="Play/Pause">⏸</button>
                        <button id="np-next" class="np-control-btn" title="Next">⏭</button>
                    </div>
                    <div id="np-lyrics"></div>
                </div>
            </div>
        </div>
        <div id="tab-area">
        <div id="settings-tab" class="tab-content act">
            <div class="settings-grid">
            <div class="settings">
                <span class="settings-name">Connection</span>
                <div class="option">
                    <label for="user-token">Token:</label>
                    <input type="text" id="user-token" class="text-input1">
                    <button id="check-token" class="button1">Check</button>
                </div>
                <div class="option">
                    <label for="spotify-auth-method">
                        Spotify auth method:
                        <img id="spotify-auth-method-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                    </label>
                    <select id="spotify-auth-method">
                        <option value="app">App (Client ID/Secret)</option>
                        <option value="cookie">Cookie (sp_dc)</option>
                    </select>
                </div>
                <div id="spotify-app-fields" class="sub-settings act">
                <div class="option">
                    <label for="client-id">Client ID:</label>
                    <input type="text" id="client-id" class="text-input1">
                </div>
                <div class="option">
                    <label for="client-secret">Client secret:</label>
                    <input type="text" id="client-secret" class="text-input1">
                </div>
                <div class="option">
                    <label for="custom-redirect-uri">Type your redirect URI that you added to your app:</label>
                    <input type="text" id="custom-redirect-uri" class="text-input1">
                </div>
                <div class="option">
                    <button id="authorize-spotify" class="button1">Authorize Spotify</button>
                </div>
                </div>
                <div id="spotify-cookie-fields" class="sub-settings hid">
                <div class="option">
                    <label for="spotify-cookie">sp_dc cookie:</label>
                    <input type="password" id="spotify-cookie" class="text-input1" placeholder="Paste the sp_dc cookie value">
                    <button id="check-spotify-cookie" class="button1">Check</button>
                </div>
                <div class="option">
                    <span id="spotify-cookie-status" class="b-area">Not checked yet</span>
                </div>
                </div>
                <div class="option">
                    <label for="use-external-auth-server">Use external auth server</label>
                    <input type="checkbox" id="use-external-auth-server">
                </div>
            </div>
            <div class="settings">
                <span class="settings-name">Playback source</span>
                <div class="option">
                    <label for="playback-source">
                        Get song info from:
                        <img id="playback-source-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                    </label>
                    <select id="playback-source">
                        <option value="spotify">Spotify API</option>
                        <option value="discordPresence">Discord presence</option>
                    </select>
                </div>
                <div class="option">
                    <span id="playback-source-status" class="b-area">-</span>
                </div>
            </div>
            <div class="settings">
                <span class="settings-name">Update</span>
                <div class="option">
                    <label for="enable-autoupdate">Enable Autoupdate</label>
                    <input type="checkbox" id="enable-autoupdate">
                </div>
            </div>
            <div class="settings">
                <span class="settings-name">Process</span>
                <div class="option">
                    <button id="restart-lyric-status" class="button1 action-button danger-action">Restart Lyric Status</button>
                    <span id="restart-lyric-status-status" class="b-area">Closes all node.exe processes and opens a fresh terminal.</span>
                </div>
            </div>
            </div>
        </div>
        <div id="websocket-tab" class="tab-content hid">
            <div class="settings-grid">
            <div class="settings">
                <span class="settings-name">WebSocket</span>
                <div class="option">
                    <label for="gateway-enabled">Use Discord Gateway WebSocket</label>
                    <input type="checkbox" id="gateway-enabled">
                </div>
                <div class="option">
                    <label for="gateway-presence-status">Presence status:</label>
                    <select id="gateway-presence-status">
                        <option value="online">Online</option>
                        <option value="idle">Idle</option>
                        <option value="dnd">Do Not Disturb</option>
                        <option value="invisible">Invisible</option>
                    </select>
                </div>
                <div class="option">
                    <label for="gateway-min-interval">Min send interval (ms):</label>
                    <input style="width: 70px;" id="gateway-min-interval" class="text-input1" type="text" maxlength="5" value="5000">
                    <img id="gateway-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                </div>
                <div class="option">
                    <span id="gateway-status" class="b-area">Off</span>
                </div>
                <div class="option websocket-divider"></div>
                <div class="option">
                    <label for="status-flash-enabled">Enable status flash</label>
                    <input type="checkbox" id="status-flash-enabled">
                </div>
                <div class="option">
                    <span class="fw-500">Cycle states:</span>
                    <button type="button" class="presence-state-btn" data-state="online">Online</button>
                    <button type="button" class="presence-state-btn" data-state="idle">Idle</button>
                    <button type="button" class="presence-state-btn" data-state="dnd">Do Not Disturb</button>
                    <button type="button" class="presence-state-btn" data-state="invisible">Invisible</button>
                </div>
                <div class="option">
                    <label for="status-flash-interval">Flash interval (ms):</label>
                    <input style="width: 70px;" id="status-flash-interval" class="text-input1" type="text" maxlength="5" value="2000">
                </div>
                <div class="option">
                    <label for="status-flash-restore">Restore to:</label>
                    <select id="status-flash-restore">
                        <option value="">Use gateway setting</option>
                        <option value="online">Online</option>
                        <option value="idle">Idle</option>
                        <option value="dnd">Do Not Disturb</option>
                        <option value="invisible">Invisible</option>
                    </select>
                </div>
            </div>
            </div>
        </div>
        <div id="terminal-tab" class="tab-content hid">
            <div class="settings-grid">
            <div class="settings">
                <span class="settings-name">Terminal</span>
                <div class="option">
                    <label for="terminal-album-art-width">Album art width:</label>
                    <input style="width: 55px;" id="terminal-album-art-width" class="text-input1" type="text" maxlength="2" value="28">
                </div>
                <div class="option">
                    <span class="b-area">Drag to reorder. Unchecked sections are hidden from the terminal.</span>
                </div>
                <div id="terminal-sections-list" class="sources-list terminal-sections-list"></div>
                <div class="option">
                    <button id="reset-terminal-sections" class="button1">Reset order</button>
                </div>
                <div class="option">
                    <label for="terminal-refresh-ms">Refresh (ms):</label>
                    <input style="width: 70px;" id="terminal-refresh-ms" class="text-input1" type="text" maxlength="5" value="1000">
                </div>
                <div class="option">
                    <label for="terminal-background-color">Background:</label>
                    <input type="color" id="terminal-background-color" value="#121314">
                    <label for="terminal-text-color">Text:</label>
                    <input type="color" id="terminal-text-color" value="#e8ebf0">
                    <label for="terminal-accent-color">Accent:</label>
                    <input type="color" id="terminal-accent-color" value="#50c882">
                </div>
            </div>
            <div class="settings">
                <span class="settings-name">Terminal presets</span>
                <div class="option">
                    <span class="b-area">Apply a preset to quickly change the terminal theme, layout, and visible information.</span>
                </div>
                <div id="terminal-presets-list" class="preset-list"></div>
            </div>
            </div>
        </div>
        <div id="status-tab" class="tab-content hid">
            <div class="settings-grid">
            <div class="settings">
                <span class="settings-name">Status display</span>
                <div class="option">
                    <label for="enable-timestamp">Enable timestamp</label>
                    <input type="checkbox" id="enable-timestamp" checked>
                </div>
                <div class="option">
                    <label for="enable-label">Enable label</label>
                    <input type="checkbox" id="enable-label" checked>
                </div>
                <div class="option">
                    <label for="font-style">
                        Font
                        <img id="font-style-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                        :
                    </label>
                    <select id="font-style">
                        <option value="none">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="italic">Italic</option>
                        <option value="bold_italic">Bold Italic</option>
                        <option value="sans">Sans-serif</option>
                        <option value="sans_bold">Sans-serif Bold</option>
                        <option value="sans_italic">Sans-serif Italic</option>
                        <option value="sans_bold_italic">Sans-serif Bold Italic</option>
                        <option value="double_struck">Double-struck</option>
                        <option value="fraktur">Fraktur</option>
                        <option value="fraktur_bold">Fraktur Bold</option>
                        <option value="script">Script</option>
                        <option value="script_bold">Script Bold</option>
                        <option value="monospace">Monospace</option>
                        <option value="underline">Underline</option>
                        <option value="strikethrough">Strikethrough</option>
                    </select>
                </div>
                <div class="option">
                    <span class="fw-500">Preview:</span>
                    <span id="status-preview" class="b-area">[2:17] Song lyrics - La-la-la</span>
                </div>
            </div>
            <div class="settings">
                <span class="settings-name">Status emojis</span>
                <div class="option">
                    <label for="enable-status-emojis">Use status-based emojis</label>
                    <input type="checkbox" id="enable-status-emojis">
                </div>
                <div class="option">
                    <label for="status-emoji-playing">Playing:</label>
                    <input style="width: 120px;" maxlength="60" id="status-emoji-playing" class="text-input1" placeholder="&#127926; or <:name:id>">
                </div>
                <div class="option">
                    <label for="status-emoji-paused">Paused:</label>
                    <input style="width: 120px;" maxlength="60" id="status-emoji-paused" class="text-input1" placeholder="&#9208;">
                </div>
                <div class="option">
                    <label for="status-emoji-no-lyrics">No lyrics:</label>
                    <input style="width: 120px;" maxlength="60" id="status-emoji-no-lyrics" class="text-input1" placeholder="&#128269;">
                </div>
                <div class="option">
                    <label for="status-emoji-fallback">Fallback:</label>
                    <input style="width: 120px;" maxlength="60" id="status-emoji-fallback" class="text-input1" placeholder="&#127926;">
                </div>
            </div>
            <div class="settings">
                <span class="settings-name">Advanced status</span>
                <div class="option">
                    <label for="enable-advanced-swt">Advanced settings</label>
                    <input type="checkbox" id="enable-advanced-swt">
                </div>
                <div id="advanced-swt" class="sub-settings hid">
                    <div class="option">
                        <label for="custom-emoji">
                            Custom emoji
                            <img id="custom-emoji-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                            :
                        </label>
                        <input style="width: 150px;" maxlength="60" placeholder="&#127926; or <:name:id>" id="custom-emoji" class="text-input1">
                        <select id="custom-emoji-picker" style="width: 130px;">
                            <option value="">Pick emoji...</option>
                        </select>
                    </div>
                    <div class="option">
                        <label for="enable-emoji-rotation">Rotate emoji</label>
                        <img id="emoji-rotation-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                        <input type="checkbox" id="enable-emoji-rotation">
                    </div>
                    <div id="emoji-rotation-swt" class="sub-settings hid">
                        <div class="option">
                            <label for="emoji-rotation-mode">Emoji source:</label>
                            <select id="emoji-rotation-mode">
                                <option value="custom">Chosen emojis</option>
                                <option value="server">One server's emojis</option>
                                <option value="all">All servers' emojis</option>
                            </select>
                        </div>
                        <div class="option" id="emoji-rotation-guild-row">
                            <label for="emoji-rotation-guild">Server:</label>
                            <select id="emoji-rotation-guild"></select>
                        </div>
                        <div class="option">
                            <label for="emoji-rotation-nitro-filter">Emoji type:</label>
                            <select id="emoji-rotation-nitro-filter">
                                <option value="both">Static + animated (both)</option>
                                <option value="nonNitro">Static only (no Nitro needed)</option>
                                <option value="nitro">Animated only (needs Nitro)</option>
                            </select>
                        </div>
                        <div class="option">
                            <label for="emoji-rotation-order">Order:</label>
                            <select id="emoji-rotation-order">
                                <option value="sequential">Sequential (in order)</option>
                                <option value="random">Random (any emoji, any time)</option>
                                <option value="shuffled">Shuffled (random order, no repeats until every emoji is used)</option>
                            </select>
                        </div>
                        <div class="option">
                            <button id="refresh-emoji-list" class="clickable">Refresh emoji list from Discord</button>
                            <span id="emoji-refresh-status" class="b-area"></span>
                        </div>
                        <div class="option">
                            <span id="emoji-pool-count" class="fw-500"></span>
                        </div>
                        <div class="option">
                            <div id="emoji-picker-grid" style="display: flex; flex-wrap: wrap; gap: 4px; max-height: 180px; overflow-y: auto; border: 1px solid rgba(154, 154, 154, 0.3); padding: 6px; border-radius: 4px;"></div>
                        </div>
                    </div>
                    <div class="option">
                        <label for="custom-status">
                            Custom status
                            <img id="custom-status-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                            :
                        </label>
                        <textarea rows="3" cols="40" id="custom-status" class="text-input2"></textarea>
                    </div>
                </div>
            </div>
            </div>
        </div>
        <div id="profiles-tab" class="tab-content hid">
            <div class="settings-grid">
            <div class="settings">
                <span class="settings-name">Profiles</span>
                <div class="option">
                    <label for="profile-name">Name:</label>
                    <input style="width: 180px;" id="profile-name" class="text-input1" type="text" maxlength="40" placeholder="Late night, Stream, etc.">
                    <button id="save-profile" class="button1 action-button">Save current settings as profile</button>
                </div>
                <div class="option">
                    <span id="active-profile" class="b-area">Active profile: none</span>
                </div>
                <div id="profiles-list" class="sources-list"></div>
            </div>
            </div>
        </div>
        <div id="timings-tab" class="tab-content hid">
            <div class="settings-grid">
            <div class="settings">
                <span class="settings-name">Timing</span>
                <div class="option">
                    <label for="send-time-offset">Send time offset:</label>
                    <input type="text" id="send-time-offset" class="text-input1" maxlength="5" value="500">
                    <img id="send-time-offset-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                </div>
                <div class="option">
                    <label for="playback-poll-interval">Song detection interval (ms):</label>
                    <input style="width: 60px;" id="playback-poll-interval" class="text-input1" type="text" maxlength="5" value="1000">
                    <img id="playback-poll-interval-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                </div>
                <div class="option">
                    <label for="enable-autooffset">Enable Autooffset:</label>
                    <input type="checkbox" id="enable-autooffset">
                </div>
                <div class="option">
                    <span>Autooffset: Average of</span>
                    <input style="width: 30px;" id="autooffset" class="text-input1" type="text" maxlength="2">
                    <span>requests</span>
                    <img id="autooffset-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15" style="left: 1px;">
                </div>
            </div>
            <div class="settings">
                <span class="settings-name">Per-song saved offsets</span>
                <div class="option">
                    <label for="enable-song-offsets">Enable saved song offsets</label>
                    <input type="checkbox" id="enable-song-offsets">
                </div>
                <div class="option">
                    <span id="song-offset-current" class="b-area">No song detected yet</span>
                </div>
                <div class="option">
                    <label for="song-offset-value">Offset (ms):</label>
                    <input style="width: 70px;" id="song-offset-value" class="text-input1" type="text" maxlength="6" value="0">
                    <button id="save-current-song-offset" class="button1 action-button">Save offset for current song</button>
                </div>
                <div class="option">
                    <span class="b-area">This is added on top of your normal timing offset only for the matching song.</span>
                </div>
                <div id="song-offsets-list" class="sources-list"></div>
            </div>
            <div class="settings">
                <span class="settings-name">Rate limiting</span>
                <div class="option">
                    <label for="enable-rate-limit-mode">Enable rate limit protections:</label>
                    <input type="checkbox" id="enable-rate-limit-mode" checked>
                </div>
                <div class="option">
                    <label for="enable-auto-backoff">Enable auto backoff:</label>
                    <input type="checkbox" id="enable-auto-backoff" checked>
                </div>
                <div class="option">
                    <label for="backoff-duration">
                        Backoff duration (ms):
                        <img id="backoff-duration-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                    </label>
                    <input type="text" id="backoff-duration" class="text-input1" maxlength="6" value="30000">
                </div>
                <div class="option">
                    <label for="min-send-interval">Min send interval (ms):</label>
                    <input type="text" id="min-send-interval" class="text-input1" maxlength="5" value="2500">
                </div>
            </div>
            <div class="settings">
                <span class="settings-name">Line merging</span>
                <div class="option">
                    <label for="enable-line-merge">Enable line merging:</label>
                    <input type="checkbox" id="enable-line-merge">
                </div>
                <div class="option">
                    <label for="merge-line-count">Merge line count:</label>
                    <input style="width: 30px;" id="merge-line-count" class="text-input1" type="text" maxlength="1" value="2">
                </div>
                <div class="option">
                    <label for="enable-smart-merge">Smart merging</label>
                    <img id="smart-merge-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                    <input type="checkbox" id="enable-smart-merge">
                </div>
                <div id="smart-merge-swt" class="sub-settings hid">
                    <div class="option">
                        <label for="smart-merge-max-words">Max combined words:</label>
                        <input style="width: 40px;" id="smart-merge-max-words" class="text-input1" type="text" maxlength="3" value="20">
                    </div>
                    <div class="option">
                        <label for="smart-merge-solo-threshold">Solo line word threshold:</label>
                        <input style="width: 40px;" id="smart-merge-solo-threshold" class="text-input1" type="text" maxlength="3" value="10">
                    </div>
                </div>
            </div>
            </div>
        </div>
        <div id="sources-tab" class="tab-content hid">
            <div class="settings-grid">
            <div class="settings">
                <span class="settings-name">Lyric sources</span>
                <div class="option">
                    <span>Drag to reorder. Sources are tried top to bottom - the first one that finds lyrics wins. Unchecked sources are skipped entirely.</span>
                    <img id="sources-help" class="clickable question-mark1" src="https://www.pngall.com/wp-content/uploads/5/Help-Question-Mark-PNG-Free-Download.png" height="15">
                </div>
                <div id="sources-list" class="sources-list"></div>
            </div>
            <div class="settings">
                <span class="settings-name">Musixmatch</span>
                <div class="option">
                    <span>Musixmatch needs a usertoken to fetch lyrics. One is generated and saved automatically the first time Musixmatch is used - there's nothing to enter yourself.</span>
                </div>
                <div class="option">
                    <span id="musixmatch-token-status" class="b-area">No token saved yet</span>
                    <button id="regenerate-musixmatch-token" class="button1">Clear saved token</button>
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
</div>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap');
        html, body {
            margin: 0;
            padding: 0;
            background: rgb(30, 31, 31);
            height: 100%;
            overflow: hidden;
        }
        #menu-UI {
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            background: rgb(30, 31, 31);
            position: fixed;
            top: 0;
            left: 0;
            z-index: 999;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            overflow: hidden;
        }
        #menu-UI * {
            color: rgba(204, 204, 204, var(--alpha));
            font-family: Roboto;
            user-select: none;
            box-sizing: border-box;
        }
        #menu-UI button {
            cursor: pointer;
        }
        #menu-UI {
            --accent: rgb(88, 155, 233);
        }
        #menu-UI input[type="checkbox"] {
            appearance: none;
            -webkit-appearance: none;
            width: 32px;
            height: 17px;
            background: rgba(80, 80, 80, var(--alpha));
            border-radius: 20px;
            position: relative;
            cursor: pointer;
            transition: background .15s ease-in-out;
            top: 3px;
            outline: none;
            border: none;
            vertical-align: middle;
        }
        #menu-UI input[type="checkbox"]::before {
            content: "";
            position: absolute;
            top: 2px;
            left: 2px;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: rgb(230, 230, 230);
            transition: transform .15s ease-in-out;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        #menu-UI input[type="checkbox"]:checked {
            background: var(--accent);
        }
        #menu-UI input[type="checkbox"]:checked::before {
            transform: translateX(15px);
        }
        #menu-UI input[type="checkbox"]:disabled {
            opacity: 0.5;
            cursor: default;
        }
        #menu-UI ::-webkit-scrollbar {
            width: 10px;
        }
        #menu-UI ::-webkit-scrollbar-thumb {
            border-radius: 5px;
            background: rgba(65, 65, 65, var(--alpha));
        }
        #menu-UI ::-webkit-scrollbar-thumb:hover {
            background: rgba(75, 75, 75, var(--alpha));
        }
        #menu-header {
            display: flex;
            align-items: center;
            gap: 36px;
            padding: 0 28px;
            height: 58px;
            flex: 0 0 auto;
            background: rgb(37, 38, 38);
            border-bottom: 1px solid rgba(0, 0, 0, 0.35);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        #app-title {
            font-size: 19px;
            font-weight: 700;
            letter-spacing: .2px;
            white-space: nowrap;
        }
        #app-title-accent {
            color: var(--accent);
        }
        #menu-tabs {
            display: flex;
            align-items: stretch;
            gap: 6px;
            height: 100%;
            min-width: 0;
            overflow-x: auto;
            overflow-y: hidden;
        }
        #menu-tabs > .tab-button {
            flex: 0 0 auto;
            height: 34px;
            align-self: center;
            background: transparent;
            color: rgba(180, 180, 180, var(--alpha));
            transition: background .15s ease-in-out, color .15s ease-in-out;
            border: none;
            border-radius: 6px;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
        }
        #menu-tabs > .tab-button.dragging {
            opacity: 0.45;
        }
        #menu-tabs > .tab-button.drag-over {
            box-shadow: inset 2px 0 0 var(--accent);
        }
        #menu-tabs > .tab-button:hover {
            background: rgba(255, 255, 255, 0.06);
            color: rgb(230, 230, 230);
        }
        #menu-tabs > .tab-button.cur-tab {
            background: var(--accent) !important;
            color: white;
        }
        #menu-contents {
            flex: 1 1 auto;
            display: flex;
            flex-direction: row;
            align-items: stretch;
            min-height: 0;
        }
        #tab-area {
            flex: 1 1 auto;
            overflow-y: auto;
            padding: 28px;
            min-width: 0;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
        }
        .tab-content {
            width: 100%;
        }
        /* Now Playing sidebar */
        #now-playing-sidebar {
            flex: 0 0 300px;
            display: flex;
            flex-direction: column;
            min-height: 0;
            position: relative;
            overflow: hidden;
            border-right: 1px solid rgba(0, 0, 0, 0.35);
            background: rgb(20, 21, 21);
        }
        #np-backdrop {
            position: absolute;
            inset: -20px;
            background-size: cover;
            background-position: center;
            filter: blur(38px) saturate(1.4) brightness(0.55);
            transform: scale(1.15);
            transition: background-image .4s ease-in-out;
        }
        #np-backdrop-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(15, 15, 16, 0.55) 0%, rgba(15, 15, 16, 0.75) 40%, rgb(15, 15, 16) 100%);
        }
        #np-content {
            position: relative;
            flex: 1 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
            padding: 22px 18px;
            box-sizing: border-box;
        }
        #np-empty {
            margin: auto;
            text-align: center;
            font-size: 13px;
            color: rgba(160, 160, 160, var(--alpha));
            max-width: 180px;
        }
        #np-playing {
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            min-height: 0;
        }
        #np-playing.hid, #np-empty.hid {
            display: none;
        }
        #np-cover {
            flex-shrink: 0;
            width: 100%;
            aspect-ratio: 1 / 1;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
            background: rgba(255, 255, 255, 0.05);
        }
        #np-title {
            flex-shrink: 0;
            margin-top: 16px;
            font-size: 17px;
            font-weight: 700;
            color: white;
            line-height: 1.25;
            max-height: 2.5em;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        #np-artist {
            flex-shrink: 0;
            margin-top: 4px;
            font-size: 13px;
            color: rgba(190, 190, 190, var(--alpha));
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        #np-progress-row {
            flex-shrink: 0;
            margin-top: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        #np-time-elapsed, #np-time-total {
            font-size: 10px;
            color: rgba(160, 160, 160, var(--alpha));
            min-width: 28px;
            font-variant-numeric: tabular-nums;
        }
        #np-time-total {
            text-align: right;
        }
        #np-progress-track {
            flex: 1 1 auto;
            height: 3px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 2px;
            overflow: hidden;
        }
        #np-progress-fill {
            height: 100%;
            width: 0%;
            background: var(--accent);
            border-radius: 2px;
            transition: width .3s linear;
        }
        #np-controls {
            flex-shrink: 0;
            margin-top: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 18px;
        }
        .np-control-btn {
            background: transparent;
            border: none;
            color: rgba(230, 230, 230, var(--alpha));
            font-size: 15px;
            line-height: 1;
            padding: 4px;
            border-radius: 50%;
            transition: color .15s ease-in-out, transform .1s ease-in-out;
        }
        #np-controls .np-control-btn {
            color: rgba(230, 230, 230, 0.9);
        }
        #np-controls .np-control-btn:hover {
            color: white;
            transform: scale(1.1);
        }
        .np-control-btn:disabled {
            opacity: 0.35;
            cursor: default;
            transform: none;
        }
        .np-control-btn-main {
            font-size: 22px;
        }
        #np-lyrics {
            margin-top: 18px;
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            display: flex;
            flex-direction: column;
            gap: 10px;
            mask-image: linear-gradient(180deg, transparent 0, black 16px, black calc(100% - 16px), transparent 100%);
        }
        #np-lyrics .np-lyric-line {
            font-size: 12.5px;
            line-height: 1.4;
            color: rgba(140, 140, 140, 0.9);
            border-left: 2px solid transparent;
            padding-left: 8px;
            transition: color .18s ease-in-out, border-color .18s ease-in-out;
        }
        #np-lyrics .np-lyric-line.np-current {
            color: white;
            font-weight: 700;
            font-size: 13.5px;
            border-left-color: var(--accent);
        }
        .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 20px;
            align-items: start;
            max-width: 1400px;
            margin: 0 auto;
        }
        #log-window {
            width: 390px;
            height: 250px;
            padding: 4px 0 0 2px;
            margin: 4px 0 0 4px;
            border: solid rgba(105, 105, 105, var(--alpha)) 1px;
            border-radius: 5px;
            background: rgba(55, 55, 55, var(--alpha));
            line-height: 20px;
            font-size: 20px;
            overflow: hidden auto;
        }
        #log-window > span {
            width: 100%;
            margin: 2px 0 0 4px;
            float: left;
        }
        #start {
            background: rgba(127, 191, 63, var(--alpha));
        }
        #stop {
            background: rgba(191, 63, 63, var(--alpha));
        }
        #start:hover {
            background: rgba(142, 206, 78, var(--alpha));
        }
        #stop:hover {
            background: rgba(206, 78, 78, var(--alpha));
        }
        #ss-buttons {
            width: 200px;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 10px;
            position: relative;
            display: flex;
            justify-content: space-between;
        }
        #check-token {
            width: 70px;
            height: 20px;
            background: rgba(105, 105, 105, var(--alpha));
            padding-top: 1px;
            font-size: 13px;
        }
        #check-token:hover {
            background: rgba(115, 115, 115, var(--alpha));
        }
        #custom-status {
            overflow: hidden auto;
        }
        #send-time-offset {
            width: 54px;
            transition: background .2s ease-in-out;
        }
        #autooffset {
            background: rgba(104, 104, 104, var(--alpha));
            border: none;
            border-radius: 3px;
        }
        #autooffset:focus {
            background: rgba(124, 124, 124, var(--alpha));
        }
        #copy-debug-info {
            width: 130px;
            height: 30px;
            background: rgba(105, 105, 105, var(--alpha));
            padding-top: 1px;
            font-size: 16px;
        }
        #copy-debug-info:hover {
            background: rgba(115, 115, 115, var(--alpha));
        }
        #version {
            width: 400px;
            left: -5px;
            text-align: center;
            position: relative;
            display: inline-block;
        }
        .act {
            display: block;
        }
        .hid {
            display: none;
        }
        .cur-tab {
            background: rgba(110, 111, 111, var(--alpha)) !important;
        }
        .red {
            color: rgba(234, 0, 0, var(--alpha)) !important;
        }
        .orange {
            color: rgba(255, 182, var(--alpha)) !important;
        }
        .blue {
            color: rgba(150, 150, 200, var(--alpha)) !important;
        }
        .green {
            color: rgba(150, 200, 150, var(--alpha)) !important;
        }
        .button1 {
            width: 90px;
            height: 35px;
            font-size: 17px;
            border: none;
            border-radius: 3px;
            position: relative;
            -webkit-transition: background .2s ease-in-out;
            -moz-transition: background .2s ease-in-out;
            transition: background .2s ease-in-out;
            color: black !important;
        }
        .button1:disabled {
            color: black !important;
            opacity: 0.75;
        }
        .danger-action {
            background: rgba(230, 92, 92, var(--alpha));
        }
        .danger-action:hover {
            background: rgba(245, 110, 110, var(--alpha));
        }
        .text-input1 {
            border: solid 1px gray;
            border-radius: 2px;
            background: rgba(58, 58, 58, var(--alpha));
            -webkit-transition: background .2s ease-in-out, color .2s ease-in-out;
            -moz-transition: background .2s ease-in-out, color .2s ease-in-out;
            transition: background .2s ease-in-out, color .2s ease-in-out;
            text-align: center;
            outline: none;
        }
        .text-input1:disabled {
            color: rgba(184, 184, 184, var(--alpha)) !important;
            background: rgba(48, 48, 48, var(--alpha));
        }
        .text-input2 {
            border: solid 1px gray;
            border-radius: 2px;
            background: rgba(58, 58, 58, var(--alpha));
            -webkit-transition: background .2s ease-in-out, color .2s ease-in-out;
            -moz-transition: background .2s ease-in-out, color .2s ease-in-out;
            transition: background .2s ease-in-out, color .2s ease-in-out;
            text-align: left;
            line-height: 15px;
            resize: none;
            outline: none;
        }
        .text-input2:disabled {
        color: rgba(184, 184, 184, var(--alpha)) !important;
            background: rgba(48, 48, 48, var(--alpha));
        }
        .b-area {
            border: solid rgba(105, 105, 105, var(--alpha)) 1px;
            border-radius: 3px;
            padding: 0 20px 0 20px;
            background: rgba(55, 55, 55, var(--alpha));
        }
        .text-input1:focus, .text-input2:focus, #menu-UI select:focus {
            box-shadow: 0 0 0 1px var(--accent);
        }
        #menu-UI select {
            border: solid 1px gray;
            border-radius: 2px;
            background: rgb(58, 58, 58);
            color: rgb(230, 230, 230);
            outline: none;
            padding: 3px 4px;
            font-size: 13px;
        }
        #menu-UI select option {
            background: rgb(58, 58, 58);
            color: rgb(230, 230, 230);
        }
        #menu-UI select:disabled {
            color: rgb(140, 140, 140);
            background: rgb(48, 48, 48);
        }
        #menu-UI input[type="color"] {
            width: 42px;
            height: 26px;
            border: solid 1px gray;
            border-radius: 3px;
            background: rgb(58, 58, 58);
            padding: 2px;
        }
        #refresh-emoji-list {
            background: rgba(105, 105, 105, var(--alpha));
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            font-size: 13px;
        }
        #refresh-emoji-list:hover {
            background: rgba(115, 115, 115, var(--alpha));
        }
        #refresh-emoji-list:disabled {
            background: rgba(48, 48, 48, var(--alpha));
            color: rgba(150, 150, 150, var(--alpha));
            cursor: default;
        }
        #emoji-refresh-status {
            margin-left: 6px;
            font-size: 13px;
        }
        #emoji-pool-count {
            font-size: 13px;
            color: var(--accent);
            font-weight: 500;
        }
        #emoji-rotation-swt .option label, #emoji-rotation-swt .option {
            color: rgb(220, 220, 220);
        }
        #emoji-picker-grid {
            background: rgba(0, 0, 0, 0.15);
        }
        #emoji-picker-grid img {
            transition: transform .1s ease-in-out, border-color .15s ease-in-out;
        }
        #emoji-picker-grid img:hover {
            transform: scale(1.15);
        }
        .websocket-divider {
            width: calc(100% - 10px);
            height: 1px;
            padding: 0;
            margin-top: 12px;
            background: rgba(90, 90, 90, var(--alpha));
        }
        .presence-state-btn {
            border: 1px solid rgba(105, 105, 105, var(--alpha));
            border-radius: 4px;
            background: rgba(55, 55, 55, var(--alpha));
            color: rgba(230, 230, 230, var(--alpha));
            padding: 4px 9px;
            cursor: pointer;
            transition: background .15s ease-in-out, border-color .15s ease-in-out;
        }
        .presence-state-btn.active {
            background: rgba(60, 120, 85, var(--alpha));
            border-color: rgba(80, 200, 130, var(--alpha));
        }
        .range-slider1 {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 100px;
            height: 10px;
            border-radius: 5px;
            background: rgba(75, 75, 75, var(--alpha));
            -webkit-transition: background .2s ease-in-out;
            -moz-transition: background .2s ease-in-out;
            transition: background .2s ease-in-out;
        }
        .range-slider1:hover {
            background: rgba(80, 80, 80, var(--alpha));
        }
        .range-slider1::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 2px;
            background: rgba(90, 90, 90, var(--alpha));
            -webkit-transition: background .2s ease-in-out;
        }
        .range-slider1::-moz-range-thumb {
            -moz-appearance: none;
            width: 25px;
            height: 25px;
            background: rgba(90, 90, 90, var(--alpha));
            -moz-transition: background .2s ease-in-out;
        }
        .range-slider1::-webkit-slider-thumb:hover {
            background: rgba(100, 100, 100, var(--alpha));
        }
        .range-slider1::-moz-range-thumb:hover {
            background: rgba(100, 100, 100, var(--alpha));
        }
        .settings {
            background: rgb(40, 41, 41);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            padding: 18px 20px 22px 20px;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
        }
        .settings-name {
            font-size: 17px;
            font-weight: 700;
            border-bottom: 2px solid var(--accent);
            padding-bottom: 6px;
            margin-bottom: 8px;
            display: block;
        }
        .option {
            margin: 6px 0 0 10px;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        .sub-settings {
            margin: 4px 0 4px 10px;
            padding: 6px 0 4px 10px;
            border-left: 2px solid rgba(90, 90, 90, var(--alpha));
        }
        #emoji-rotation-swt {
            border-left: 2px solid var(--accent);
            background: rgba(255, 255, 255, 0.02);
            border-radius: 0 4px 4px 0;
        }
        .sources-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin: 8px 0 4px 10px;
            width: 95%;
        }
        .source-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(90, 90, 90, var(--alpha));
            border-radius: 4px;
            cursor: grab;
            user-select: none;
        }
        .source-item.dragging {
            opacity: 0.4;
        }
        .source-item.drag-over {
            border-color: var(--accent);
        }
        .source-item .drag-handle {
            opacity: 0.5;
            font-size: 14px;
            line-height: 1;
        }
        .source-item .source-name {
            flex: 1;
        }
        .source-item .source-position {
            opacity: 0.5;
            font-size: 12px;
            min-width: 16px;
            text-align: center;
        }
        .preset-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 10px;
            margin: 10px 0 4px 10px;
            width: 95%;
        }
        .preset-card {
            border: 1px solid rgba(90, 90, 90, var(--alpha));
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.03);
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .preset-card.active {
            border-color: var(--accent);
            box-shadow: inset 0 0 0 1px var(--accent);
        }
        .preset-card-title {
            font-weight: 700;
            color: white;
        }
        .preset-card-description {
            font-size: 12px;
            line-height: 1.35;
            color: rgba(170, 170, 170, var(--alpha));
        }
        .preset-card button, .source-item .mini-button {
            width: auto;
            height: 26px;
            font-size: 12px;
            padding: 0 9px;
        }
        .action-button {
            width: auto;
            min-width: 170px;
            padding: 0 12px;
            font-size: 13px;
            white-space: nowrap;
        }
        .profile-item {
            align-items: flex-start;
            flex-wrap: wrap;
            cursor: default;
        }
        .profile-summary {
            flex: 1 0 100%;
            margin-left: 24px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
            gap: 4px 12px;
            font-size: 12px;
            color: rgba(170, 170, 170, var(--alpha));
        }
        .profile-summary span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .clickable {
            cursor: pointer;
        }
        .question-mark1 {
            bottom: 5px;
            right: 1px;
            margin-right: -2px;
            filter: invert(39%) sepia(0%) saturate(0%) hue-rotate(339deg) brightness(94%) contrast(90%);
            position: relative;
        }

        .fw-500 {
            font-weight: 500;
        }
        .fw-700 {
            font-weight: 700;
        }
        .modal {
            min-width: 300px;
            min-height: 100px;
            max-width: 700px;
            max-height: 450px;
            width: fit-content;
            height: fit-content;
            background: rgba(50, 51, 51, var(--alpha));
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 7px;
            box-shadow: rgba(30, 30, 30, var(--alpha)) 5px 5px 10px 1px;
            font-size: 14px;
            z-index: 9999;
            position: absolute;
        }
        .modal * {
            user-select: none;
        }
        .modal > .top {
            width: 100%;
            height: 18px;
            background: rgba(60, 60, 60, var(--alpha));
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
            box-shadow: 0px 1px 0px rgba(31, 31, 31, var(--alpha));
        }
        .modal > .top > .title {
            height: 100%;
            left: 6px;
            bottom: 2px;
            position: relative;
            font-size: 14px;
        }
        .modal > .top > .close {
            width: 18px;
            height: 18px;
            background: rgba(228, 64, 64, var(--alpha));
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
            float: right;
            cursor: pointer;
        }
        .modal > .top > .close > .closeMark {
            left: 2px;
            top: 1px;
            position: relative;
        }
        .modal > .description {
            padding: 5px 5px 0 5px;
            text-align: center;
        }
        @keyframes light {
            from { filter: invert(39%) sepia(0%) saturate(0%) hue-rotate(339deg) brightness(94%) contrast(90%); }
            to { filter: invert(82%) sepia(7%) saturate(0%) hue-rotate(154deg) brightness(82%) contrast(90%); }
        }
        :root {
            --alpha: .9
        }
        @media (max-width: 700px) {
            #menu-contents {
                flex-direction: column;
                overflow-y: auto;
                overscroll-behavior: contain;
            }
            #now-playing-sidebar {
                flex: 0 0 auto;
                width: 100%;
                max-height: 75vh;
                max-height: 75dvh;
                border-right: none;
                border-bottom: 1px solid rgba(0, 0, 0, 0.35);
            }
            #tab-area {
                flex: 1 1 auto;
                overflow: visible;
            }
            #np-content {
                padding: 14px 16px;
            }
            #np-cover {
                width: 84px;
                height: 84px;
                flex-shrink: 0;
                margin: 0;
            }
            #np-title {
                margin-top: 0;
                font-size: 15px;
            }
            #np-artist {
                font-size: 12px;
            }
            #np-lyrics {
                margin-top: 12px;
                min-height: 140px;
            }
        }
    </style>
</div>
`).appendTo(document.body);
// HTML and CSS

let menu                    = $("#menu-UI"),
    userTokenInput          = $("#user-token"),
    checkTokenButton        = $("#check-token"),
    spotifyAuthMethod       = $("#spotify-auth-method"),
    spotifyAuthMethodHelp   = $("#spotify-auth-method-help"),
    spotifyAppFields        = $("#spotify-app-fields"),
    spotifyCookieFields     = $("#spotify-cookie-fields"),
    spotifyCookieInput      = $("#spotify-cookie"),
    checkSpotifyCookie      = $("#check-spotify-cookie"),
    spotifyCookieStatus     = $("#spotify-cookie-status"),
    clientIDInput           = $("#client-id"),
    clientSecretInput       = $("#client-secret"),
    customRedirectUriInput  = $("#custom-redirect-uri"),
    useExternalAuthServer   = $("#use-external-auth-server"),
    authorizeButton         = $("#authorize-spotify"),
    enableTimestampCheckbox = $("#enable-timestamp"),
    enableLabelCheckbox     = $("#enable-label"),
    fontStyleSelect         = $("#font-style"),
    fontStyleHelp           = $("#font-style-help"),
    statusPreview           = $("#status-preview"),
    advancedSWT             = $("#advanced-swt"),
    enableAdvancedSWT       = $("#enable-advanced-swt"),
    customEmojiHelp         = $("#custom-emoji-help"),
    customEmoji             = $("#custom-emoji"),
    customEmojiPicker       = $("#custom-emoji-picker"),
    enableEmojiRotation     = $("#enable-emoji-rotation"),
    emojiRotationHelp       = $("#emoji-rotation-help"),
    emojiRotationSWT        = $("#emoji-rotation-swt"),
    emojiRotationMode       = $("#emoji-rotation-mode"),
    emojiRotationGuildRow   = $("#emoji-rotation-guild-row"),
    emojiRotationGuild      = $("#emoji-rotation-guild"),
    emojiRotationNitroFilter = $("#emoji-rotation-nitro-filter"),
    emojiRotationOrder      = $("#emoji-rotation-order"),
    refreshEmojiListButton  = $("#refresh-emoji-list"),
    emojiRefreshStatus      = $("#emoji-refresh-status"),
    emojiPoolCount          = $("#emoji-pool-count"),
    emojiPickerGrid         = $("#emoji-picker-grid"),
    customStatusHelp        = $("#custom-status-help"),
    customStatus            = $("#custom-status"),
    sendTimeOffset          = $("#send-time-offset"),
    sendTimeOffsetHelp      = $("#send-time-offset-help"),
    playbackPollInterval    = $("#playback-poll-interval"),
    playbackPollIntervalHelp = $("#playback-poll-interval-help"),
    enableAutooffset        = $("#enable-autooffset"),
    autooffset              = $("#autooffset"),
    autooffsetHelp          = $("#autooffset-help"),
    enableRateLimitMode     = $("#enable-rate-limit-mode"),
    enableAutoBackoff       = $("#enable-auto-backoff"),
    backoffDuration         = $("#backoff-duration"),
    backoffDurationHelp     = $("#backoff-duration-help"),
    minSendInterval         = $("#min-send-interval"),
    enableLineMerge         = $("#enable-line-merge"),
    mergeLineCount          = $("#merge-line-count"),
    enableSmartMerge        = $("#enable-smart-merge"),
    smartMergeHelp          = $("#smart-merge-help"),
    smartMergeSWT           = $("#smart-merge-swt"),
    smartMergeMaxWords      = $("#smart-merge-max-words"),
    smartMergeSoloThreshold = $("#smart-merge-solo-threshold"),
    playbackSourceSelect    = $("#playback-source"),
    playbackSourceHelp      = $("#playback-source-help"),
    playbackSourceStatus    = $("#playback-source-status"),
    gatewayEnabled          = $("#gateway-enabled"),
    gatewayPresenceStatus   = $("#gateway-presence-status"),
    gatewayMinInterval      = $("#gateway-min-interval"),
    gatewayHelp             = $("#gateway-help"),
    gatewayStatus           = $("#gateway-status"),
    statusFlashEnabled      = $("#status-flash-enabled"),
    statusFlashInterval     = $("#status-flash-interval"),
    statusFlashRestore      = $("#status-flash-restore"),
    terminalAlbumArtWidth   = $("#terminal-album-art-width"),
    terminalSectionsList    = $("#terminal-sections-list"),
    resetTerminalSections   = $("#reset-terminal-sections"),
    terminalRefreshMs       = $("#terminal-refresh-ms"),
    terminalBackgroundColor = $("#terminal-background-color"),
    terminalTextColor       = $("#terminal-text-color"),
    terminalAccentColor     = $("#terminal-accent-color"),
    terminalPresetsList     = $("#terminal-presets-list"),
    enableStatusEmojis      = $("#enable-status-emojis"),
    statusEmojiPlaying      = $("#status-emoji-playing"),
    statusEmojiPaused       = $("#status-emoji-paused"),
    statusEmojiNoLyrics     = $("#status-emoji-no-lyrics"),
    statusEmojiFallback     = $("#status-emoji-fallback"),
    enableSongOffsets       = $("#enable-song-offsets"),
    songOffsetCurrent       = $("#song-offset-current"),
    songOffsetValue         = $("#song-offset-value"),
    saveCurrentSongOffset   = $("#save-current-song-offset"),
    songOffsetsList         = $("#song-offsets-list"),
    profileName             = $("#profile-name"),
    saveProfile             = $("#save-profile"),
    activeProfile           = $("#active-profile"),
    profilesList            = $("#profiles-list"),
    restartLyricStatus      = $("#restart-lyric-status"),
    restartLyricStatusStatus = $("#restart-lyric-status-status"),
    enableAutoupdate        = $("#enable-autoupdate"),
    sourcesHelp             = $("#sources-help"),
    sourcesList             = $("#sources-list"),
    musixmatchTokenStatus   = $("#musixmatch-token-status"),
    regenerateMusixmatchToken = $("#regenerate-musixmatch-token");
// Elements

const SOURCE_LABELS = {
    LrcLib:     "LrcLib",
    Spotify:    "Spotify (built-in)",
    QQMusic:    "QQ Music",
    NetEase:    "NetEase",
    Musixmatch: "Musixmatch",
    Genius:     "Genius",
    Kugou:      "Kugou"
};
const SOURCE_ENABLE_KEYS = {
    LrcLib:     "enableLrcLib",
    Spotify:    "enableSpotify",
    QQMusic:    "enableQQMusic",
    NetEase:    "enableNetEase",
    Musixmatch: "enableMusixmatch",
    Genius:     "enableGenius",
    Kugou:      "enableKugou"
};
const TERMINAL_SECTION_LABELS = {
    albumArt: "Album cover",
    song: "Song",
    lyrics: "Lyrics",
    sources: "Sources",
    webSocket: "WebSocket",
    rateLimit: "Rate limit",
    debug: "Debug"
};
const TERMINAL_SECTION_ENABLE_KEYS = {
    albumArt: "showAlbumArt",
    song: "showSong",
    lyrics: "showLyrics",
    sources: "showSources",
    webSocket: "showWebSocket",
    rateLimit: "showRateLimit",
    debug: "showDebug"
};
const DEFAULT_TERMINAL_SECTION_ORDER = ["albumArt", "song", "lyrics", "sources", "webSocket", "rateLimit", "debug"];
const TERMINAL_PRESETS = {
    dashboard: {
        name: "Dashboard",
        description: "Album art, song details, lyrics, sources, WebSocket state, and rate-limit info.",
        terminal: {
            preset: "dashboard",
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
        }
    },
    compact: {
        name: "Compact",
        description: "Small, low-noise view focused on the current song and lyric line.",
        terminal: {
            preset: "compact",
            showAlbumArt: false,
            albumArtWidth: 18,
            showSong: true,
            showLyrics: true,
            showSources: false,
            showWebSocket: false,
            showRateLimit: false,
            showDebug: false,
            sectionOrder: ["song", "lyrics", "albumArt", "sources", "webSocket", "rateLimit", "debug"],
            backgroundColor: "#0f1115",
            textColor: "#f0f3f7",
            accentColor: "#61a8ff"
        }
    },
    karaoke: {
        name: "Karaoke",
        description: "Big album cover energy with lyrics near the top and less operational detail.",
        terminal: {
            preset: "karaoke",
            showAlbumArt: true,
            albumArtWidth: 36,
            showSong: true,
            showLyrics: true,
            showSources: false,
            showWebSocket: false,
            showRateLimit: false,
            showDebug: false,
            sectionOrder: ["albumArt", "lyrics", "song", "sources", "webSocket", "rateLimit", "debug"],
            backgroundColor: "#090909",
            textColor: "#f7f2ec",
            accentColor: "#f48fb1"
        }
    },
    ops: {
        name: "Ops",
        description: "Practical view for tuning sends, gateway behavior, and source routing.",
        terminal: {
            preset: "ops",
            showAlbumArt: false,
            albumArtWidth: 16,
            showSong: true,
            showLyrics: true,
            showSources: true,
            showWebSocket: true,
            showRateLimit: true,
            showDebug: true,
            sectionOrder: ["song", "lyrics", "webSocket", "rateLimit", "sources", "debug", "albumArt"],
            backgroundColor: "#151617",
            textColor: "#d7dde5",
            accentColor: "#f2b84b"
        }
    }
};
const PROFILE_KEYS = ["credentials", "view", "timings", "sources", "playback", "gateway", "statusFlash", "statusEmojis", "terminal", "songOffsets"];
// Sources

let settings = {
    credentials: {
        token: "",
        cookies: "",
        clientID: "",
        clientSecret: "",
        useExternalAuthServer: false,
        uuid: "",
        customRedirectUri: "",
        musixmatchToken: "",
        spotifyAuthMethod: "app",
        spotifyCookie: ""
    },
    view: {
        timestamp: true,
        label: true,
        advanced: {
            enabled: false,
            customEmoji: "🎶",
            customStatus: "[{timestamp}] Song lyrics - {lyrics}",
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
    },
    timings: {
        sendTimeOffset: 500,
        playbackPollInterval: 1000,
        enableAutooffset: true,
        autooffset: 3,
        rateLimit: {
            enabled: true,
            autoBackoff: true,
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
    },
    update: {
        enableAutoupdate: true
    },
    sources: {
        enableSpotify: true,
        enableLrcLib: true,
        enableQQMusic: true,
        enableNetEase: true,
        enableGenius: false,
        enableKugou: false,
        enableMusixmatch: false,
        order: ["LrcLib", "Spotify", "QQMusic", "NetEase", "Musixmatch", "Genius", "Kugou"]
    },
    playback: {
        source: "spotify"
    },
    gateway: {
        enabled: false,
        presenceStatus: "online",
        minIntervalMs: 5000
    },
    statusFlash: {
        enabled: false,
        states: ["online", "idle", "dnd"],
        intervalMs: 2000,
        restoreStatus: ""
    },
    statusEmojis: {
        enabled: false,
        playing: "\uD83C\uDFB6",
        paused: "\u23F8",
        noLyrics: "\uD83D\uDD0D",
        fallback: "\uD83C\uDFB6"
    },
    terminal: {
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
    },
    songOffsets: {
        enabled: false,
        entries: []
    },
    profiles: {
        active: "",
        items: []
    }
}
// Settings

let settingsLoaded = false;
// Misc, in-session variables

const TAB_ORDER_KEY = "dihlyrics.tabOrder";

function tabIdFromButton(button) {
    return button.id.replace(/-button$/, "");
}

function applySavedTabOrder() {
    let saved = [];

    try {
        saved = JSON.parse(localStorage.getItem(TAB_ORDER_KEY) || "[]");
    } catch {
        saved = [];
    }

    if (!Array.isArray(saved) || !saved.length) return;

    const tabs = $("#menu-tabs");
    const buttonsById = {};

    $(".tab-button").each((_, button) => {
        buttonsById[button.id] = button;
    });

    saved.forEach((id) => {
        if (buttonsById[id]) tabs.append(buttonsById[id]);
    });
}

function saveTabOrder() {
    const order = $(".tab-button").map((_, button) => button.id).get();
    localStorage.setItem(TAB_ORDER_KEY, JSON.stringify(order));
}

function activateTab(tabId) {
    $(".tab-button").each((_, button) => {
        $(button).toggleClass("cur-tab", tabIdFromButton(button) === tabId);
    });

    $(".tab-content").each((_, content) => {
        const current = $(content);
        const active = content.id === tabId;

        current.toggleClass("act", active);
        current.toggleClass("hid", !active);
    });
}

function getDragAfterTab(container, x) {
    const buttons = [...container.querySelectorAll(".tab-button:not(.dragging)")];

    return buttons.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;

        if (offset < 0 && offset > closest.offset) return { offset, element: child };

        return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

applySavedTabOrder();

$(".tab-button").each((_, tab) => {
    const button = $(tab);

    tab.draggable = true;
    button.attr("title", "Drag to reorder");

    button.click(() => activateTab(tabIdFromButton(tab)));

    button.on("dragstart", (e) => {
        tab.classList.add("dragging");
        e.originalEvent.dataTransfer.effectAllowed = "move";
        e.originalEvent.dataTransfer.setData("text/plain", tab.id);
    });

    button.on("dragend", () => {
        tab.classList.remove("dragging");
        $(".tab-button").removeClass("drag-over");
        saveTabOrder();
    });
});

$("#menu-tabs").on("dragover", (e) => {
    e.preventDefault();

    const container = e.currentTarget;
    const dragging = container.querySelector(".tab-button.dragging");
    if (!dragging) return;

    const after = getDragAfterTab(container, e.originalEvent.clientX);
    $(".tab-button").removeClass("drag-over");

    if (after == null) {
        container.appendChild(dragging);
    } else {
        after.classList.add("drag-over");
        container.insertBefore(dragging, after);
    }
});

activateTab(tabIdFromButton($(".tab-button").first()[0]));
spotifyAuthMethod.on("change", () => {
    const method = spotifyAuthMethod.val();
    settings.credentials.spotifyAuthMethod = method;
    saveSettings();

    if (method === "cookie") {
        spotifyCookieFields.removeClass("hid").addClass("act");
        spotifyAppFields.removeClass("act").addClass("hid");
    } else {
        spotifyCookieFields.removeClass("act").addClass("hid");
        spotifyAppFields.removeClass("hid").addClass("act");
    }
});
spotifyAuthMethodHelp.click(() => {
    modal("Help", `
    Two ways to let Lyric Status read your Spotify playback:<br><br>
    <strong>App (Client ID/Secret)</strong> - the original method. Register a free app in the Spotify Developer Dashboard, set a redirect URI, and authorize it. More setup, but it's Spotify's actual documented flow.<br><br>
    <strong>Cookie (sp_dc)</strong> - no app registration. Uses the <code>sp_dc</code> cookie from a logged-in open.spotify.com browser session instead. To get it: open open.spotify.com in a browser and make sure you're logged in, open DevTools (F12) → Application/Storage tab → Cookies → open.spotify.com, and copy the value of the cookie named <code>sp_dc</code>. Paste just the value here, not the whole cookie string.<br><br>
    This uses an internal Spotify endpoint rather than a documented public API, same category as a few other tricks already used in this app (Musixmatch's token, for instance). It can break if Spotify changes that endpoint, and the cookie itself expires periodically and needs replacing when it does - the status next to the field will tell you if it's no longer working.
    `);
});
spotifyCookieInput.on("change", () => {
    settings.credentials.spotifyCookie = spotifyCookieInput.val().trim();
    saveSettings();
    spotifyCookieStatus.text("Not checked yet").css("color", "inherit");
});
checkSpotifyCookie.click(() => {
    checkSpotifyCookie.text("Checking...");
    spotifyCookieStatus.text("Checking...").css("color", "inherit");

    $.ajax({
        url: "/api/spotify/check-cookie",
        method: "POST",
        contentType: "application/json",
        success: (res) => {
            checkSpotifyCookie.text("Check");

            if (res.ok) {
                const expiresIn = Math.round((res.expiresAt - Date.now()) / 60000);
                spotifyCookieStatus.text(`Working - token valid for about ${expiresIn} more minutes.`).css("color", "rgba(0, 200, 0, var(--alpha))");
            } else {
                spotifyCookieStatus.text(res.error || "Cookie check failed.").css("color", "rgba(200, 0, 0, var(--alpha))");
            }
        },
        error: (xhr) => {
            checkSpotifyCookie.text("Check");
            spotifyCookieStatus.text((xhr.responseJSON && xhr.responseJSON.error) || "Request failed.").css("color", "rgba(200, 0, 0, var(--alpha))");
        }
    });
});
userTokenInput.change(() => {
    settings.credentials.token = userTokenInput.val().replace(/"/g, "");
    saveSettings();
});
checkTokenButton.click(() => {
    checkTokenButton.text("Checking...");

    let valid = checkToken(settings.credentials.token);

    checkTokenButton.text("Check");

    if(!valid) return modal("Token check", "Token is invalid.", { descriptionTextColor: "rgba(200, 0, 0, var(--alpha))" });
    modal("Token check", "Token is valid.", { descriptionTextColor: "rgba(0, 200, 0, var(--alpha))" });
});
clientIDInput.change(() => {
    settings.credentials.clientID = clientIDInput.val();
    saveSettings();
});
clientSecretInput.change(() => {
    settings.credentials.clientSecret = clientSecretInput.val();
    saveSettings();
});
customRedirectUriInput.change(() => {
    settings.credentials.customRedirectUri = customRedirectUriInput.val();
    saveSettings();
});
authorizeButton.click(() => {
    const clientId = settings.credentials.clientID;
    const redirectUri = settings.credentials.customRedirectUri;
    if (settings.credentials.useExternalAuthServer) {
        window.open("https://rocky-quintessential-island.glitch.me/login/" + settings.credentials.uuid, "_blank")
    } else {
        window.open(`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent("user-read-playback-state user-read-currently-playing user-modify-playback-state")}`, '_blank');
    }
});
useExternalAuthServer.click(() => {
    settings.credentials.useExternalAuthServer = useExternalAuthServer.prop("checked");
    saveSettings();
})
enableTimestampCheckbox.click(() => {
    settings.view.timestamp = enableTimestampCheckbox.prop("checked");
    saveSettings();

    statusPreview.text(getStatusString("La-la-la", 137000));
});
enableLabelCheckbox.click(() => {
    settings.view.label = enableLabelCheckbox.prop("checked");
    saveSettings();

    statusPreview.text(getStatusString("La-la-la", 137000));
});
fontStyleSelect.on("change", () => {
    settings.view.advanced.fontStyle = fontStyleSelect.val();
    saveSettings();

    statusPreview.text(getStatusString("La-la-la", 137000));
});
fontStyleHelp.click(() => {
    modal("Help", `
    Discord's custom status is plain text - there's no real font picker to hook into. What this does instead is remap your letters onto a different Unicode block that <em>looks</em> like a different typeface (the same trick "fancy text" generators use). It applies to whatever gets sent, whether Advanced status is on or not.<br><br>
    A couple of things worth knowing: it only remaps A-Z, a-z, and sometimes 0-9 - punctuation, spaces, and non-Latin lyrics pass through unchanged. Underline/strikethrough add a combining mark after each character instead of swapping the glyph. Some Discord themes/fonts render certain styles (script, fraktur) better than others - if it looks like tofu boxes, try a different style.
    `);
});
enableAdvancedSWT.click(() => {
    let state = enableAdvancedSWT.prop("checked");

    settings.view.advanced.enabled = state;
    saveSettings();

    advancedSWT
        .toggleClass("hid")
        .toggleClass("act");
    enableTimestampCheckbox.prop("disabled", state);
    enableLabelCheckbox.prop("disabled", state);
});
customEmojiHelp.click(() => {
    modal("Help", `
    <strong>Custom emoji</strong> option allows you to add an emoji before your status.<br>
    You can use either:<br>
    - A <strong>unicode emoji</strong>, e.g. 🎶. You can get one <a style="color: rgba(154, 154, 154, var(--alpha));" href="https://www.piliapp.com/emoji/list/">here</a>.<br>
    - A <strong>custom Discord emoji</strong>, by pasting its code in the form <code>&lt;:name:id&gt;</code> (static) or <code>&lt;a:name:id&gt;</code> (animated).<br>
    To get that code, go into any Discord chat, type a backslash immediately before the emoji (e.g. <code>\\:catjam:</code>) and send the message - Discord will show you the raw code instead of rendering the emoji. Copy that whole code into this field.<br>
    <strong>Important:</strong> once set, the emoji is visible to everyone viewing your status - no one needs Nitro to see it. The Nitro requirement is only on the account setting the status: without Nitro you can only use <strong>static</strong> custom emojis from a server you're a member of; <strong>animated</strong> emojis or emojis from servers you're not in require an active Nitro subscription on this account, or Discord will silently drop the emoji from your status.
    `);
});
customEmoji.on("input", (e) => {
    e.preventDefault();
    let value = customEmoji.val();

    settings.view.advanced.customEmoji = value;
    saveSettings();
});

// Emoji rotation
let emojiCacheData = { guilds: [], emojisByGuild: {}, fetchedAt: 0 };

function emojiCode(emoji) {
    return `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}>`;
}

function emojiImageUrl(emoji) {
    return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}?size=32`;
}

function allKnownEmojis() {
    let list = [];

    for (const guildId of Object.keys(emojiCacheData.emojisByGuild)) {
        for (const emoji of emojiCacheData.emojisByGuild[guildId]) {
            list.push(emoji);
        }
    }

    return list;
}

function matchesNitroFilter(emoji, filter) {
    if (filter === "both") return true;
    if (filter === "nitro") return emoji.animated;
    return !emoji.animated;
}

function currentPool() {
    const rotation = settings.view.advanced.emojiRotation;

    if (rotation.mode === "custom") {
        return (rotation.customEmojis || []).filter(Boolean);
    }

    if (rotation.mode === "server") {
        const emojis = emojiCacheData.emojisByGuild[rotation.guildId] || [];
        return emojis.filter((e) => matchesNitroFilter(e, rotation.nitroFilter)).map(emojiCode);
    }

    // all
    return allKnownEmojis()
        .filter((e) => matchesNitroFilter(e, rotation.nitroFilter))
        .map(emojiCode);
}

function renderGuildDropdown() {
    const rotation = settings.view.advanced.emojiRotation;

    emojiRotationGuild.empty();

    if (!emojiCacheData.guilds.length) {
        emojiRotationGuild.append(`<option value="">No servers loaded - click Refresh</option>`);
        return;
    }

    for (const guild of emojiCacheData.guilds) {
        emojiRotationGuild.append(`<option value="${guild.id}">${$("<div>").text(guild.name).html()}</option>`);
    }

    if (rotation.guildId) emojiRotationGuild.val(rotation.guildId);
}

function renderEmojiPickerGrid() {
    const rotation = settings.view.advanced.emojiRotation;

    emojiPickerGrid.empty();
    emojiRotationGuildRow.toggleClass("hid", rotation.mode !== "server");

    if (rotation.mode === "custom") {
        const known = allKnownEmojis();

        if (!known.length) {
            emojiPickerGrid.append(`<span class="b-area">No emojis loaded yet - click "Refresh emoji list" below.</span>`);
        }

        for (const emoji of known) {
            const code = emojiCode(emoji);
            const selected = (rotation.customEmojis || []).includes(code);

            const el = $(`<img src="${emojiImageUrl(emoji)}" title=":${emoji.name}:" class="clickable" style="width: 28px; height: 28px; border-radius: 4px; padding: 2px; box-sizing: content-box; border: 2px solid ${selected ? "rgba(88, 170, 88, var(--alpha))" : "transparent"};">`);

            el.click(() => {
                const list = rotation.customEmojis || [];
                const idx = list.indexOf(code);

                if (idx === -1) list.push(code);
                else list.splice(idx, 1);

                rotation.customEmojis = list;
                saveSettings();
                renderEmojiPickerGrid();
                updateEmojiPoolCount();
            });

            emojiPickerGrid.append(el);
        }
    } else {
        // server / all: read-only preview of what's currently in the pool
        const emojis = rotation.mode === "server"
            ? (emojiCacheData.emojisByGuild[rotation.guildId] || [])
            : allKnownEmojis();

        const filtered = emojis.filter((e) => matchesNitroFilter(e, rotation.nitroFilter));

        if (!filtered.length) {
            emojiPickerGrid.append(`<span class="b-area">No matching emojis found. Try refreshing or changing the filter.</span>`);
        }

        for (const emoji of filtered) {
            emojiPickerGrid.append(`<img src="${emojiImageUrl(emoji)}" title=":${emoji.name}:" style="width: 28px; height: 28px; border-radius: 4px;">`);
        }
    }
}

function updateEmojiPoolCount() {
    const count = currentPool().length;
    emojiPoolCount.text(`${count} emoji${count === 1 ? "" : "s"} currently in rotation`);
}

const curatedUnicodeEmojis = ["🎶", "🎵", "🎧", "🎤", "🎸", "🎹", "🥁", "🔥", "✨", "💫", "🌙", "⭐", "💜", "🖤", "🤍", "😌", "😴", "🥀", "👑", "📀"];

function renderCustomEmojiPicker() {
    customEmojiPicker.empty();
    customEmojiPicker.append(`<option value="">Pick emoji...</option>`);

    const unicodeGroup = $(`<optgroup label="Unicode"></optgroup>`);
    for (const emoji of curatedUnicodeEmojis) {
        unicodeGroup.append(`<option value="${emoji}">${emoji}</option>`);
    }
    customEmojiPicker.append(unicodeGroup);

    const known = allKnownEmojis();

    if (known.length) {
        const serverGroup = $(`<optgroup label="Server emojis"></optgroup>`);
        for (const emoji of known) {
            serverGroup.append(`<option value="${emojiCode(emoji)}">${emoji.animated ? "▶ " : ""}:${emoji.name}:</option>`);
        }
        customEmojiPicker.append(serverGroup);
    }
}

function loadEmojiCache() {
    $.get("/api/emojis")
        .done((data) => {
            emojiCacheData = data;
            renderGuildDropdown();
            renderEmojiPickerGrid();
            renderCustomEmojiPicker();
            updateEmojiPoolCount();
        })
        .fail(() => {});
}

customEmojiPicker.on("change", () => {
    const value = customEmojiPicker.val();

    if (!value) return;

    customEmoji.val(value);
    settings.view.advanced.customEmoji = value;
    saveSettings();
    customEmojiPicker.val("");
});

enableEmojiRotation.click(() => {
    const state = enableEmojiRotation.prop("checked");

    settings.view.advanced.emojiRotation.enabled = state;
    saveSettings();

    emojiRotationSWT
        .toggleClass("hid")
        .toggleClass("act");
});
emojiRotationHelp.click(() => {
    modal("Help", `
    <strong>Rotate emoji</strong> cycles through a pool of emojis instead of always using the same one - a new emoji is picked each time your status line updates.<br><br>
    <strong>Emoji source:</strong><br>
    - <strong>Chosen emojis</strong>: click emojis below to build your own rotation list.<br>
    - <strong>One server's emojis</strong>: rotate through every emoji in a single server you pick.<br>
    - <strong>All servers' emojis</strong>: rotate through every emoji across every server you're in.<br><br>
    <strong>Emoji type</strong> filters the pool by whether the emoji is animated. Animated emojis (and any custom emoji from a server your Nitro-less account isn't a member of) will silently fail to apply without an active Nitro subscription on this account - use "Static only" if you don't have Nitro.<br><br>
    <strong>Order</strong> controls how the next emoji is picked:<br>
    - <strong>Sequential</strong>: goes through the pool in a fixed order, looping back to the start.<br>
    - <strong>Random</strong>: picks any emoji at random each time - some may repeat back-to-back, some may not show up for a while.<br>
    - <strong>Shuffled</strong>: randomizes the order once, then goes through every emoji exactly once before reshuffling - unpredictable but fair.<br><br>
    Click <strong>Refresh emoji list from Discord</strong> to (re)load the servers and emojis available to this account. This can take a few seconds if the account is in many servers.
    `);
});
emojiRotationMode.on("change", () => {
    settings.view.advanced.emojiRotation.mode = emojiRotationMode.val();
    saveSettings();
    renderEmojiPickerGrid();
    updateEmojiPoolCount();
});
emojiRotationGuild.on("change", () => {
    settings.view.advanced.emojiRotation.guildId = emojiRotationGuild.val();
    saveSettings();
    renderEmojiPickerGrid();
    updateEmojiPoolCount();
});
emojiRotationNitroFilter.on("change", () => {
    settings.view.advanced.emojiRotation.nitroFilter = emojiRotationNitroFilter.val();
    saveSettings();
    renderEmojiPickerGrid();
    updateEmojiPoolCount();
});
emojiRotationOrder.on("change", () => {
    settings.view.advanced.emojiRotation.order = emojiRotationOrder.val();
    saveSettings();
});
refreshEmojiListButton.click(() => {
    emojiRefreshStatus.text("Refreshing...");
    refreshEmojiListButton.prop("disabled", true);

    $.post("/api/emojis/refresh")
        .done((data) => {
            emojiCacheData = data;
            emojiRefreshStatus.text(`Loaded ${data.guilds.length} servers.`);
            renderGuildDropdown();
            renderEmojiPickerGrid();
            renderCustomEmojiPicker();
            updateEmojiPoolCount();
        })
        .fail((xhr) => {
            const message = (xhr.responseJSON && xhr.responseJSON.error) || "Failed to refresh - check your token is set.";
            emojiRefreshStatus.text(message);
        })
        .always(() => {
            refreshEmojiListButton.prop("disabled", false);
        });
});
// Emoji rotation

customStatusHelp.click(() => {
    modal("Help", `
    <strong>Custom status</strong> option allows you to customise your status as you want.<br>
    To display text such as lyrics or timestamp you need to put it in {} brackets.<br>List of all variables you can use (upper/lower attribute means uppercased/lowercased text):<br>

    {lyrics}, {lyrics_upper}, {lyrics_lower}, {lyrics_letters_only}, {lyrics_upper_letters_only}, {lyrics_lower_letters_only} - These variables contains current synchronized lyrics. <strong>letters_only</strong> attribute means there's no punctuations like dots and commas.<br>
    {song_name}, {song_name_upper}, {song_name_lower}, {song_name_cropped}, {song_name_upper_cropped}, {song_name_lower_cropped} - These variables contain current song name. <strong>cropped</strong> attribute means only song name without any other text.<br>
    {song_author}, {song_author_upper}, {song_author_lower} - These variables contains song author.<br><br>
    <strong>Note: Lyrics Status will automatically crop your status if it's too long. Discord not allowing statuses with length over 128 symbols.</strong>
    `);
});
customStatus.on("input", (e) => {
    e.preventDefault();
    let value = customStatus.val();

    settings.view.advanced.customStatus = value;
    saveSettings();
});
sendTimeOffset.on("input", (e) => {
    e.preventDefault();
    let value = +sendTimeOffset.val();

    if(isNaN(value)) {
        sendTimeOffset.css("color", "rgba(200, 0, 0, var(--alpha))");
        $("#send-time-offset-help").css({ animation: "light 2s infinite alternate" });

        return;
    } else {
        sendTimeOffset.css("color", "inherit");
        $("#send-time-offset-help").css({ animation: "" });
    }

    settings.timings.sendTimeOffset = value;
    saveSettings();
});
sendTimeOffsetHelp.click(() => modal("Help", `
Offset makes status changes appear before the lyrics have changed to make them look more synchronized.<br>
You can change it to your preference.<br>
If you don't have Spotify Premium you can set it to -200 because NetEase Music and QQMusic lyrics can appear faster than the actual song's words, but still it may be song-dependent.<br>
The offset time is defined in milliseconds. The default value is 500.<br><br>
This manual offset is always applied. If Autooffset or a per-song offset is enabled, those are added on top of this value.
`));
playbackPollInterval.on("input", (e) => {
    e.preventDefault();
    let value = +playbackPollInterval.val();

    if (isNaN(value) || value < 250) {
        playbackPollInterval.css("color", "rgba(200, 0, 0, var(--alpha))");
        return;
    }

    playbackPollInterval.css("color", "inherit");
    settings.timings.playbackPollInterval = value;
    saveSettings();
});
playbackPollIntervalHelp.click(() => modal("Help", `
    Controls how often the bot checks Spotify for what's currently playing - this is how quickly it notices a <strong>new song has started</strong>. It's separate from how often the status itself updates.<br><br>
    Lower = faster song-change detection, but more requests to Spotify's API. Higher = slower detection, fewer requests.<br><br>
    Default is 1000ms (1 second). If songs start with lyrics immediately and you're missing the first line or two, try lowering this - 500ms is a reasonable floor before you risk running into Spotify's own rate limits. Minimum allowed is 250ms.
`));
enableAutooffset.click(() => {
    let state = enableAutooffset.prop("checked");

    settings.timings.enableAutooffset = state;
    saveSettings();
})
autooffset.on("input", (e) => {
    e.preventDefault();
    let value = +autooffset.val();

    if(isNaN(value)) {
        autooffset.css("color", "rgba(200, 0, 0, var(--alpha))");

        return;
    } else {
        autooffset.css("color", "inherit");
    }

    settings.timings.autooffset = value;
    saveSettings();
});
autooffsetHelp.click(() => modal("Help", `
Autooffset calculates an extra correction from recent status request timing. It is added on top of the manual Send time offset instead of replacing it.
`));
enableRateLimitMode.click(() => {
    settings.timings.rateLimit.enabled = enableRateLimitMode.prop("checked");
    saveSettings();
});
enableAutoBackoff.click(() => {
    settings.timings.rateLimit.autoBackoff = enableAutoBackoff.prop("checked");
    saveSettings();
});
backoffDuration.on("input", (e) => {
    e.preventDefault();
    let value = +backoffDuration.val();

    if (isNaN(value) || value < 0) {
        backoffDuration.css("color", "rgba(200, 0, 0, var(--alpha))");
        return;
    }

    backoffDuration.css("color", "inherit");
    settings.timings.rateLimit.backoffDurationMs = value;
    saveSettings();
});
backoffDurationHelp.click(() => {
    modal("Help", `
    When Discord returns a "you're rate limited" response, it always tells you the minimum time you have to wait before trying again - that minimum is always respected no matter what. This setting is a floor on top of it: if you'd rather pause longer than the bare minimum Discord asks for, set it here. Whichever is longer - Discord's minimum or this value - is what actually gets used.
    `);
});
minSendInterval.on("input", (e) => {
    e.preventDefault();
    let value = +minSendInterval.val();

    if (isNaN(value)) {
        minSendInterval.css("color", "rgba(200, 0, 0, var(--alpha))");
        return;
    }

    minSendInterval.css("color", "inherit");
    settings.timings.rateLimit.minSendInterval = value;
    saveSettings();
});
enableLineMerge.click(() => {
    settings.timings.rateLimit.mergeLines = enableLineMerge.prop("checked");
    saveSettings();
});
mergeLineCount.on("input", (e) => {
    e.preventDefault();
    let value = +mergeLineCount.val();

    if (isNaN(value) || value < 1) {
        mergeLineCount.css("color", "rgba(200, 0, 0, var(--alpha))");
        return;
    }

    mergeLineCount.css("color", "inherit");
    settings.timings.rateLimit.mergeLineCount = value;
    saveSettings();
});
enableSmartMerge.click(() => {
    const state = enableSmartMerge.prop("checked");

    settings.timings.rateLimit.smartMerge.enabled = state;
    saveSettings();

    smartMergeSWT
        .toggleClass("hid")
        .toggleClass("act");
    enableLineMerge.prop("disabled", state);
    mergeLineCount.prop("disabled", state);
});
smartMergeHelp.click(() => {
    modal("Help", `
    <strong>Smart merging</strong> is an alternative to the fixed "Merge line count" above - instead of always combining a set number of lines, it decides how many lines to combine based on how long they are. While it's on, it replaces the fixed merge count entirely.<br><br>
    <strong>Max combined words:</strong> consecutive short lines keep getting added to the same status update as long as the running total stays at or under this many words.<br><br>
    <strong>Solo line word threshold:</strong> any single line longer than this many words is always sent on its own, never combined with neighboring lines - even if it would technically fit under the max above.<br><br>
    Example with the defaults (20 / 10): three short lines totaling 18 words get merged into one status. A 14-word line right after gets sent alone, since it's over the solo threshold.
    `);
});
smartMergeMaxWords.on("input", (e) => {
    e.preventDefault();
    let value = +smartMergeMaxWords.val();

    if (isNaN(value) || value < 1) {
        smartMergeMaxWords.css("color", "rgba(200, 0, 0, var(--alpha))");
        return;
    }

    smartMergeMaxWords.css("color", "inherit");
    settings.timings.rateLimit.smartMerge.maxCombinedWords = value;
    saveSettings();
});
smartMergeSoloThreshold.on("input", (e) => {
    e.preventDefault();
    let value = +smartMergeSoloThreshold.val();

    if (isNaN(value) || value < 1) {
        smartMergeSoloThreshold.css("color", "rgba(200, 0, 0, var(--alpha))");
        return;
    }

    smartMergeSoloThreshold.css("color", "inherit");
    settings.timings.rateLimit.smartMerge.soloWordThreshold = value;
    saveSettings();
});
function updatePlaybackSourceStatus() {
    if (settings.playback.source === "discordPresence") {
        playbackSourceStatus.text("Reads your \"Listening to Spotify\" activity off your Discord presence. No Spotify app/OAuth needed - but you need to be in at least one Discord server, and it can lag a few seconds behind actual playback.");
    } else {
        playbackSourceStatus.text("Polls the Spotify Web API directly. Needs the Spotify app credentials in the Connection section above.");
    }
}
playbackSourceSelect.on("change", () => {
    settings.playback.source = playbackSourceSelect.val();
    saveSettings();
    updatePlaybackSourceStatus();
});
playbackSourceHelp.click(() => {
    modal("Help", `
    Controls where Lyric Status gets "what song is playing right now" from.<br><br>
    <strong>Spotify API</strong> (default) - polls Spotify directly using the app credentials you set up in the Connection section. Most accurate and lowest latency.<br><br>
    <strong>Discord presence</strong> - instead of talking to Spotify at all, this reads the "Listening to Spotify" activity Discord already shows on your profile, over a read-only connection to Discord. No Spotify app to register. The tradeoff: it needs you to be in at least one Discord server for presence events to reach it, Discord's own Spotify activity data can be a few seconds behind real playback, and pausing shows up as the activity disappearing rather than a clean "paused" state.<br><br>
    This only changes where song/timing info comes from - it doesn't affect which lyric sources are used, and it doesn't touch how your status gets sent (that's still the normal REST call either way).
    `);
});
function updateGatewayStatus(runtime) {
    if (!settings.gateway.enabled) {
        gatewayStatus.text("Off").css("color", "inherit");
        return;
    }

    if (!runtime) {
        gatewayStatus.text("Enabled - restart dihlyrics if it does not connect.").css("color", "rgba(220, 180, 80, var(--alpha))");
        return;
    }

    if (runtime.connected) {
        gatewayStatus.text(`Connected - ${runtime.recentSends || 0}/5 sends in the last 20s`).css("color", "rgba(0, 200, 0, var(--alpha))");
    } else if (runtime.reconnecting) {
        gatewayStatus.text("Reconnecting...").css("color", "rgba(220, 180, 80, var(--alpha))");
    } else {
        gatewayStatus.text("Disconnected").css("color", "rgba(200, 0, 0, var(--alpha))");
    }
}
gatewayEnabled.click(() => {
    settings.gateway.enabled = gatewayEnabled.prop("checked");
    saveSettings();
    updateGatewayStatus(null);
});
gatewayPresenceStatus.on("change", () => {
    settings.gateway.presenceStatus = gatewayPresenceStatus.val();
    saveSettings();
});
gatewayMinInterval.on("input", (e) => {
    e.preventDefault();
    let value = +gatewayMinInterval.val();

    if (isNaN(value) || value < 0) {
        gatewayMinInterval.css("color", "rgba(200, 0, 0, var(--alpha))");
        return;
    }

    gatewayMinInterval.css("color", "inherit");
    settings.gateway.minIntervalMs = value;
    saveSettings();
});
gatewayHelp.click(() => {
    modal("Gateway WebSocket", `
    When enabled, dihlyrics opens a Discord Gateway WebSocket and sends custom status updates over that connection. If the socket is unavailable, status updates fall back to the existing REST request path.<br><br>
    <strong>Min send interval</strong> is an extra local floor between gateway status sends. Discord still has its own presence limit, so the client also caps sends at 5 updates per 20 seconds.<br><br>
    <strong>Status flash</strong> keeps the current lyric status text and cycles your presence state through the selected presets while playback is active. The restore option is applied when playback stops.<br><br>
    Changing this setting saves immediately. Restart dihlyrics after toggling the WebSocket on or off so the background connection starts cleanly.
    `);
});
function updateStatusFlashButtons() {
    const states = Array.isArray(settings.statusFlash.states) && settings.statusFlash.states.length
        ? settings.statusFlash.states
        : ["online", "idle", "dnd"];

    $(".presence-state-btn").each((_, button) => {
        const btn = $(button);
        btn.toggleClass("active", states.includes(btn.data("state")));
    });
}
statusFlashEnabled.click(() => {
    settings.statusFlash.enabled = statusFlashEnabled.prop("checked");
    saveSettings();
});
statusFlashInterval.on("input", (e) => {
    e.preventDefault();
    let value = +statusFlashInterval.val();

    if (isNaN(value) || value < 300) {
        statusFlashInterval.css("color", "rgba(200, 0, 0, var(--alpha))");
        return;
    }

    statusFlashInterval.css("color", "inherit");
    settings.statusFlash.intervalMs = value;
    saveSettings();
});
statusFlashRestore.on("change", () => {
    settings.statusFlash.restoreStatus = statusFlashRestore.val() || "";
    saveSettings();
});
$(".presence-state-btn").click((e) => {
    const state = $(e.currentTarget).data("state");
    const states = Array.isArray(settings.statusFlash.states) ? [...settings.statusFlash.states] : ["online", "idle", "dnd"];
    const index = states.indexOf(state);

    if (index === -1) {
        states.push(state);
    } else {
        if (states.length <= 1) return modal("Status flash", "At least one cycle state must stay selected.", { descriptionTextColor: "rgba(200, 0, 0, var(--alpha))" });
        states.splice(index, 1);
    }

    const order = ["online", "idle", "dnd", "invisible"];
    settings.statusFlash.states = order.filter((candidate) => states.includes(candidate));
    updateStatusFlashButtons();
    saveSettings();
});
function renderTerminalSectionsList() {
    terminalSectionsList.empty();

    if (!Array.isArray(settings.terminal.sectionOrder)) settings.terminal.sectionOrder = [...DEFAULT_TERMINAL_SECTION_ORDER];

    for (const section of DEFAULT_TERMINAL_SECTION_ORDER) {
        if (!settings.terminal.sectionOrder.includes(section)) settings.terminal.sectionOrder.push(section);
    }

    settings.terminal.sectionOrder = settings.terminal.sectionOrder.filter((section) => TERMINAL_SECTION_LABELS[section]);

    settings.terminal.sectionOrder.forEach((section, i) => {
        const enableKey = TERMINAL_SECTION_ENABLE_KEYS[section];
        const row = $(`
        <div class="source-item" draggable="true" data-section="${section}">
            <span class="drag-handle">::</span>
            <span class="source-position">${i + 1}</span>
            <input type="checkbox" class="terminal-section-enable-checkbox" ${settings.terminal[enableKey] ? "checked" : ""}>
            <span class="source-name">${TERMINAL_SECTION_LABELS[section]}</span>
        </div>
        `);

        row.find(".terminal-section-enable-checkbox").on("change", (e) => {
            settings.terminal[enableKey] = $(e.target).prop("checked");
            settings.terminal.preset = "custom";
            saveSettings();
            renderTerminalPresets();
        });

        row.on("dragstart", (e) => {
            e.originalEvent.dataTransfer.effectAllowed = "move";
            e.originalEvent.dataTransfer.setData("text/plain", section);
            row.addClass("dragging");
        });
        row.on("dragend", () => {
            row.removeClass("dragging");
            $(".terminal-sections-list .source-item").removeClass("drag-over");
        });
        row.on("dragover", (e) => {
            e.preventDefault();
            row.addClass("drag-over");
        });
        row.on("dragleave", () => row.removeClass("drag-over"));
        row.on("drop", (e) => {
            e.preventDefault();
            row.removeClass("drag-over");

            const draggedSection = e.originalEvent.dataTransfer.getData("text/plain");
            if (!draggedSection || draggedSection === section) return;

            const order = settings.terminal.sectionOrder;
            const fromIndex = order.indexOf(draggedSection);
            const toIndex = order.indexOf(section);
            if (fromIndex === -1 || toIndex === -1) return;

            order.splice(fromIndex, 1);
            order.splice(toIndex, 0, draggedSection);

            settings.terminal.preset = "custom";
            saveSettings();
            renderTerminalSectionsList();
            renderTerminalPresets();
        });

        terminalSectionsList.append(row);
    });
}
function bindTerminalNumber(el, key, min, max) {
    el.on("input", (e) => {
        e.preventDefault();
        let value = +el.val();

        if (isNaN(value) || value < min || value > max) {
            el.css("color", "rgba(200, 0, 0, var(--alpha))");
            return;
        }

        el.css("color", "inherit");
        settings.terminal[key] = value;
        settings.terminal.preset = "custom";
        saveSettings();
        renderTerminalPresets();
    });
}
function bindTerminalColor(el, key) {
    el.on("input", () => {
        settings.terminal[key] = el.val();
        settings.terminal.preset = "custom";
        saveSettings();
        renderTerminalPresets();
    });
}
function syncTerminalControls() {
    terminalAlbumArtWidth.val(settings.terminal.albumArtWidth != null ? settings.terminal.albumArtWidth : 28);
    terminalRefreshMs.val(settings.terminal.refreshMs != null ? settings.terminal.refreshMs : 1000);
    terminalBackgroundColor.val(settings.terminal.backgroundColor || "#121314");
    terminalTextColor.val(settings.terminal.textColor || "#e8ebf0");
    terminalAccentColor.val(settings.terminal.accentColor || "#50c882");
    renderTerminalSectionsList();
    renderTerminalPresets();
}
function renderTerminalPresets() {
    terminalPresetsList.empty();

    Object.keys(TERMINAL_PRESETS).forEach((id) => {
        const preset = TERMINAL_PRESETS[id];
        const card = $(`
        <div class="preset-card ${settings.terminal.preset === id ? "active" : ""}">
            <span class="preset-card-title">${preset.name}</span>
            <span class="preset-card-description">${preset.description}</span>
            <button class="button1 action-button">Apply terminal preset</button>
        </div>
        `);

        card.find("button").click(() => {
            settings.terminal = $.extend(true, settings.terminal, preset.terminal);
            saveSettings();
            syncTerminalControls();
        });

        terminalPresetsList.append(card);
    });
}
resetTerminalSections.click(() => {
    settings.terminal.sectionOrder = [...DEFAULT_TERMINAL_SECTION_ORDER];
    settings.terminal.preset = "custom";
    saveSettings();
    renderTerminalSectionsList();
    renderTerminalPresets();
});
bindTerminalNumber(terminalAlbumArtWidth, "albumArtWidth", 8, 64);
bindTerminalNumber(terminalRefreshMs, "refreshMs", 250, 10000);
bindTerminalColor(terminalBackgroundColor, "backgroundColor");
bindTerminalColor(terminalTextColor, "textColor");
bindTerminalColor(terminalAccentColor, "accentColor");
function bindStatusEmojiInput(el, key) {
    el.on("input", () => {
        settings.statusEmojis[key] = el.val();
        saveSettings();
    });
}
enableStatusEmojis.click(() => {
    settings.statusEmojis.enabled = enableStatusEmojis.prop("checked");
    saveSettings();
});
bindStatusEmojiInput(statusEmojiPlaying, "playing");
bindStatusEmojiInput(statusEmojiPaused, "paused");
bindStatusEmojiInput(statusEmojiNoLyrics, "noLyrics");
bindStatusEmojiInput(statusEmojiFallback, "fallback");
function songOffsetKey(songName, artist) {
    return `${songName || ""}::${artist || ""}`.trim().toLowerCase();
}
function currentSongOffsetEntry() {
    if (!latestNowPlaying || !latestNowPlaying.songName) return null;

    const key = latestNowPlaying.songOffsetKey || songOffsetKey(latestNowPlaying.songName, latestNowPlaying.songAuthor);

    return {
        key,
        songName: latestNowPlaying.songName,
        artist: latestNowPlaying.songAuthor || "",
        offsetMs: 0
    };
}
function renderSongOffsets() {
    songOffsetsList.empty();
    const entries = Array.isArray(settings.songOffsets.entries) ? settings.songOffsets.entries : [];

    if (!entries.length) {
        songOffsetsList.append(`<span class="b-area">No saved song offsets yet.</span>`);
        return;
    }

    entries.forEach((entry, i) => {
        const row = $(`
        <div class="source-item" data-offset-key="${$("<div>").text(entry.key).html()}">
            <span class="source-position">${i + 1}</span>
            <span class="source-name">${$("<div>").text(`${entry.songName} - ${entry.artist || "Unknown artist"}`).html()}</span>
            <input style="width: 70px;" class="text-input1 song-offset-row-value" type="text" maxlength="6" value="${Number(entry.offsetMs) || 0}">
            <button class="button1 mini-button song-offset-delete">Delete</button>
        </div>
        `);

        row.find(".song-offset-row-value").on("input", (e) => {
            const value = +$(e.target).val();
            if (isNaN(value)) return $(e.target).css("color", "rgba(200, 0, 0, var(--alpha))");

            $(e.target).css("color", "inherit");
            entry.offsetMs = value;
            saveSettings();
        });

        row.find(".song-offset-delete").click(() => {
            settings.songOffsets.entries = entries.filter((candidate) => candidate.key !== entry.key);
            saveSettings();
            renderSongOffsets();
            updateSongOffsetCurrent();
        });

        songOffsetsList.append(row);
    });
}
function updateSongOffsetCurrent() {
    const current = currentSongOffsetEntry();

    if (!current) {
        songOffsetCurrent.text("No song detected yet");
        return;
    }

    const existing = (settings.songOffsets.entries || []).find((entry) => entry.key === current.key);
    songOffsetCurrent.text(`${current.songName} - ${current.artist || "Unknown artist"}${existing ? ` (${existing.offsetMs}ms saved)` : ""}`);
    if (existing) songOffsetValue.val(existing.offsetMs);
}
enableSongOffsets.click(() => {
    settings.songOffsets.enabled = enableSongOffsets.prop("checked");
    saveSettings();
});
saveCurrentSongOffset.click(() => {
    const current = currentSongOffsetEntry();
    if (!current) return modal("Song offsets", "No current song is available yet.", { descriptionTextColor: "rgba(200, 0, 0, var(--alpha))" });

    const value = +songOffsetValue.val();
    if (isNaN(value)) return modal("Song offsets", "Offset must be a number of milliseconds.", { descriptionTextColor: "rgba(200, 0, 0, var(--alpha))" });

    const entries = Array.isArray(settings.songOffsets.entries) ? settings.songOffsets.entries : [];
    const existing = entries.find((entry) => entry.key === current.key);

    if (existing) {
        existing.songName = current.songName;
        existing.artist = current.artist;
        existing.offsetMs = value;
    } else {
        entries.push({ ...current, offsetMs: value });
    }

    settings.songOffsets.entries = entries;
    saveSettings();
    renderSongOffsets();
    updateSongOffsetCurrent();
});
function cloneSettingsValue(value) {
    return JSON.parse(JSON.stringify(value));
}
function fixMojibakeEmoji(value, fallback) {
    const text = String(value || "");

    if (!text || text.includes("Ã") || text.includes("ðŸ")) return fallback;

    return text;
}
function normalizeStatusEmojis(target) {
    if (!target.statusEmojis) target.statusEmojis = {};

    target.statusEmojis.playing = fixMojibakeEmoji(target.statusEmojis.playing, "\uD83C\uDFB6");
    target.statusEmojis.paused = fixMojibakeEmoji(target.statusEmojis.paused, "\u23F8");
    target.statusEmojis.noLyrics = fixMojibakeEmoji(target.statusEmojis.noLyrics, "\uD83D\uDD0D");
    target.statusEmojis.fallback = fixMojibakeEmoji(target.statusEmojis.fallback, "\uD83C\uDFB6");
}
function profileSnapshot() {
    const snapshot = {};

    PROFILE_KEYS.forEach((key) => {
        snapshot[key] = cloneSettingsValue(settings[key]);
    });

    return snapshot;
}
function maskToken(token) {
    const text = String(token || "");
    if (!text) return "none";
    if (text.length <= 12) return "saved";

    return `${text.slice(0, 6)}...${text.slice(-4)}`;
}
function onOff(value) {
    return value ? "on" : "off";
}
function profileSummary(profile) {
    const data = profile.data || {};
    const sources = data.sources || {};
    const enabledSources = (sources.order || [])
        .filter((name) => sources[SOURCE_ENABLE_KEYS[name]])
        .slice(0, 4);
    const terminalPreset = data.terminal?.preset || "custom";
    const terminalPresetName = TERMINAL_PRESETS[terminalPreset]?.name || "Custom";
    const emojiMode = data.statusEmojis?.enabled
        ? "status emojis"
        : (data.view?.advanced?.emojiRotation?.enabled ? "emoji rotation" : "single emoji");

    return [
        `Token: ${maskToken(data.credentials?.token)}`,
        `Spotify: ${data.credentials?.spotifyAuthMethod || "app"}`,
        `Playback: ${data.playback?.source === "discordPresence" ? "Discord presence" : "Spotify API"}`,
        `Terminal: ${terminalPresetName}`,
        `Sources: ${enabledSources.length ? enabledSources.join(", ") : "none"}`,
        `Gateway: ${onOff(data.gateway?.enabled)}`,
        `Flash: ${onOff(data.statusFlash?.enabled)}`,
        `Emoji: ${emojiMode}`,
        `Song offsets: ${data.songOffsets?.entries?.length || 0}`
    ];
}
function renderProfiles() {
    profilesList.empty();
    activeProfile.text(`Active profile: ${settings.profiles.active || "none"}`);

    const profiles = Array.isArray(settings.profiles.items) ? settings.profiles.items : [];
    if (!profiles.length) {
        profilesList.append(`<span class="b-area">No profiles saved yet.</span>`);
        return;
    }

    profiles.forEach((profile, i) => {
        const summary = profileSummary(profile).map((line) => `<span>${$("<div>").text(line).html()}</span>`).join("");
        const row = $(`
        <div class="source-item profile-item">
            <span class="source-position">${i + 1}</span>
            <span class="source-name">${$("<div>").text(profile.name).html()}</span>
            <button class="button1 mini-button profile-apply">Apply profile</button>
            <button class="button1 mini-button profile-overwrite">Update saved profile</button>
            <button class="button1 mini-button profile-delete">Delete profile</button>
            <div class="profile-summary">${summary}</div>
        </div>
        `);

        row.find(".profile-apply").click(() => {
            PROFILE_KEYS.forEach((key) => {
                if (profile.data && profile.data[key] != null) settings[key] = cloneSettingsValue(profile.data[key]);
            });
            settings.profiles.active = profile.name;
            saveSettings();
            loadSettings(JSON.stringify(settings));
        });

        row.find(".profile-overwrite").click(() => {
            profile.data = profileSnapshot();
            settings.profiles.active = profile.name;
            saveSettings();
            renderProfiles();
        });

        row.find(".profile-delete").click(() => {
            settings.profiles.items = profiles.filter((candidate) => candidate.id !== profile.id);
            if (settings.profiles.active === profile.name) settings.profiles.active = "";
            saveSettings();
            renderProfiles();
        });

        profilesList.append(row);
    });
}
saveProfile.click(() => {
    const name = String(profileName.val() || "").trim();
    if (!name) return modal("Profiles", "Give the profile a name first.", { descriptionTextColor: "rgba(200, 0, 0, var(--alpha))" });

    const profiles = Array.isArray(settings.profiles.items) ? settings.profiles.items : [];
    const existing = profiles.find((profile) => profile.name.toLowerCase() === name.toLowerCase());

    if (existing) {
        existing.name = name;
        existing.data = profileSnapshot();
    } else {
        profiles.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, name, data: profileSnapshot() });
    }

    settings.profiles.items = profiles;
    settings.profiles.active = name;
    profileName.val("");
    saveSettings();
    renderProfiles();
});
enableAutoupdate.click(() => {
    let state = enableAutoupdate.prop("checked");

    settings.update.enableAutoupdate = state;
    saveSettings();
})
restartLyricStatus.click(() => {
    restartLyricStatus.prop("disabled", true);
    restartLyricStatusStatus.text("Restart requested. Closing node.exe processes and opening a new Lyric Status terminal...");

    $.ajax({
        url: "/api/restart",
        method: "POST",
        contentType: "application/json",
        success: (res) => {
            restartLyricStatusStatus.text(res.message || "Restarting Lyric Status...");
        },
        error: (xhr) => {
            const message = (xhr.responseJSON && xhr.responseJSON.error) || "Restart request failed.";
            restartLyricStatus.prop("disabled", false);
            restartLyricStatusStatus.text(message);
        }
    });
});
sourcesHelp.click(() => {
    modal("Help", `
    Each lyric source is tried in the order shown, top to bottom, until one returns lyrics for the current song. Drag a row by its <strong>::</strong> handle to move it up or down. Unchecking a source skips it completely - it's never contacted.<br><br>
    <strong>LrcLib</strong> and <strong>Spotify</strong> are free/synced and enabled by default. <strong>QQ Music</strong> and <strong>NetEase</strong> are good fallbacks, mostly for Chinese-language tracks. <strong>Musixmatch</strong> is synced but needs a token that's generated automatically the first time it's used. <strong>Genius</strong> has huge coverage but isn't time-synced - lines are spaced out at a fixed rate, so it can drift on longer songs. <strong>Kugou</strong> is another Chinese-lyrics fallback.
    `);
});
regenerateMusixmatchToken.click(() => {
    settings.credentials.musixmatchToken = "";
    saveSettings();
    musixmatchTokenStatus.text("No token saved yet (will regenerate on next Musixmatch lookup)");
});
function renderSourcesList() {
    sourcesList.empty();

    // Back-fill any source that's missing from the saved order (e.g. after an update
    // adds a new one) so it still shows up in the list instead of silently vanishing.
    for (const name of Object.keys(SOURCE_LABELS)) {
        if (!settings.sources.order.includes(name)) settings.sources.order.push(name);
    }
    settings.sources.order = settings.sources.order.filter((name) => SOURCE_LABELS[name]);

    settings.sources.order.forEach((name, i) => {
        const enableKey = SOURCE_ENABLE_KEYS[name];
        const row = $(`
        <div class="source-item" draggable="true" data-source="${name}">
            <span class="drag-handle">::</span>
            <span class="source-position">${i + 1}</span>
            <input type="checkbox" class="source-enable-checkbox" ${settings.sources[enableKey] ? "checked" : ""}>
            <span class="source-name">${SOURCE_LABELS[name]}</span>
        </div>
        `);

        row.find(".source-enable-checkbox").on("change", (e) => {
            settings.sources[enableKey] = $(e.target).prop("checked");
            saveSettings();
        });

        row.on("dragstart", (e) => {
            e.originalEvent.dataTransfer.effectAllowed = "move";
            e.originalEvent.dataTransfer.setData("text/plain", name);
            row.addClass("dragging");
        });
        row.on("dragend", () => {
            row.removeClass("dragging");
            $(".source-item").removeClass("drag-over");
        });
        row.on("dragover", (e) => {
            e.preventDefault();
            row.addClass("drag-over");
        });
        row.on("dragleave", () => row.removeClass("drag-over"));
        row.on("drop", (e) => {
            e.preventDefault();
            row.removeClass("drag-over");

            const draggedName = e.originalEvent.dataTransfer.getData("text/plain");
            if (!draggedName || draggedName === name) return;

            const order = settings.sources.order;
            const fromIndex = order.indexOf(draggedName);
            const toIndex = order.indexOf(name);
            if (fromIndex === -1 || toIndex === -1) return;

            order.splice(fromIndex, 1);
            order.splice(toIndex, 0, draggedName);

            saveSettings();
            renderSourcesList();
        });

        sourcesList.append(row);
    });
}
// Events

function formatSeconds(s) {
    return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0' ) + s;
}
const FONT_STYLE_MAP = {
    bold:              [0x1D41A - 0x61, 0x1D400 - 0x41, null, 0x1D7CE - 0x30],
    italic:            [0x1D44E - 0x61, 0x1D434 - 0x41, { 0x68: "\u210E" }, null],
    bold_italic:       [0x1D482 - 0x61, 0x1D468 - 0x41, null, null],
    sans:              [0x1D5BA - 0x61, 0x1D5A0 - 0x41, null, 0x1D7E2 - 0x30],
    sans_bold:         [0x1D5EE - 0x61, 0x1D5D4 - 0x41, null, 0x1D7EC - 0x30],
    sans_italic:       [0x1D622 - 0x61, 0x1D608 - 0x41, null, null],
    sans_bold_italic:  [0x1D656 - 0x61, 0x1D63C - 0x41, null, null],
    double_struck:     [0x1D552 - 0x61, 0x1D538 - 0x41, { 0x43: "\u2102", 0x48: "\u210D", 0x4E: "\u2115", 0x50: "\u2119", 0x51: "\u211A", 0x52: "\u211D", 0x5A: "\u2124" }, 0x1D7D8 - 0x30],
    fraktur:           [0x1D51E - 0x61, 0x1D504 - 0x41, { 0x43: "\u212D", 0x48: "\u210C", 0x49: "\u2111", 0x52: "\u211C", 0x5A: "\u2128" }, null],
    fraktur_bold:      [0x1D586 - 0x61, 0x1D56C - 0x41, null, null],
    script:            [0x1D4B6 - 0x61, 0x1D49C - 0x41, { 0x65: "\u212F", 0x67: "\u210A", 0x6F: "\u2134", 0x42: "\u212C", 0x45: "\u2130", 0x46: "\u2131", 0x48: "\u210B", 0x49: "\u2110", 0x4C: "\u2112", 0x4D: "\u2133", 0x52: "\u211B" }, null],
    script_bold:       [0x1D4EA - 0x61, 0x1D4D0 - 0x41, null, null],
    monospace:         [0x1D68A - 0x61, 0x1D670 - 0x41, null, 0x1D7F6 - 0x30]
};
function applyFontStylePreview(text, style) {
    if (!text || !style || style === "none") return text;
    if (style === "underline") return [...text].map((ch) => (/\s/.test(ch) ? ch : ch + "\u0332")).join("");
    if (style === "strikethrough") return [...text].map((ch) => (/\s/.test(ch) ? ch : ch + "\u0336")).join("");

    const entry = FONT_STYLE_MAP[style];
    if (!entry) return text;

    return [...text].map((ch) => {
        const cp = ch.codePointAt(0);
        if (entry[2] && cp in entry[2]) return entry[2][cp];
        if (cp >= 0x61 && cp <= 0x7A) return String.fromCodePoint(cp + entry[0]);
        if (cp >= 0x41 && cp <= 0x5A) return String.fromCodePoint(cp + entry[1]);
        if (entry[3] != null && cp >= 0x30 && cp <= 0x39) return String.fromCodePoint(cp + entry[3]);
        return ch;
    }).join("");
}
function getStatusString(lyrics, time) {
    const base = `${settings.view.timestamp ? `[${formatSeconds((time / 1000).toFixed(0))}] ` : ""}${settings.view.label ? "Song lyrics - " : ""}${lyrics.replace("♪", "🎶")}`;
    return applyFontStylePreview(base, settings.view.advanced.fontStyle);
}
function checkToken(token) {
    let success = true;

    $.get({
        url: "https://discordapp.com/api/v8/users/@me",
        headers: {
            "Authorization": token
        },
        async: false,
        statusCode: {
            401: () => success = false
        }
    });

    return success;
}
let saveSettingsTimeout = null;
function saveSettings() {
    if (!settingsLoaded) return console.error("Can't save settings before they're loaded from server.")

    clearTimeout(saveSettingsTimeout);
    saveSettingsTimeout = setTimeout(() => {
        ws.send(JSON.stringify(settings))
    }, 300);
}
function loadSettings(settingsToLoad) {
    settingsToLoad = JSON.parse(settingsToLoad);

    settings = $.extend(true, settings, settingsToLoad);
    normalizeStatusEmojis(settings);
    (settings.profiles.items || []).forEach((profile) => {
        if (profile.data) normalizeStatusEmojis(profile.data);
    });

    try {
        userTokenInput.val(settings.credentials.token);
        spotifyAuthMethod.val(settings.credentials.spotifyAuthMethod || "app");
        spotifyCookieInput.val(settings.credentials.spotifyCookie || "");
        if ((settings.credentials.spotifyAuthMethod || "app") === "cookie") {
            spotifyCookieFields.removeClass("hid").addClass("act");
            spotifyAppFields.removeClass("act").addClass("hid");
        } else {
            spotifyCookieFields.removeClass("act").addClass("hid");
            spotifyAppFields.removeClass("hid").addClass("act");
        }
        clientIDInput.val(settings.credentials.clientID);
        clientSecretInput.val(settings.credentials.clientSecret);
        customRedirectUriInput.val(settings.credentials.customRedirectUri);
        useExternalAuthServer.prop("checked", settings.credentials.useExternalAuthServer)
        enableTimestampCheckbox.prop("checked", settings.view.timestamp);
        enableLabelCheckbox.prop("checked", settings.view.label);
        fontStyleSelect.val(settings.view.advanced.fontStyle || "none");
        enableAdvancedSWT.prop("checked", !!settings.view.advanced.enabled);
        advancedSWT.toggleClass("hid", !settings.view.advanced.enabled).toggleClass("act", !!settings.view.advanced.enabled);
        enableTimestampCheckbox.prop("disabled", !!settings.view.advanced.enabled);
        enableLabelCheckbox.prop("disabled", !!settings.view.advanced.enabled);
        customEmoji.val(settings.view.advanced.customEmoji);
        enableEmojiRotation.prop("checked", !!settings.view.advanced.emojiRotation.enabled);
        emojiRotationSWT.toggleClass("hid", !settings.view.advanced.emojiRotation.enabled).toggleClass("act", !!settings.view.advanced.emojiRotation.enabled);
        emojiRotationMode.val(settings.view.advanced.emojiRotation.mode);
        emojiRotationNitroFilter.val(settings.view.advanced.emojiRotation.nitroFilter);
        emojiRotationOrder.val(settings.view.advanced.emojiRotation.order);
        loadEmojiCache();
        customStatus.html(settings.view.advanced.customStatus);
        statusPreview.text(getStatusString("La-la-la", 137000));
        sendTimeOffset.val(settings.timings.sendTimeOffset);
        playbackPollInterval.val(settings.timings.playbackPollInterval);
        enableAutooffset.prop("checked", settings.timings.enableAutooffset);
        autooffset.val(settings.timings.autooffset);
        enableRateLimitMode.prop("checked", settings.timings.rateLimit.enabled);
        enableAutoBackoff.prop("checked", settings.timings.rateLimit.autoBackoff);
        backoffDuration.val(settings.timings.rateLimit.backoffDurationMs != null ? settings.timings.rateLimit.backoffDurationMs : 30000);
        minSendInterval.val(settings.timings.rateLimit.minSendInterval);
        enableLineMerge.prop("checked", settings.timings.rateLimit.mergeLines);
        mergeLineCount.val(settings.timings.rateLimit.mergeLineCount);
        enableSmartMerge.prop("checked", !!settings.timings.rateLimit.smartMerge.enabled);
        smartMergeSWT.toggleClass("hid", !settings.timings.rateLimit.smartMerge.enabled).toggleClass("act", !!settings.timings.rateLimit.smartMerge.enabled);
        enableLineMerge.prop("disabled", !!settings.timings.rateLimit.smartMerge.enabled);
        mergeLineCount.prop("disabled", !!settings.timings.rateLimit.smartMerge.enabled);
        smartMergeMaxWords.val(settings.timings.rateLimit.smartMerge.maxCombinedWords);
        smartMergeSoloThreshold.val(settings.timings.rateLimit.smartMerge.soloWordThreshold);
        enableAutoupdate.prop("checked", settings.update.enableAutoupdate)
        playbackSourceSelect.val(settings.playback.source || "spotify");
        updatePlaybackSourceStatus();
        gatewayEnabled.prop("checked", !!settings.gateway.enabled);
        gatewayPresenceStatus.val(settings.gateway.presenceStatus || "online");
        gatewayMinInterval.val(settings.gateway.minIntervalMs != null ? settings.gateway.minIntervalMs : 5000);
        statusFlashEnabled.prop("checked", !!settings.statusFlash.enabled);
        statusFlashInterval.val(settings.statusFlash.intervalMs != null ? settings.statusFlash.intervalMs : 2000);
        statusFlashRestore.val(settings.statusFlash.restoreStatus || "");
        updateStatusFlashButtons();
        enableStatusEmojis.prop("checked", !!settings.statusEmojis.enabled);
        statusEmojiPlaying.val(settings.statusEmojis.playing || "");
        statusEmojiPaused.val(settings.statusEmojis.paused || "");
        statusEmojiNoLyrics.val(settings.statusEmojis.noLyrics || "");
        statusEmojiFallback.val(settings.statusEmojis.fallback || "");
        syncTerminalControls();
        enableSongOffsets.prop("checked", !!settings.songOffsets.enabled);
        renderSongOffsets();
        updateSongOffsetCurrent();
        renderProfiles();
        updateGatewayStatus(null);
        renderSourcesList();
        musixmatchTokenStatus.text(settings.credentials.musixmatchToken ? "Token saved" : "No token saved yet");

        settingsLoaded = true
    } catch(e) {
        console.log(e)
    }
}
function modal(title, description, styles = {}) {
    let modalWindow = $(`
    <div class="modal">
        <div class="top">
            <span class="title" style="color: ${styles.titleTextColor || "white"};">${title}</span>
            <div class="close">
                <img class="closeMark" src="https://www.nicepng.com/png/full/61-612286_clip-art-check-mark-close-x-icon-png.png" height="14">
            </div>
        </div>
        <div class="description" style="color: ${styles.descriptionTextColor || "white"};">
            ${description}
        </div>
    </div>
    `);

    modalWindow.appendTo(document.body);

    for (let e of $(".close")) {
        e.parentNode.parentNode === modalWindow[0] ? $(e).click(() => { modalWindow.remove(); }) : null;
    }
}
// Util functions

const npEmpty          = $("#np-empty"),
      npPlaying        = $("#np-playing"),
      npBackdrop       = $("#np-backdrop"),
      npCover          = $("#np-cover"),
      npTitle          = $("#np-title"),
      npArtist         = $("#np-artist"),
      npTimeElapsed    = $("#np-time-elapsed"),
      npTimeTotal      = $("#np-time-total"),
      npProgressFill   = $("#np-progress-fill"),
      npPrev           = $("#np-prev"),
      npPlayPause      = $("#np-playpause"),
      npNext           = $("#np-next"),
      npLyrics         = $("#np-lyrics");

let npCurrentlyPlaying = false;
let npLastAlbumArt = "";
let latestNowPlaying = null;
let npLastLyricsKey = "";
let npLastCurrentLineIndex = -2;

function sendPlaybackControl(action) {
    $.ajax({
        url: "/api/playback/" + action,
        method: "POST",
        contentType: "application/json",
        error: (xhr) => {
            const msg = (xhr.responseJSON && xhr.responseJSON.error) || "Playback control failed.";
            console.error("Playback control (" + action + "):", msg);
        }
    });
}
npPrev.click(() => sendPlaybackControl("previous"));
npNext.click(() => sendPlaybackControl("next"));
npPlayPause.click(() => sendPlaybackControl(npCurrentlyPlaying ? "pause" : "play"));

function updateNowPlaying(np) {
    latestNowPlaying = np;

    if (!np || !np.songName) {
        npEmpty.removeClass("hid");
        npPlaying.addClass("hid");
        npLastLyricsKey = "";
        npLastCurrentLineIndex = -2;
        updateSongOffsetCurrent();
        return;
    }

    npEmpty.addClass("hid");
    npPlaying.removeClass("hid");

    if (np.albumArtUrl && np.albumArtUrl !== npLastAlbumArt) {
        npLastAlbumArt = np.albumArtUrl;
        npCover.attr("src", np.albumArtUrl);
        npBackdrop.css("background-image", `url(${np.albumArtUrl})`);
    } else if (!np.albumArtUrl) {
        npLastAlbumArt = "";
        npCover.attr("src", "");
        npBackdrop.css("background-image", "none");
    }

    npTitle.text(np.songName);
    npArtist.text(np.songAuthor || "");

    const elapsedSec = Math.max(0, Math.floor((np.songProgress || 0) / 1000));
    const totalSec = Math.max(0, Math.floor((np.songDuration || 0) / 1000));
    const pct = totalSec > 0 ? Math.min(100, (elapsedSec / totalSec) * 100) : 0;

    npTimeElapsed.text(formatSeconds(elapsedSec));
    npTimeTotal.text(formatSeconds(totalSec));
    npProgressFill.css("width", pct + "%");

    npCurrentlyPlaying = !!np.isPlaying;
    updateSongOffsetCurrent();
    npPlayPause.text(npCurrentlyPlaying ? "⏸" : "▶");

    const controllable = !!np.canControl;
    npPrev.prop("disabled", !controllable);
    npNext.prop("disabled", !controllable);
    npPlayPause.prop("disabled", !controllable);
    $("#now-playing-sidebar").attr("title", controllable ? "" : "Playback controls need the Spotify API playback source");

    updateGatewayStatus(np.gateway);

    const lines = np.lines || [];
    const lyricsKey = `${np.songName}|${np.songAuthor || ""}|${lines.length}|${lines[0]?.time ?? ""}|${lines[lines.length - 1]?.time ?? ""}`;

    if (lyricsKey !== npLastLyricsKey) {
        npLyrics.empty();

        if (!lines.length) {
            npLyrics.append($(`<div class="np-lyric-line"></div>`).text("No lyrics loaded"));
        } else {
            lines.forEach((line, i) => {
                const el = $(`<div class="np-lyric-line"></div>`)
                    .text(line.text || "")
                    .attr("data-line-index", i);

                npLyrics.append(el);
            });
        }

        npLastLyricsKey = lyricsKey;
        npLastCurrentLineIndex = -2;
        npLyrics[0].scrollTop = 0;
    }

    const currentLineIndex = Number.isInteger(np.currentLineIndex) ? np.currentLineIndex : -1;
    const changedLine = currentLineIndex !== npLastCurrentLineIndex;

    if (changedLine) {
        npLyrics.find(".np-current").removeClass("np-current");

        if (currentLineIndex >= 0) {
            npLyrics.find(`[data-line-index="${currentLineIndex}"]`).addClass("np-current");
        }

        npLastCurrentLineIndex = currentLineIndex;
    }

    const current = npLyrics.find(".np-current")[0];
    if (current && changedLine) {
        const container = npLyrics[0];
        const containerRect = container.getBoundingClientRect();
        const currentRect = current.getBoundingClientRect();
        const currentTop = (currentRect.top - containerRect.top) + container.scrollTop;
        const currentBottom = currentTop + current.clientHeight;
        const viewportTop = container.scrollTop;
        const viewportBottom = viewportTop + container.clientHeight;
        const upperComfort = viewportTop + 24;
        const lowerComfort = viewportTop + (container.clientHeight * 0.72);

        if (currentLineIndex <= 2) {
            container.scrollTo({ top: 0, behavior: "auto" });
        } else if (currentBottom > lowerComfort) {
            container.scrollTo({ top: Math.max(0, currentBottom - (container.clientHeight * 0.72)), behavior: "auto" });
        } else if (currentTop < upperComfort && viewportTop > 0) {
            container.scrollTo({ top: Math.max(0, currentTop - 24), behavior: "auto" });
        } else if (currentBottom > viewportBottom) {
            container.scrollTo({ top: Math.max(0, currentBottom - container.clientHeight + 16), behavior: "auto" });
        }
    }
}
// Init widget

const ws = new WebSocket("ws://localhost:8999/ws")

ws.onmessage = (message) => {
    let parsed;

    try {
        parsed = JSON.parse(message.data);
    } catch {
        return;
    }

    if (parsed.type === "nowPlaying") {
        updateNowPlaying(parsed.data);
    } else if (parsed.type === "settings") {
        loadSettings(JSON.stringify(parsed.data));
    } else {
        // Fallback for any message shape that isn't tagged - treat as settings.
        loadSettings(message.data);
    }
}
// Init

