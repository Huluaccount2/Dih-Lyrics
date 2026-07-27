import { BaseSource, SongLyrics, LyricsLine } from "./BaseSource"

const KG_RE = /\[(\d\d):((\d\d)\.(\d\d?\d?))]/
const JUNK_RE = /^\s*(作词|作曲|编曲|制作人|录音|混音|母带|出品|发行|OP|SP|制作)\s*[：:]|^\s*\[(verse|chorus|bridge|intro|outro|hook|pre-chorus|refrain|interlude|drop|build|break|skit|spoken|rap|instrumental|ad.?lib)\s*\d*\]\s*$/iu
const HEADERS = { "User-Agent": "Mozilla/5.0" }

interface KugouCandidate {
    hash: string
    duration?: number
}

export class KugouSource extends BaseSource {
    private async searchCandidates(name: string, artist: string): Promise<KugouCandidate[]> {
        const r = await fetch(`http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=${encodeURIComponent(`${artist} ${name}`)}&page=1&pagesize=5`, { headers: HEADERS })
        const j = await r.json() as any
        const info = j?.data?.info

        if (!info?.length) throw new Error("Kugou: song not found")

        return info
    }

    private async pickHash(name: string, artist: string): Promise<string> {
        const info = await this.searchCandidates(name, artist)

        return info[0].hash
    }

    public async getLyrics(name: string, artist: string): Promise<SongLyrics> {
        const hash = await this.pickHash(name, artist)

        const sr = await fetch(`https://krcs.kugou.com/search?ver=1&man=yes&client=mobi&hash=${hash}`, { headers: HEADERS })
        const sj = await sr.json() as any
        const cand = sj?.candidates?.[0]

        if (!cand) throw new Error("Kugou: no lyric candidate")

        const dr = await fetch(`https://lyrics.kugou.com/download?ver=1&client=pc&id=${cand.id}&accesskey=${cand.accesskey}&fmt=lrc&charset=utf8`, { headers: HEADERS })
        const dj = await dr.json() as any

        if (!dj?.content) throw new Error("Kugou: empty lyric content")

        let text = dj.content as string

        // content is usually base64; decode only if it looks like base64 (not already plain LRC)
        if (!/^\s*\[/.test(text)) {
            try {
                text = Buffer.from(text, "base64").toString("utf8")
            } catch {}
        }

        if (!/^\s*\[/.test(text)) throw new Error("Kugou: unrecognized lyric format")

        return this.parseLyrics(text)
    }

    private parseLyrics(lyrics: string): SongLyrics {
        const lines: LyricsLine[] = []

        for (let line of lyrics.split("\n")) {
            if (!line || JUNK_RE.test(line)) continue

            const times: number[] = []

            for (let m = line.match(KG_RE); m; m = line.match(KG_RE)) {
                times.push((60 * +m[1] + +m[3]) * 1000 + (m[4] ? parseInt(String(m[4]).padEnd(3, "0")) : 0))
                line = line.replace(KG_RE, "")
            }

            if (!times.length) continue

            const text = line.trim()

            if (text) for (const time of times) lines.push({ time, text })
        }

        return { lines: lines.sort((a, b) => a.time - b.time) }
    }

    public getAppName(): string {
        return "Kugou"
    }
}
