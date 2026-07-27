import { BaseSource, SongLyrics } from "./BaseSource"
import { Settings } from "../Settings"
import { Debug } from "../Debug"
// @ts-ignore - no bundled types for this package
import { SyncLyrics } from "@stef-0012/synclyrics"

// Musixmatch requires a "usertoken" to use its lyrics API. There's no official way to get
// one without the app - the SyncLyrics library reverse-engineers Musixmatch's own token
// endpoint and mints one automatically the first time it's needed. We just give it a place
// to read/write that token from so it doesn't have to re-fetch one on every request (and to
// avoid hammering their token endpoint, which will start rejecting requests if you do).
export class MusixmatchSource extends BaseSource {
    private manager: any

    constructor() {
        super()

        this.manager = new SyncLyrics({
            logLevel: "none",
            sources: ["musixmatch"],
            saveMusixmatchToken: (token: unknown) => {
                try {
                    Settings.credentials.musixmatchToken = JSON.stringify(token)
                    Settings.save()
                    Debug.write("[MusixmatchSource] Token saved.")
                } catch (e) {
                    Debug.write("[MusixmatchSource] Token save failed: " + e)
                }
            },
            getMusixmatchToken: () => {
                const raw = Settings.credentials.musixmatchToken

                if (!raw?.trim()) return null

                try {
                    const parsed = JSON.parse(raw)

                    return parsed?.usertoken ? parsed : null
                } catch {
                    return null
                }
            }
        })
    }

    public async getLyrics(name: string, artist: string): Promise<SongLyrics> {
        const result = await this.manager.getLyrics({ track: name, artist })

        if (!result) throw new Error("Musixmatch: no result")

        const parsed = result.lyrics?.lineSynced?.parse()

        if (!parsed?.length) throw new Error("Musixmatch: no synced lyrics")

        Debug.write(`[MusixmatchSource] Got ${parsed.length} lines for "${name}"`)

        return { lines: parsed.map((l: { time: number; text: string }) => ({ time: Math.round(l.time * 1000), text: l.text })) }
    }

    public getAppName(): string {
        return "Musixmatch"
    }
}
