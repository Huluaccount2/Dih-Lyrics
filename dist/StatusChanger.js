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
exports.StatusChanger = void 0;
const Settings_1 = require("./Settings");
const Autooffset_1 = require("./Autooffset");
const Debug_1 = require("./Debug");
const EmojiCache_1 = require("./EmojiCache");
const TextStyle_1 = require("./TextStyle");
class StatusChanger {
    constructor(playbackState, gatewayStatusClient = null) {
        this.playbackState = playbackState;
        this.sentLines = [];
        this.autooffset = new Autooffset_1.Autooffset();
        this.lastSentAt = 0;
        this.retryUntil = 0;
        this.lastRateLimitAt = 0;
        this.recentRateLimits = [];
        this.successCount = 0;
        this.failCount = 0;
        this.lastStatusText = "";
        this.emojiRotationIndex = 0;
        this.emojiShuffledPool = [];
        this.emojiShuffledSignature = "";
        this.gatewayStatusClient = gatewayStatusClient;
    }
    changeStatusRequest(text, token, emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!text || !token)
                return;
            const now = Date.now();
            try {
                emoji = this.resolveStatusEmoji(emoji);
                const { id: emojiId, name: emojiName } = this.parseEmoji(emoji);
                Debug_1.Debug.write(`REQUEST: ${text} | emoji input: ${JSON.stringify(emoji)} | parsed: emoji_id=${emojiId} emoji_name=${emojiName}`);
                if (Settings_1.Settings.gateway.enabled && this.gatewayStatusClient) {
                    const gatewayResult = this.gatewayStatusClient.setCustomStatus(text, emojiName, emojiId);
                    if (gatewayResult === true) {
                        this.successCount++;
                        this.lastSentAt = Date.now();
                        this.lastStatusText = text;
                        this.autooffset.addValue(Date.now() - now);
                        Debug_1.Debug.write(`SUCCESS(GATEWAY): ${text}`);
                        return;
                    }
                    Debug_1.Debug.write("[GatewayStatus] Gateway unavailable or waiting; falling back to REST");
                }
                const response = yield fetch("https://discord.com/api/v9/users/@me/settings", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify({
                        custom_status: {
                            text,
                            emoji_id: emojiId,
                            emoji_name: emojiName,
                            expires_at: new Date(Date.now() + 60000).toISOString()
                        }
                    })
                });
                let body = "";
                try {
                    body = yield response.text();
                }
                catch (_a) {
                    body = "";
                }
                if (!response.ok) {
                    this.failCount++;
                    if (response.status === 429) {
                        this.registerRateLimit(body);
                    }
                    Debug_1.Debug.write(`FAIL: ${response.status}${body ? ` ${body}` : ""}`);
                    return;
                }
                this.successCount++;
                this.lastSentAt = Date.now();
                this.lastStatusText = text;
                this.autooffset.addValue(Date.now() - now);
                let returnedEmoji = "unknown";
                try {
                    const parsedBody = JSON.parse(body);
                    returnedEmoji = JSON.stringify(parsedBody.custom_status ? { emoji_id: parsedBody.custom_status.emoji_id, emoji_name: parsedBody.custom_status.emoji_name } : parsedBody);
                }
                catch (_b) {
                    returnedEmoji = body.slice(0, 200);
                }
                Debug_1.Debug.write(`SUCCESS: ${text} | discord returned: ${returnedEmoji}`);
            }
            catch (e) {
                this.failCount++;
                Debug_1.Debug.write(`CRASH: ${(e === null || e === void 0 ? void 0 : e.stack) || e}`);
            }
        });
    }
    parseEmoji(input) {
        const value = (input || "").trim();
        if (!value)
            return { id: null, name: "🎶" };
        // Matches custom Discord emoji formats, e.g. <:name:123456789012345678> or <a:name:123456789012345678>
        const customEmojiMatch = value.match(/^<a?:(\w+):(\d+)>$/);
        if (customEmojiMatch) {
            return { id: customEmojiMatch[2], name: customEmojiMatch[1] };
        }
        // Also accept the bare "name:id" form in case the user stripped the angle brackets
        const bareMatch = value.match(/^(\w+):(\d+)$/);
        if (bareMatch) {
            return { id: bareMatch[2], name: bareMatch[1] };
        }
        return { id: null, name: value };
    }
    registerRateLimit(body) {
        const now = Date.now();
        this.lastRateLimitAt = now;
        this.recentRateLimits.push(now);
        this.recentRateLimits = this.recentRateLimits.filter((time) => now - time <= 60000);
        if (!Settings_1.Settings.timings.rateLimit.autoBackoff)
            return;
        let retryAfterMs = 30000;
        if (body) {
            try {
                const parsed = JSON.parse(body);
                if (typeof parsed.retry_after === "number" && !isNaN(parsed.retry_after)) {
                    retryAfterMs = Math.ceil(parsed.retry_after * 1000);
                }
            }
            catch (_a) {
                retryAfterMs = 30000;
            }
        }
        // Discord's retry_after is the minimum you're legally allowed to wait - never go
        // below it. But the configured backoffDurationMs is a floor on top of that: if you
        // want a more conservative pause than Discord strictly requires, this is where it
        // kicks in (e.g. Discord says 5s, you've configured 60s, you get 60s).
        const configuredMs = Math.max(0, Settings_1.Settings.timings.rateLimit.backoffDurationMs || 0);
        retryAfterMs = Math.max(retryAfterMs, configuredMs);
        this.retryUntil = Math.max(this.retryUntil, now + retryAfterMs);
    }
    changeStatus() {
        var _a, _b;
        var _c;
        this.autooffset.setLimit(Settings_1.Settings.timings.autooffset);
        const playbackState = this.playbackState;
        if (playbackState.needsLineReset) {
            this.sentLines = [];
            this.emojiRotationIndex = 0;
            playbackState.needsLineReset = false;
        }
        if (playbackState.ended || !playbackState.hasLyrics || !playbackState.isPlaying) {
            (_a = this.gatewayStatusClient) === null || _a === void 0 ? void 0 : _a.stopStatusFlash(true);
            return;
        }
        const lyrics = playbackState.lyrics;
        if (!lyrics || !Array.isArray(lyrics.lines) || !lyrics.lines.length)
            return;
        if (!this.canSend())
            return;
        const songProgress = playbackState.songProgress;
        const lines = lyrics.lines;
        const offset = this.getEffectiveOffset();
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const nextLine = lines[i + 1];
            if (!line || typeof line.time !== "number")
                continue;
            if (line.time < (songProgress + offset)) {
                if (!line.text)
                    continue;
                if (nextLine && typeof nextLine.time === "number" && nextLine.time < (songProgress + offset))
                    continue;
                if (this.sentLines.some((sentLine) => sentLine.time === line.time))
                    break;
                const payload = this.buildStatusPayload(lines, i);
                if (!payload)
                    break;
                playbackState.currentLine = payload.lines[0] || line;
                if (Settings_1.Settings.view.advanced.enabled) {
                    void this.changeStatusRequest(this.parseStatusString(Settings_1.Settings.view.advanced.customStatus, payload.text), Settings_1.Settings.credentials.token, this.resolveEmoji());
                }
                else {
                    void this.changeStatusRequest(this.getStatusString(payload.text, (_c = (_b = payload.lines[0]) === null || _b === void 0 ? void 0 : _b.time) !== null && _c !== void 0 ? _c : line.time), Settings_1.Settings.credentials.token, "🎶");
                }
                this.sentLines.push(...payload.lines.filter((mergedLine) => !this.sentLines.some((sentLine) => sentLine.time === mergedLine.time)));
                break;
            }
        }
    }
    resolveEmoji() {
        const rotation = Settings_1.Settings.view.advanced.emojiRotation;
        if (!rotation || !rotation.enabled)
            return Settings_1.Settings.view.advanced.customEmoji;
        const pool = EmojiCache_1.EmojiCache.getPool(rotation);
        if (!pool.length)
            return Settings_1.Settings.view.advanced.customEmoji;
        const order = rotation.order || "sequential";
        if (order === "random") {
            return pool[Math.floor(Math.random() * pool.length)];
        }
        if (order === "shuffled") {
            const signature = pool.join("|");
            if (signature !== this.emojiShuffledSignature || this.emojiRotationIndex >= this.emojiShuffledPool.length) {
                this.emojiShuffledPool = this.shuffle([...pool]);
                this.emojiShuffledSignature = signature;
                this.emojiRotationIndex = 0;
            }
            const emoji = this.emojiShuffledPool[this.emojiRotationIndex];
            this.emojiRotationIndex++;
            return emoji;
        }
        // sequential
        const emoji = pool[this.emojiRotationIndex % pool.length];
        this.emojiRotationIndex++;
        return emoji;
    }
    resolveStatusEmoji(defaultEmoji) {
        if (!Settings_1.Settings.statusEmojis.enabled)
            return defaultEmoji;
        const state = this.playbackState;
        if (!state.isPlaying)
            return Settings_1.Settings.statusEmojis.paused || Settings_1.Settings.statusEmojis.fallback || defaultEmoji;
        if (!state.hasLyrics)
            return Settings_1.Settings.statusEmojis.noLyrics || Settings_1.Settings.statusEmojis.fallback || defaultEmoji;
        return Settings_1.Settings.statusEmojis.playing || Settings_1.Settings.statusEmojis.fallback || defaultEmoji;
    }
    getSongOffset() {
        if (!Settings_1.Settings.songOffsets.enabled || !Array.isArray(Settings_1.Settings.songOffsets.entries))
            return 0;
        const key = StatusChanger.songOffsetKey(this.playbackState.songName, this.playbackState.songAuthor);
        const entry = Settings_1.Settings.songOffsets.entries.find((candidate) => candidate.key === key);
        return entry ? Number(entry.offsetMs) || 0 : 0;
    }
    getEffectiveOffset() {
        const manualOffset = Number(Settings_1.Settings.timings.sendTimeOffset) || 0;
        const autoOffset = Settings_1.Settings.timings.enableAutooffset ? this.autooffset.getAverageValue() + 100 : 0;
        return manualOffset + autoOffset + this.getSongOffset();
    }
    static songOffsetKey(songName, artist) {
        return `${songName || ""}::${artist || ""}`.trim().toLowerCase();
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    buildStatusPayload(lines, startIndex) {
        const current = lines[startIndex];
        if (!current || !current.text)
            return null;
        const rateLimitSettings = Settings_1.Settings.timings.rateLimit;
        const smartMergeEnabled = !!(rateLimitSettings.smartMerge && rateLimitSettings.smartMerge.enabled);
        let payloadLines;
        if (smartMergeEnabled) {
            payloadLines = this.buildSmartMergeLines(lines, startIndex);
            const totalWords = payloadLines.reduce((sum, l) => sum + StatusChanger.countWords(l.text), 0);
            Debug_1.Debug.write(`SMART MERGE: ${payloadLines.length} line(s), ${totalWords} word(s), settings: max=${Settings_1.Settings.timings.rateLimit.smartMerge.maxCombinedWords} solo=${Settings_1.Settings.timings.rateLimit.smartMerge.soloWordThreshold}`);
        }
        else {
            const mergeEnabled = rateLimitSettings.enabled && rateLimitSettings.mergeLines;
            const mergeCount = Math.max(1, rateLimitSettings.mergeLineCount || 1);
            payloadLines = [];
            for (let offset = 0; offset < (mergeEnabled ? mergeCount : 1); offset++) {
                const mergedLine = lines[startIndex + offset];
                if (!mergedLine || !mergedLine.text)
                    continue;
                if (this.sentLines.some((sentLine) => sentLine.time === mergedLine.time))
                    continue;
                payloadLines.push(mergedLine);
            }
        }
        if (!payloadLines.length)
            return null;
        const combinedText = payloadLines.map((line) => line.text.trim()).filter(Boolean).join(" / ");
        const truncatedText = this.smartTruncate(combinedText);
        const finalText = (0, TextStyle_1.applyFontStyle)(truncatedText, Settings_1.Settings.view.advanced.fontStyle);
        if (smartMergeEnabled && truncatedText.length < combinedText.length) {
            Debug_1.Debug.write(`SMART MERGE TRUNCATED: ${combinedText.length} chars -> ${truncatedText.length} chars (Discord's 128-char status limit cut it short)`);
        }
        return {
            text: finalText,
            lines: payloadLines
        };
    }
    static countWords(text) {
        return text.trim().split(/\s+/).filter(Boolean).length;
    }
    /**
     * Builds a merge group starting at `startIndex`:
     * - A line with more words than `soloWordThreshold` is never merged with others - it's
     *   sent on its own.
     * - Otherwise, consecutive lines keep getting added to the group as long as the running
     *   total stays within `maxCombinedWords`.
     */
    buildSmartMergeLines(lines, startIndex) {
        const smart = Settings_1.Settings.timings.rateLimit.smartMerge;
        const maxCombinedWords = Math.max(1, smart.maxCombinedWords || 20);
        const soloWordThreshold = Math.max(1, smart.soloWordThreshold || 10);
        const maxChars = 128; // Discord's custom status character limit
        const separator = " / ";
        const payloadLines = [];
        let totalWords = 0;
        let totalChars = 0;
        for (let offset = 0;; offset++) {
            const line = lines[startIndex + offset];
            if (!line || !line.text)
                break;
            if (this.sentLines.some((sentLine) => sentLine.time === line.time)) {
                if (payloadLines.length)
                    break;
                continue;
            }
            const trimmed = line.text.trim();
            const words = StatusChanger.countWords(trimmed);
            if (words > soloWordThreshold) {
                if (payloadLines.length === 0)
                    payloadLines.push(line);
                break;
            }
            const projectedChars = totalChars + trimmed.length + (payloadLines.length > 0 ? separator.length : 0);
            if (payloadLines.length > 0 && (totalWords + words > maxCombinedWords || projectedChars > maxChars))
                break;
            payloadLines.push(line);
            totalWords += words;
            totalChars = projectedChars;
        }
        return payloadLines;
    }
    canSend() {
        const now = Date.now();
        const rateLimitSettings = Settings_1.Settings.timings.rateLimit;
        if (!rateLimitSettings.enabled)
            return true;
        if (this.retryUntil > now)
            return false;
        const minSendInterval = Math.max(0, rateLimitSettings.minSendInterval || 0);
        if (minSendInterval && now - this.lastSentAt < minSendInterval)
            return false;
        return true;
    }
    songChanged() {
        this.sentLines = [];
        this.lastStatusText = "";
    }
    formatSeconds(s) {
        return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
    }
    getStatusString(textOrLine, time) {
        const lineText = typeof textOrLine === "string" ? textOrLine : (textOrLine === null || textOrLine === void 0 ? void 0 : textOrLine.text) || "";
        const lineTime = typeof textOrLine === "string" ? (time || 0) : (textOrLine === null || textOrLine === void 0 ? void 0 : textOrLine.time) || 0;
        const status = `${Settings_1.Settings.view.timestamp ? `[${this.formatSeconds(+(lineTime / 1000).toFixed(0))}] ` : ""}${Settings_1.Settings.view.label ? "Song lyrics - " : ""}${lineText.replace(/♪/g, "🎶")}`;
        return this.smartTruncate(status);
    }
    smartTruncate(text, maxLength = 128) {
        const normalized = (text || "").replace(/\s+/g, " ").trim();
        if (normalized.length <= maxLength)
            return normalized;
        const hardSlice = normalized.slice(0, Math.max(1, maxLength - 1)).trim();
        const lastSpace = hardSlice.lastIndexOf(" ");
        const safeSlice = lastSpace > 24 ? hardSlice.slice(0, lastSpace).trim() : hardSlice;
        return `${safeSlice}…`;
    }
    parseStatusString(status, lyricsOverride) {
        const currentLine = this.playbackState.currentLine;
        const lineText = lyricsOverride || (currentLine === null || currentLine === void 0 ? void 0 : currentLine.text) || "";
        const lineTime = (currentLine === null || currentLine === void 0 ? void 0 : currentLine.time) || 0;
        const songName = this.playbackState.songName || "";
        const songAuthor = this.playbackState.songAuthor || "";
        status = (status || "")
            .replace("{lyrics}", lineText)
            .replace("{lyrics_upper}", lineText.toUpperCase())
            .replace("{lyrics_lower}", lineText.toLowerCase())
            .replace("{lyrics_letters_only}", lineText.replace(/['",\.]/gi, ""))
            .replace("{lyrics_upper_letters_only}", lineText.toUpperCase().replace(/['",\.]/gi, ""))
            .replace("{lyrics_lower_letters_only}", lineText.toLowerCase().replace(/['",\.]/gi, ""))
            .replace(/♪/g, "🎶")
            .replace("{timestamp}", this.formatSeconds(+(lineTime / 1000).toFixed()))
            .replace("{song_name}", songName)
            .replace("{song_name_upper}", songName.toUpperCase())
            .replace("{song_name_lower}", songName.toLowerCase())
            .replace("{song_name_cropped}", songName.replace(/( ?- ?.+)|(\(.+\))/gi, ""))
            .replace("{song_name_upper_cropped}", songName.toUpperCase().replace(/( ?- ?.+)|(\(.+\))/gi, ""))
            .replace("{song_name_lower_cropped}", songName.toLowerCase().replace(/( ?- ?.+)|(\(.+\))/gi, ""))
            .replace("{song_author}", songAuthor)
            .replace("{song_author_upper}", songAuthor.toUpperCase())
            .replace("{song_author_lower}", songAuthor.toLowerCase());
        return this.smartTruncate(status);
    }
    getDebugState() {
        const now = Date.now();
        return {
            minSendInterval: Settings_1.Settings.timings.rateLimit.minSendInterval,
            autoBackoff: Settings_1.Settings.timings.rateLimit.autoBackoff,
            mergeLines: Settings_1.Settings.timings.rateLimit.mergeLines,
            mergeLineCount: Settings_1.Settings.timings.rateLimit.mergeLineCount,
            effectiveOffset: this.getEffectiveOffset(),
            songOffset: this.getSongOffset(),
            nextSendInMs: Math.max(0, (this.lastSentAt + Settings_1.Settings.timings.rateLimit.minSendInterval) - now),
            retryInMs: Math.max(0, this.retryUntil - now),
            recentRateLimits: this.recentRateLimits.length,
            successCount: this.successCount,
            failCount: this.failCount,
            lastStatusText: this.lastStatusText || "None"
        };
    }
}
exports.StatusChanger = StatusChanger;
