import { BaseSource, CachedSongLyrics, SongLyrics } from "./Sources/BaseSource"
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs"

export class LyricsFetcher {
    public sources: BaseSource[]

    public lastFetchedFrom: string
    public lastFetchedFor: string

    constructor() {
        this.sources = []

        this.lastFetchedFrom = "Not fetched"
        this.lastFetchedFor = ""
    }

    private sanitizeForFilename(value: string): { sanitized: string; changed: boolean } {
        const original = value
        // Remove characters that commonly break filenames on Windows and in URLs.
        const sanitized = original
            .replace(/[\n\r/:*?"<>|]/g, "")
            .replace(/\s+/g, " ")
            .trim()
        return { sanitized, changed: sanitized !== original }
    }

    private buildCachePaths(name: string, artist: string): string[] {
        const legacy = `./cache/${name}-${artist}.json`

        const nameSan = this.sanitizeForFilename(name)
        const artistSan = this.sanitizeForFilename(artist)

        const sanitizedKey = `${nameSan.sanitized}-${artistSan.sanitized}`
        const sanitized = `./cache/${sanitizedKey}.json`

        const changed = nameSan.changed || artistSan.changed
        const lowered = changed ? `./cache/${sanitizedKey.toLowerCase()}.json` : null

        return [legacy, sanitized, ...(lowered ? [lowered] : [])]
    }

    private buildCacheWritePath(name: string, artist: string): string {
        const nameSan = this.sanitizeForFilename(name)
        const artistSan = this.sanitizeForFilename(artist)

        const key = `${nameSan.sanitized}-${artistSan.sanitized}`
        const changed = nameSan.changed || artistSan.changed

        // Only force lowercase when we had to strip characters.
        const finalKey = changed ? key.toLowerCase() : key

        return `./cache/${finalKey}.json`
    }


    public addSource(source: BaseSource): void {
        this.sources.push(source)
    }

    public async fetchLyrics(name: string, artist: string): Promise<SongLyrics | null> {
        this.lastFetchedFrom = "Not fetched"

        const cache = this.fetchCachedLyrics(name, artist)

        let result = cache as SongLyrics

        for (const source of this.sources) {
            if (cache) {
                this.lastFetchedFrom = `Cache (${cache.appName})`

                break
            }

            try {
                this.lastFetchedFor = name + artist

                result = await source.getLyrics(name, artist)

                this.lastFetchedFrom = source.getAppName()

                this.cacheLyrics(name, artist, result, this.lastFetchedFrom)
            } catch {}

            if (result) break
        }

        return result
    }

    public fetchCachedLyrics(name: string, artist: string): CachedSongLyrics | null {
        const paths = this.buildCachePaths(name, artist)

        for (const path of paths) {
            try {
                return JSON.parse(readFileSync(path).toString()) as CachedSongLyrics
            } catch {}
        }

        return null
    }

    public cacheLyrics(name: string, artist: string, lyrics: SongLyrics, appName: string): void {
        if (!existsSync("./cache")) mkdirSync("./cache")

        writeFileSync(`./cache/${name}-${artist}.json`, JSON.stringify({
            ...lyrics,
            appName
        }))
    }
}