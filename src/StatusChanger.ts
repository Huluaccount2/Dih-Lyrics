import { PlaybackState } from "./PlaybackState"
import { Settings } from "./Settings"
import { LyricsLine } from "./Sources/BaseSource"
import { Autooffset } from "./Autooffset"
import { Debug } from "./Debug"
import { EmojiCache } from "./EmojiCache"
import { applyFontStyle } from "./TextStyle"
import { GatewayStatusClient } from "./GatewayStatusClient"

interface StatusPayload {
    text: string
    lines: LyricsLine[]
}

export class StatusChanger {
    public playbackState: PlaybackState

    public sentLines: LyricsLine[]

    public autooffset: Autooffset

    public lastSentAt: number

    public retryUntil: number

    public lastRateLimitAt: number

    public recentRateLimits: number[]

    public successCount: number

    public failCount: number

    public lastStatusText: string

    public emojiRotationIndex: number

    public emojiShuffledPool: string[]

    public emojiShuffledSignature: string

    public gatewayStatusClient: GatewayStatusClient | null

    constructor(playbackState: PlaybackState, gatewayStatusClient: GatewayStatusClient | null = null) {
        this.playbackState = playbackState
        this.sentLines = []
        this.autooffset = new Autooffset()
        this.lastSentAt = 0
        this.retryUntil = 0
        this.lastRateLimitAt = 0
        this.recentRateLimits = []
        this.successCount = 0
        this.failCount = 0
        this.lastStatusText = ""
        this.emojiRotationIndex = 0
        this.emojiShuffledPool = []
        this.emojiShuffledSignature = ""
        this.gatewayStatusClient = gatewayStatusClient
    }

    public async changeStatusRequest(text: string, token: string, emoji: string): Promise<void> {
        if (!text || !token) return

        const now = Date.now()

        try {
            emoji = this.resolveStatusEmoji(emoji)
            const { id: emojiId, name: emojiName } = this.parseEmoji(emoji)

            Debug.write(`REQUEST: ${text} | emoji input: ${JSON.stringify(emoji)} | parsed: emoji_id=${emojiId} emoji_name=${emojiName}`)

            if (Settings.gateway.enabled && this.gatewayStatusClient) {
                const gatewayResult = this.gatewayStatusClient.setCustomStatus(text, emojiName, emojiId)

                if (gatewayResult === true) {
                    this.successCount++
                    this.lastSentAt = Date.now()
                    this.lastStatusText = text
                    this.autooffset.addValue(Date.now() - now)
                    Debug.write(`SUCCESS(GATEWAY): ${text}`)
                    return
                }

                Debug.write("[GatewayStatus] Gateway unavailable or waiting; falling back to REST")
            }

            const response = await fetch("https://discord.com/api/v9/users/@me/settings", {
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
            })

            let body = ""

            try {
                body = await response.text()
            } catch {
                body = ""
            }

            if (!response.ok) {
                this.failCount++

                if (response.status === 429) {
                    this.registerRateLimit(body)
                }

                Debug.write(`FAIL: ${response.status}${body ? ` ${body}` : ""}`)
                return
            }

            this.successCount++
            this.lastSentAt = Date.now()
            this.lastStatusText = text
            this.autooffset.addValue(Date.now() - now)

            let returnedEmoji = "unknown"

            try {
                const parsedBody = JSON.parse(body) as { custom_status?: { emoji_id?: string | null; emoji_name?: string | null } }
                returnedEmoji = JSON.stringify(parsedBody.custom_status ? { emoji_id: parsedBody.custom_status.emoji_id, emoji_name: parsedBody.custom_status.emoji_name } : parsedBody)
            } catch {
                returnedEmoji = body.slice(0, 200)
            }

            Debug.write(`SUCCESS: ${text} | discord returned: ${returnedEmoji}`)
        } catch (e) {
            this.failCount++
            Debug.write(`CRASH: ${(e as Error)?.stack || e}`)
        }
    }

    public parseEmoji(input: string): { id: string | null; name: string } {
        const value = (input || "").trim()

        if (!value) return { id: null, name: "🎶" }

        // Matches custom Discord emoji formats, e.g. <:name:123456789012345678> or <a:name:123456789012345678>
        const customEmojiMatch = value.match(/^<a?:(\w+):(\d+)>$/)

        if (customEmojiMatch) {
            return { id: customEmojiMatch[2], name: customEmojiMatch[1] }
        }

        // Also accept the bare "name:id" form in case the user stripped the angle brackets
        const bareMatch = value.match(/^(\w+):(\d+)$/)

        if (bareMatch) {
            return { id: bareMatch[2], name: bareMatch[1] }
        }

        return { id: null, name: value }
    }

    public registerRateLimit(body: string): void {
        const now = Date.now()
        this.lastRateLimitAt = now
        this.recentRateLimits.push(now)
        this.recentRateLimits = this.recentRateLimits.filter((time) => now - time <= 60000)

        if (!Settings.timings.rateLimit.autoBackoff) return

        let retryAfterMs = 30000

        if (body) {
            try {
                const parsed = JSON.parse(body) as { retry_after?: number }

                if (typeof parsed.retry_after === "number" && !isNaN(parsed.retry_after)) {
                    retryAfterMs = Math.ceil(parsed.retry_after * 1000)
                }
            } catch {
                retryAfterMs = 30000
            }
        }

        // Discord's retry_after is the minimum you're legally allowed to wait - never go
        // below it. But the configured backoffDurationMs is a floor on top of that: if you
        // want a more conservative pause than Discord strictly requires, this is where it
        // kicks in (e.g. Discord says 5s, you've configured 60s, you get 60s).
        const configuredMs = Math.max(0, Settings.timings.rateLimit.backoffDurationMs || 0)
        retryAfterMs = Math.max(retryAfterMs, configuredMs)

        this.retryUntil = Math.max(this.retryUntil, now + retryAfterMs)
    }

    public changeStatus(): void {
        this.autooffset.setLimit(Settings.timings.autooffset)

        const playbackState = this.playbackState

        if (playbackState.needsLineReset) {
            this.sentLines = []
            this.emojiRotationIndex = 0
            playbackState.needsLineReset = false
        }

        if (playbackState.ended || !playbackState.hasLyrics || !playbackState.isPlaying) {
            this.gatewayStatusClient?.stopStatusFlash(true)
            return
        }

        const lyrics = playbackState.lyrics

        if (!lyrics || !Array.isArray(lyrics.lines) || !lyrics.lines.length) return

        if (!this.canSend()) return

        const songProgress = playbackState.songProgress
        const lines = lyrics.lines
        const offset = this.getEffectiveOffset()

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            const nextLine = lines[i + 1]

            if (!line || typeof line.time !== "number") continue

            if (line.time < (songProgress + offset)) {
                if (!line.text) continue
                if (nextLine && typeof nextLine.time === "number" && nextLine.time < (songProgress + offset)) continue
                if (this.sentLines.some((sentLine) => sentLine.time === line.time)) break

                const payload = this.buildStatusPayload(lines, i)
                if (!payload) break

                playbackState.currentLine = payload.lines[0] || line

                if (Settings.view.advanced.enabled) {
                    void this.changeStatusRequest(
                        this.parseStatusString(Settings.view.advanced.customStatus, payload.text),
                        Settings.credentials.token,
                        this.resolveEmoji()
                    )
                } else {
                    void this.changeStatusRequest(
                        this.getStatusString(payload.text, payload.lines[0]?.time ?? line.time),
                        Settings.credentials.token,
                        "🎶"
                    )
                }

                this.sentLines.push(...payload.lines.filter((mergedLine) => !this.sentLines.some((sentLine) => sentLine.time === mergedLine.time)))

                break
            }
        }
    }

    public resolveEmoji(): string {
        const rotation = Settings.view.advanced.emojiRotation

        if (!rotation || !rotation.enabled) return Settings.view.advanced.customEmoji

        const pool = EmojiCache.getPool(rotation)

        if (!pool.length) return Settings.view.advanced.customEmoji

        const order = rotation.order || "sequential"

        if (order === "random") {
            return pool[Math.floor(Math.random() * pool.length)]
        }

        if (order === "shuffled") {
            const signature = pool.join("|")

            if (signature !== this.emojiShuffledSignature || this.emojiRotationIndex >= this.emojiShuffledPool.length) {
                this.emojiShuffledPool = this.shuffle([...pool])
                this.emojiShuffledSignature = signature
                this.emojiRotationIndex = 0
            }

            const emoji = this.emojiShuffledPool[this.emojiRotationIndex]
            this.emojiRotationIndex++

            return emoji
        }

        // sequential
        const emoji = pool[this.emojiRotationIndex % pool.length]
        this.emojiRotationIndex++

        return emoji
    }

    public resolveStatusEmoji(defaultEmoji: string): string {
        if (!Settings.statusEmojis.enabled) return defaultEmoji

        const state = this.playbackState

        if (!state.isPlaying) return Settings.statusEmojis.paused || Settings.statusEmojis.fallback || defaultEmoji
        if (!state.hasLyrics) return Settings.statusEmojis.noLyrics || Settings.statusEmojis.fallback || defaultEmoji

        return Settings.statusEmojis.playing || Settings.statusEmojis.fallback || defaultEmoji
    }

    public getSongOffset(): number {
        if (!Settings.songOffsets.enabled || !Array.isArray(Settings.songOffsets.entries)) return 0

        const key = StatusChanger.songOffsetKey(this.playbackState.songName, this.playbackState.songAuthor)
        const entry = Settings.songOffsets.entries.find((candidate) => candidate.key === key)

        return entry ? Number(entry.offsetMs) || 0 : 0
    }

    public getEffectiveOffset(): number {
        const manualOffset = Number(Settings.timings.sendTimeOffset) || 0
        const autoOffset = Settings.timings.enableAutooffset ? this.autooffset.getAverageValue() + 100 : 0

        return manualOffset + autoOffset + this.getSongOffset()
    }

    public static songOffsetKey(songName: string, artist: string): string {
        return `${songName || ""}::${artist || ""}`.trim().toLowerCase()
    }

    public shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]
        }

        return array
    }

    public buildStatusPayload(lines: LyricsLine[], startIndex: number): StatusPayload | null {
        const current = lines[startIndex]

        if (!current || !current.text) return null

        const rateLimitSettings = Settings.timings.rateLimit
        const smartMergeEnabled = !!(rateLimitSettings.smartMerge && rateLimitSettings.smartMerge.enabled)

        let payloadLines: LyricsLine[]

        if (smartMergeEnabled) {
            payloadLines = this.buildSmartMergeLines(lines, startIndex)

            const totalWords = payloadLines.reduce((sum, l) => sum + StatusChanger.countWords(l.text), 0)
            Debug.write(`SMART MERGE: ${payloadLines.length} line(s), ${totalWords} word(s), settings: max=${Settings.timings.rateLimit.smartMerge.maxCombinedWords} solo=${Settings.timings.rateLimit.smartMerge.soloWordThreshold}`)
        } else {
            const mergeEnabled = rateLimitSettings.enabled && rateLimitSettings.mergeLines
            const mergeCount = Math.max(1, rateLimitSettings.mergeLineCount || 1)

            payloadLines = []

            for (let offset = 0; offset < (mergeEnabled ? mergeCount : 1); offset++) {
                const mergedLine = lines[startIndex + offset]

                if (!mergedLine || !mergedLine.text) continue
                if (this.sentLines.some((sentLine) => sentLine.time === mergedLine.time)) continue

                payloadLines.push(mergedLine)
            }
        }

        if (!payloadLines.length) return null

        const combinedText = payloadLines.map((line) => line.text.trim()).filter(Boolean).join(" / ")
        const truncatedText = this.smartTruncate(combinedText)
        const finalText = applyFontStyle(truncatedText, Settings.view.advanced.fontStyle)

        if (smartMergeEnabled && truncatedText.length < combinedText.length) {
            Debug.write(`SMART MERGE TRUNCATED: ${combinedText.length} chars -> ${truncatedText.length} chars (Discord's 128-char status limit cut it short)`)
        }

        return {
            text: finalText,
            lines: payloadLines
        }
    }

    private static countWords(text: string): number {
        return text.trim().split(/\s+/).filter(Boolean).length
    }

    /**
     * Builds a merge group starting at `startIndex`:
     * - A line with more words than `soloWordThreshold` is never merged with others - it's
     *   sent on its own.
     * - Otherwise, consecutive lines keep getting added to the group as long as the running
     *   total stays within `maxCombinedWords`.
     */
    public buildSmartMergeLines(lines: LyricsLine[], startIndex: number): LyricsLine[] {
        const smart = Settings.timings.rateLimit.smartMerge
        const maxCombinedWords = Math.max(1, smart.maxCombinedWords || 20)
        const soloWordThreshold = Math.max(1, smart.soloWordThreshold || 10)
        const maxChars = 128 // Discord's custom status character limit
        const separator = " / "

        const payloadLines: LyricsLine[] = []
        let totalWords = 0
        let totalChars = 0

        for (let offset = 0; ; offset++) {
            const line = lines[startIndex + offset]

            if (!line || !line.text) break
            if (this.sentLines.some((sentLine) => sentLine.time === line.time)) {
                if (payloadLines.length) break
                continue
            }

            const trimmed = line.text.trim()
            const words = StatusChanger.countWords(trimmed)

            if (words > soloWordThreshold) {
                if (payloadLines.length === 0) payloadLines.push(line)
                break
            }

            const projectedChars = totalChars + trimmed.length + (payloadLines.length > 0 ? separator.length : 0)

            if (payloadLines.length > 0 && (totalWords + words > maxCombinedWords || projectedChars > maxChars)) break

            payloadLines.push(line)
            totalWords += words
            totalChars = projectedChars
        }

        return payloadLines
    }

    public canSend(): boolean {
        const now = Date.now()
        const rateLimitSettings = Settings.timings.rateLimit

        if (!rateLimitSettings.enabled) return true
        if (this.retryUntil > now) return false

        const minSendInterval = Math.max(0, rateLimitSettings.minSendInterval || 0)

        if (minSendInterval && now - this.lastSentAt < minSendInterval) return false

        return true
    }

    public songChanged(): void {
        this.sentLines = []
        this.lastStatusText = ""
    }

    public formatSeconds(s: number): string {
        return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0' ) + s
    }

    public getStatusString(textOrLine: string | LyricsLine, time?: number): string {
        const lineText = typeof textOrLine === "string" ? textOrLine : textOrLine?.text || ""
        const lineTime = typeof textOrLine === "string" ? (time || 0) : textOrLine?.time || 0
        const status = `${Settings.view.timestamp ? `[${this.formatSeconds(+(lineTime / 1000).toFixed(0))}] ` : ""}${Settings.view.label ? "Song lyrics - " : ""}${lineText.replace(/♪/g, "🎶")}`

        return this.smartTruncate(status)
    }

    public smartTruncate(text: string, maxLength: number = 128): string {
        const normalized = (text || "").replace(/\s+/g, " ").trim()

        if (normalized.length <= maxLength) return normalized

        const hardSlice = normalized.slice(0, Math.max(1, maxLength - 1)).trim()
        const lastSpace = hardSlice.lastIndexOf(" ")
        const safeSlice = lastSpace > 24 ? hardSlice.slice(0, lastSpace).trim() : hardSlice

        return `${safeSlice}…`
    }

    public parseStatusString(status: string, lyricsOverride?: string): string {
        const currentLine = this.playbackState.currentLine
        const lineText = lyricsOverride || currentLine?.text || ""
        const lineTime = currentLine?.time || 0
        const songName = this.playbackState.songName || ""
        const songAuthor = this.playbackState.songAuthor || ""

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
            .replace("{song_author_lower}", songAuthor.toLowerCase())

        return this.smartTruncate(status)
    }

    public getDebugState(): Record<string, number | string | boolean> {
        const now = Date.now()

        return {
            minSendInterval: Settings.timings.rateLimit.minSendInterval,
            autoBackoff: Settings.timings.rateLimit.autoBackoff,
            mergeLines: Settings.timings.rateLimit.mergeLines,
            mergeLineCount: Settings.timings.rateLimit.mergeLineCount,
            effectiveOffset: this.getEffectiveOffset(),
            songOffset: this.getSongOffset(),
            nextSendInMs: Math.max(0, (this.lastSentAt + Settings.timings.rateLimit.minSendInterval) - now),
            retryInMs: Math.max(0, this.retryUntil - now),
            recentRateLimits: this.recentRateLimits.length,
            successCount: this.successCount,
            failCount: this.failCount,
            lastStatusText: this.lastStatusText || "None"
        }
    }
}
