import { LyricsLine, SongLyrics } from "./Sources/BaseSource"

export class PlaybackState {
    public songName: string
    public songAuthor: string
    public albumName: string
    public albumArtUrl: string

    public songId: string
    public oldSongId: string

    public songDuration: number
    public songProgress: number

    public lyrics: SongLyrics | null
    public currentLine: LyricsLine | null
    public hasLyrics: boolean

    public isPlaying: boolean

    public needsLineReset: boolean

    constructor() {
        this.songName = ""
        this.songAuthor = ""
        this.albumName = ""
        this.albumArtUrl = ""

        this.songId = ""
        this.oldSongId = ""

        this.songDuration = 0
        this.songProgress = 0

        this.lyrics = null
        this.currentLine = null
        this.hasLyrics = false

        this.isPlaying = false

        this.needsLineReset = false
    }

    get ended(): boolean {
        return this.songDuration < this.songProgress
    }
}
