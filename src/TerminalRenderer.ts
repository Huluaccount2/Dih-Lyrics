import { PlaybackState } from "./PlaybackState"
import { LyricsFetcher } from "./LyricsFetcher"
import { StatusChanger } from "./StatusChanger"
import { GatewayStatusClient } from "./GatewayStatusClient"
import { Settings } from "./Settings"
import { Debug } from "./Debug"

const jpeg = require("jpeg-js") as {
    decode(buffer: Buffer, options?: { useTArray?: boolean }): { width: number; height: number; data: Uint8Array }
}

const ANSI_PATTERN = /\x1b\[[0-9;]*m|\x1b\][^\x07]*(?:\x07|\x1b\\)|\x1bP[\s\S]*?\x1b\\/g
const DEFAULT_SECTION_ORDER = ["albumArt", "song", "lyrics", "sources", "webSocket", "rateLimit", "debug"]

interface RenderContext {
    playbackState: PlaybackState
    lyricsFetcher: LyricsFetcher
    statusChanger: StatusChanger
    gatewayStatusClient: GatewayStatusClient
}

interface Rgb {
    r: number
    g: number
    b: number
}

export class TerminalRenderer {
    private lastRenderAt = 0
    private albumArtUrl = ""
    private albumArtAnsi = ""
    private albumArtInline = ""
    private albumArtLoading = false
    private screenInitialized = false

    public render(ctx: RenderContext): void {
        const refreshMs = Math.max(250, Settings.terminal.refreshMs || 1000)
        const now = Date.now()

        if (now - this.lastRenderAt < refreshMs) return

        this.lastRenderAt = now
        this.loadAlbumArt(ctx.playbackState.albumArtUrl)

        const width = Math.max(60, process.stdout.columns || 100)
        const bg = TerminalRenderer.parseColor(Settings.terminal.backgroundColor, { r: 18, g: 19, b: 20 })
        const fg = TerminalRenderer.parseColor(Settings.terminal.textColor, { r: 232, g: 235, b: 240 })
        const accent = TerminalRenderer.parseColor(Settings.terminal.accentColor, { r: 80, g: 200, b: 130 })
        const bgCode = TerminalRenderer.bg(bg)
        const fgCode = TerminalRenderer.fg(fg)
        const accentCode = TerminalRenderer.fg(accent)
        const reset = "\x1b[0m"
        const divider = "-".repeat(Math.min(width, 96))

        const debugState = ctx.statusChanger.getDebugState()
        const gatewayState = ctx.gatewayStatusClient.getDebugState()
        const lines: string[] = []

        for (const section of this.getSectionOrder()) {
            if (!this.isSectionEnabled(section)) continue

            if (section === "albumArt" && (this.albumArtInline || this.albumArtAnsi)) {
                const art = this.albumArtInline || this.albumArtAnsi
                lines.push(...art.split("\n").map((line) => TerminalRenderer.pad(line, width)))
                lines.push(TerminalRenderer.pad(divider, width))
            } else if (section === "song") {
                lines.push(`${accentCode}${TerminalRenderer.pad("Song", width)}${fgCode}`)
                lines.push(this.field("Title", ctx.playbackState.songName || "Not listening", width))
                lines.push(this.field("Artist", ctx.playbackState.songAuthor || "Not listening", width))
                lines.push(this.field("Album", ctx.playbackState.albumName || "Unknown", width))
                lines.push(this.field("Playing", ctx.playbackState.isPlaying ? "Yes" : "No", width))
                lines.push(this.field("Progress", `${ctx.statusChanger.formatSeconds(Math.max(0, Math.floor(ctx.playbackState.songProgress / 1000)))} / ${ctx.statusChanger.formatSeconds(Math.max(0, Math.floor(ctx.playbackState.songDuration / 1000)))}`, width))
                lines.push(TerminalRenderer.pad(divider, width))
            } else if (section === "lyrics") {
                lines.push(`${accentCode}${TerminalRenderer.pad("Lyrics", width)}${fgCode}`)
                lines.push(this.field("Current", ctx.playbackState.currentLine?.text || "Not available", width))
                lines.push(this.field("Lines", String(ctx.playbackState.lyrics?.lines?.length || 0), width))
                lines.push(TerminalRenderer.pad(divider, width))
            } else if (section === "sources") {
                lines.push(`${accentCode}${TerminalRenderer.pad("Sources", width)}${fgCode}`)
                lines.push(this.field("Playback", Settings.playback.source === "discordPresence" ? "Discord presence" : "Spotify API", width))
                lines.push(this.field("Lyrics", ctx.lyricsFetcher.lastFetchedFrom || "Unknown", width))
                lines.push(TerminalRenderer.pad(divider, width))
            } else if (section === "webSocket") {
                lines.push(`${accentCode}${TerminalRenderer.pad("WebSocket", width)}${fgCode}`)
                lines.push(this.field("Gateway", Settings.gateway.enabled ? (ctx.gatewayStatusClient.connected ? "Connected" : (ctx.gatewayStatusClient.reconnecting ? "Reconnecting" : "Disconnected")) : "Off", width))
                lines.push(this.field("Status flash", Settings.statusFlash.enabled ? (gatewayState.flashActive ? "Active" : "Enabled") : "Off", width))
                lines.push(this.field("Presence", Settings.gateway.presenceStatus || "online", width))
                lines.push(TerminalRenderer.pad(divider, width))
            } else if (section === "rateLimit") {
                lines.push(`${accentCode}${TerminalRenderer.pad("Rate Limiting", width)}${fgCode}`)
                lines.push(this.field("Effective offset", `${debugState.effectiveOffset}ms`, width))
                lines.push(this.field("Min interval", `${debugState.minSendInterval}ms`, width))
                lines.push(this.field("Next send", `${debugState.nextSendInMs}ms`, width))
                lines.push(this.field("Retry backoff", `${debugState.autoBackoff ? "On" : "Off"} (${debugState.retryInMs}ms)`, width))
                lines.push(this.field("Line merging", debugState.mergeLines ? `On (${debugState.mergeLineCount})` : "Off", width))
                lines.push(TerminalRenderer.pad(divider, width))
            } else if (section === "debug") {
                lines.push(`${accentCode}${TerminalRenderer.pad("Debug", width)}${fgCode}`)
                lines.push(this.field("Recent rate limits", String(debugState.recentRateLimits), width))
                lines.push(this.field("Status sends", `Success ${debugState.successCount} / Fail ${debugState.failCount}`, width))
                lines.push(this.field("Gateway sends", `${gatewayState.recentSends}/5 in 20s`, width))
                lines.push(this.field("Last status", String(debugState.lastStatusText), width))
                lines.push(TerminalRenderer.pad(divider, width))
            }
        }

        this.writeFrame(bgCode + fgCode + lines.map((line) => TerminalRenderer.pad(line, width)).join("\n") + reset)
    }

    private field(label: string, value: string, width: number): string {
        return TerminalRenderer.pad(`${label.padEnd(18)} ${value}`, width)
    }

    private getSectionOrder(): string[] {
        const configured = Array.isArray(Settings.terminal.sectionOrder) ? Settings.terminal.sectionOrder : []
        const order = configured.filter((section) => DEFAULT_SECTION_ORDER.includes(section))

        for (const section of DEFAULT_SECTION_ORDER) {
            if (!order.includes(section)) order.push(section)
        }

        return order
    }

    private isSectionEnabled(section: string): boolean {
        const map: Record<string, boolean> = {
            albumArt: !!Settings.terminal.showAlbumArt,
            song: !!Settings.terminal.showSong,
            lyrics: !!Settings.terminal.showLyrics,
            sources: !!Settings.terminal.showSources,
            webSocket: !!Settings.terminal.showWebSocket,
            rateLimit: !!Settings.terminal.showRateLimit,
            debug: !!Settings.terminal.showDebug
        }

        return !!map[section]
    }

    private writeFrame(frame: string): void {
        if (!this.screenInitialized) {
            this.screenInitialized = true
            process.stdout.write("\x1b[?1049h\x1b[?25l")
            process.once("exit", () => process.stdout.write("\x1b[0m\x1b[?25h\x1b[?1049l"))
        }

        process.stdout.write("\x1b[H\x1b[2J\x1b[3J\x1b[3;1H" + frame + "\x1b[0m\x1b[J")
    }

    private loadAlbumArt(url: string): void {
        if (!Settings.terminal.showAlbumArt) return

        if (!url) {
            this.albumArtUrl = ""
            this.albumArtAnsi = ""
            this.albumArtInline = ""
            return
        }

        if (url === this.albumArtUrl || this.albumArtLoading) return

        this.albumArtUrl = url
        this.albumArtAnsi = ""
        this.albumArtInline = ""
        this.albumArtLoading = true

        void this.fetchAlbumArt(url)
            .then((art) => {
                if (this.albumArtUrl === url) {
                    this.albumArtAnsi = art.ansi
                    this.albumArtInline = art.inline
                }
            })
            .catch((e) => Debug.write(`[TerminalRenderer] Album art failed: ${(e as Error)?.message || e}`))
            .finally(() => {
                if (this.albumArtUrl === url) this.albumArtLoading = false
            })
    }

    private async fetchAlbumArt(url: string): Promise<{ ansi: string; inline: string }> {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const buffer = Buffer.from(await response.arrayBuffer())
        const image = jpeg.decode(buffer, { useTArray: true })
        const width = Math.max(8, Math.min(64, Settings.terminal.albumArtWidth || 28))
        let height = Math.max(4, Math.round(width * image.height / image.width))
        if (height % 2 !== 0) height++

        return {
            ansi: this.imageToAnsi(image.data, image.width, image.height, width, height),
            inline: this.imageToInline(buffer, image.data, image.width, image.height, width, Math.max(4, Math.round(height / 2)))
        }
    }

    private imageToAnsi(data: Uint8Array, sourceWidth: number, sourceHeight: number, width: number, height: number): string {
        const rows: string[] = []

        for (let y = 0; y < height; y += 2) {
            let row = ""

            for (let x = 0; x < width; x++) {
                const upper = this.sampleAverage(data, sourceWidth, sourceHeight, x, y, width, height)
                const lower = this.sampleAverage(data, sourceWidth, sourceHeight, x, y + 1, width, height)

                row += `${TerminalRenderer.fg(upper)}${TerminalRenderer.bg(lower)}▀`
            }

            rows.push(row + "\x1b[0m")
        }

        return rows.join("\n")
    }

    private imageToInline(buffer: Buffer, data: Uint8Array, sourceWidth: number, sourceHeight: number, widthCells: number, heightRows: number): string {
        if (TerminalRenderer.supportsSixelImages()) {
            const pixelWidth = Math.max(32, Math.min(192, widthCells * 4))
            const pixelHeight = Math.max(24, Math.round(pixelWidth * sourceHeight / sourceWidth))

            return this.imageToSixel(data, sourceWidth, sourceHeight, pixelWidth, pixelHeight)
        }

        if (!TerminalRenderer.supportsITermImages()) return ""

        const base64 = buffer.toString("base64")

        return `\x1b]1337;File=inline=1;width=${widthCells};height=${heightRows};preserveAspectRatio=1:${base64}\x07`
    }

    private imageToSixel(data: Uint8Array, sourceWidth: number, sourceHeight: number, width: number, height: number): string {
        const colorIndexes: number[][] = []
        const usedColors = new Set<number>()

        for (let y = 0; y < height; y++) {
            const row: number[] = []

            for (let x = 0; x < width; x++) {
                const color = this.sampleAverage(data, sourceWidth, sourceHeight, x, y, width, height)
                const index = TerminalRenderer.rgbToSixelIndex(color)

                row.push(index)
                usedColors.add(index)
            }

            colorIndexes.push(row)
        }

        const colors = [...usedColors].sort((a, b) => a - b)
        const chunks: string[] = ["\x1bPq", `"1;1;${width};${height}`]

        for (const index of colors) {
            chunks.push(TerminalRenderer.sixelColorDefinition(index))
        }

        for (let y = 0; y < height; y += 6) {
            const bandColors = colors.filter((color) => {
                for (let yy = y; yy < Math.min(height, y + 6); yy++) {
                    if (colorIndexes[yy].includes(color)) return true
                }

                return false
            })

            for (const color of bandColors) {
                chunks.push(`#${color}`)

                let lastChar = ""
                let run = 0

                for (let x = 0; x < width; x++) {
                    let mask = 0

                    for (let bit = 0; bit < 6; bit++) {
                        const row = colorIndexes[y + bit]
                        if (row && row[x] === color) mask |= 1 << bit
                    }

                    const ch = String.fromCharCode(63 + mask)

                    if (ch === lastChar) {
                        run++
                    } else {
                        chunks.push(TerminalRenderer.flushSixelRun(lastChar, run))
                        lastChar = ch
                        run = 1
                    }
                }

                chunks.push(TerminalRenderer.flushSixelRun(lastChar, run))
                chunks.push("$")
            }

            chunks.push("-")
        }

        chunks.push("\x1b\\")

        return chunks.join("")
    }

    private sampleAverage(data: Uint8Array, sourceWidth: number, sourceHeight: number, x: number, y: number, width: number, height: number): Rgb {
        const x0 = Math.floor(x * sourceWidth / width)
        const x1 = Math.max(x0 + 1, Math.ceil((x + 1) * sourceWidth / width))
        const y0 = Math.floor(y * sourceHeight / height)
        const y1 = Math.max(y0 + 1, Math.ceil((y + 1) * sourceHeight / height))
        let r = 0
        let g = 0
        let b = 0
        let count = 0

        for (let sy = y0; sy < Math.min(sourceHeight, y1); sy++) {
            for (let sx = x0; sx < Math.min(sourceWidth, x1); sx++) {
                const index = (sy * sourceWidth + sx) * 4

                r += data[index]
                g += data[index + 1]
                b += data[index + 2]
                count++
            }
        }

        if (!count) return { r: 0, g: 0, b: 0 }

        return {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count)
        }
    }

    private static parseColor(value: string, fallback: Rgb): Rgb {
        const match = String(value || "").trim().match(/^#?([0-9a-f]{6})$/i)
        if (!match) return fallback

        const raw = match[1]

        return {
            r: parseInt(raw.slice(0, 2), 16),
            g: parseInt(raw.slice(2, 4), 16),
            b: parseInt(raw.slice(4, 6), 16)
        }
    }

    private static fg(color: Rgb): string {
        return `\x1b[38;2;${color.r};${color.g};${color.b}m`
    }

    private static bg(color: Rgb): string {
        return `\x1b[48;2;${color.r};${color.g};${color.b}m`
    }

    private static supportsSixelImages(): boolean {
        if (process.env.DIHLYRICS_INLINE_IMAGES === "off") return false
        if (process.env.DIHLYRICS_INLINE_IMAGES === "on") return true

        const term = (process.env.TERM || "").toLowerCase()

        return !!process.env.WT_SESSION
            || term.includes("sixel")
    }

    private static supportsITermImages(): boolean {
        if (process.env.DIHLYRICS_INLINE_IMAGES === "off") return false
        if (process.env.DIHLYRICS_INLINE_IMAGES === "on") return true

        const termProgram = (process.env.TERM_PROGRAM || "").toLowerCase()
        const term = (process.env.TERM || "").toLowerCase()

        return !!process.env.WEZTERM_PANE
            || termProgram.includes("iterm")
            || termProgram.includes("wezterm")
            || term.includes("kitty")
            || term.includes("wezterm")
    }

    private static rgbToSixelIndex(color: Rgb): number {
        const r = Math.min(3, Math.round(color.r / 85))
        const g = Math.min(3, Math.round(color.g / 85))
        const b = Math.min(3, Math.round(color.b / 85))

        return (r * 16) + (g * 4) + b
    }

    private static sixelColorDefinition(index: number): string {
        const r = Math.floor(index / 16)
        const g = Math.floor((index % 16) / 4)
        const b = index % 4

        return `#${index};2;${Math.round(r * 100 / 3)};${Math.round(g * 100 / 3)};${Math.round(b * 100 / 3)}`
    }

    private static flushSixelRun(ch: string, count: number): string {
        if (!ch || count <= 0) return ""
        if (count > 3) return `!${count}${ch}`

        return ch.repeat(count)
    }

    private static pad(line: string, width: number): string {
        const visible = line.replace(ANSI_PATTERN, "").length
        if (visible >= width) return line

        return line + " ".repeat(width - visible)
    }
}

