import { BaseSource, SongLyrics } from "./BaseSource"

interface LyricsResponse {
    id: number
    name: string
    trackName: string
    artistName: string
    albumName: string
    plainLyrics: string | null
    syncedLyrics: string | null
}

/**
 * Lyrics but using LrcLib
 * https://lrclib.net/api
 */
export class LrcLibSource extends BaseSource {
    private readonly baseUrl = "https://lrclib.net/api"

        public async getLyrics(name: string, artist: string): Promise<SongLyrics> {
            // 1) Try exact lookup first.
            const direct = await this.tryGetByTrackArtist(name, artist)
            if (direct) return direct

            // 2) Fallback to search with a few progressively looser queries.
            const queries = this.buildSearchQueries(name, artist)

            for (const q of queries) {
                const found = await this.searchAndPickBest(q, name, artist)
                if (found) return found
            }

            throw new Error("No synced lyrics found")
        }

        private async tryGetByTrackArtist(name: string, artist: string): Promise<SongLyrics | null> {
            const response = await fetch(
                `${this.baseUrl}/get?track_name=${encodeURIComponent(name)}&artist_name=${encodeURIComponent(artist)}`
            )

            if (!response.ok) return null

            const json = (await response.json()) as LyricsResponse

            if (!json.syncedLyrics || !json.syncedLyrics.trim()) return null

            return this.parseLyrics(json.syncedLyrics)
        }

        private normalizeForMatch(value: string): string {
            return value
                .toLowerCase()
                .replace(/\(.*?\)/g, " ")
                .replace(/\[.*?\]/g, " ")
                .replace(/feat\.?|featuring|ft\.?/g, " ")
                .replace(/[^a-z0-9\s]/g, " ")
                .replace(/\s+/g, " ")
                .trim()
        }

        private buildSearchQueries(name: string, artist: string): string[] {
            const n0 = name.trim()
            const a0 = artist.trim()

            const n1 = this.normalizeForMatch(n0)
            const a1 = this.normalizeForMatch(a0)

            // Keep order: most specific -> least.
            const raw = `${n0} ${a0}`.trim()
            const normalized = `${n1} ${a1}`.trim()

            const titleOnly = n1
            const artistOnly = a1

            const set = new Set<string>()
            for (const q of [raw, normalized, titleOnly, `${titleOnly} ${artistOnly}`.trim()]) {
                if (q && q.length >= 2) set.add(q)
            }
            return Array.from(set)
        }

        private async searchAndPickBest(query: string, targetName: string, targetArtist: string): Promise<SongLyrics | null> {
            // LRCLib search uses `q` and returns an array of records.
            const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`)
            if (!response.ok) return null

            const results = (await response.json()) as LyricsResponse[]
            if (!Array.isArray(results) || results.length === 0) return null

            const tName = this.normalizeForMatch(targetName)
            const tArtist = this.normalizeForMatch(targetArtist)

            const scored = results.map((r) => {
                const rName = this.normalizeForMatch(r.trackName || r.name || "")
                const rArtist = this.normalizeForMatch(r.artistName || "")
                const score = this.matchScore(tName, rName) + this.matchScore(tArtist, rArtist)
                return { r, score }
            })

            scored.sort((a, b) => b.score - a.score)

            for (const { r } of scored.slice(0, 10)) {
                // Prefer synced lyrics already present in the record.
                if (r.syncedLyrics && r.syncedLyrics.trim()) {
                    return this.parseLyrics(r.syncedLyrics)
                }

                // If not present, try fetching by id (supported by LRCLib).
                if (typeof r.id === "number") {
                    const byId = await this.tryGetById(r.id)
                    if (byId) return byId
                }
            }

            return null
        }

        private async tryGetById(id: number): Promise<SongLyrics | null> {
            const response = await fetch(`${this.baseUrl}/get/${id}`)
            if (!response.ok) return null

            const json = (await response.json()) as LyricsResponse
            if (!json.syncedLyrics || !json.syncedLyrics.trim()) return null

            return this.parseLyrics(json.syncedLyrics)
        }

        private matchScore(target: string, candidate: string): number {
            if (!target || !candidate) return 0
            if (target === candidate) return 100
            if (candidate.includes(target) || target.includes(candidate)) return 60

            const tTokens = new Set(target.split(" ").filter(Boolean))
            const cTokens = new Set(candidate.split(" ").filter(Boolean))

            let overlap = 0
            for (const t of tTokens) if (cTokens.has(t)) overlap += 1

            return overlap * 8
        }

        /**
         * Convert the response to the .json format we use
         */
        private parseLyrics(lyrics: string): SongLyrics {
            const result: SongLyrics = { lines: [] }
            const lines = lyrics.split("\n")

            // it should be: [mm:ss.xx] text
            const regexp = /\[(\d\d):(\d\d)(?:\.(\d\d))?]/g

            for (let line of lines) {
                if (!line.trim()) continue

                    const timestamps: number[] = []
                    let match: RegExpExecArray | null

                    while ((match = regexp.exec(line)) !== null) {
                        const min = parseInt(match[1])
                        const sec = parseInt(match[2])
                        const ms = match[3] ? parseInt(match[3]) * 10 : 0
                        timestamps.push((min * 60 + sec) * 1000 + ms)
                    }

                    const text = line.replace(regexp, "").trim()
                    if (!text) continue

                        for (const time of timestamps.length ? timestamps : [0]) {
                            result.lines.push({ time, text })
                        }
            }

            result.lines.sort((a, b) => a.time - b.time)
            return result
        }

        public getAppName(): string {
            return "LrcLib"
        }
}
