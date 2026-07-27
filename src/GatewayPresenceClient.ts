import WebSocket from "ws"
import { Debug } from "./Debug"

// A plain, standard Discord gateway connection used ONLY to read your own presence (so we
// can see the "Listening to Spotify" activity Discord already shows on your profile). This
// deliberately does NOT do any of the things the rejected gateway-bypass approach did:
//   - it identifies as itself ("lyric-status"), not as an official Discord client
//   - it never sends presence/status updates over this connection - it's read-only
//   - there's no timing jitter or traffic shaping to look "more human" - heartbeats run on
//     the fixed interval Discord's Hello payload gives us, same as the protocol spec says to
//   - it's not a substitute for the REST call StatusChanger already uses to set your status
//
// It's a self-bot in the technical sense (an automated script maintaining a session on a
// user token), same as the REST status-setting elsewhere in this app already is - just used
// to receive presence events instead of to write your status.

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json"
const GATEWAY_VERSION = 10

interface SpotifyActivityInfo {
    songId: string
    name: string
    artist: string
    album: string
    albumArtUrl: string
    startTimestamp: number
    endTimestamp: number
}

type ActivityListener = (activity: SpotifyActivityInfo | null) => void

export class GatewayPresenceClient {
    private token: string
    private ws: WebSocket | null = null
    private heartbeatTimer: NodeJS.Timeout | null = null
    private heartbeatAckReceived = true
    private seq: number | null = null
    private sessionId: string | null = null
    private resumeGatewayUrl: string | null = null
    private selfUserId: string | null = null
    private reconnectAttempt = 0
    private closedByUs = false

    public onSpotifyActivity: ActivityListener | null = null
    public onConnectedChange: ((connected: boolean) => void) | null = null

    constructor(token: string) {
        this.token = token
    }

    public connect(): void {
        this.closedByUs = false
        this.open(GATEWAY_URL)
    }

    public disconnect(): void {
        this.closedByUs = true
        this.clearHeartbeat()
        this.ws?.close()
        this.ws = null
    }

    private open(url: string): void {
        Debug.write(`[GatewayPresence] Connecting to ${url}`)

        this.ws = new WebSocket(url)

        this.ws.on("open", () => Debug.write("[GatewayPresence] Socket open"))
        this.ws.on("message", (data) => this.handleMessage(data.toString()))
        this.ws.on("close", (code, reason) => this.handleClose(code, reason.toString()))
        this.ws.on("error", (err) => Debug.write("[GatewayPresence] Socket error: " + err))
    }

    private handleMessage(raw: string): void {
        let payload: { op: number; d?: any; s?: number | null; t?: string | null }

        try {
            payload = JSON.parse(raw)
        } catch {
            return
        }

        if (payload.s != null) this.seq = payload.s

        switch (payload.op) {
            case 10: // Hello
                this.startHeartbeat(payload.d.heartbeat_interval)
                this.identifyOrResume()
                break
            case 11: // Heartbeat ACK
                this.heartbeatAckReceived = true
                break
            case 1: // Server requesting an immediate heartbeat
                this.sendHeartbeat()
                break
            case 7: // Reconnect - server wants us to reconnect (and may support resume)
                Debug.write("[GatewayPresence] Server requested reconnect")
                this.ws?.close()
                break
            case 9: // Invalid session
                Debug.write("[GatewayPresence] Invalid session, re-identifying fresh")
                this.sessionId = null
                this.seq = null
                setTimeout(() => this.identifyOrResume(), 1500)
                break
            case 0: // Dispatch
                this.handleDispatch(payload.t || "", payload.d)
                break
        }
    }

    private handleDispatch(type: string, d: any): void {
        if (type === "READY") {
            this.sessionId = d.session_id
            this.resumeGatewayUrl = d.resume_gateway_url || null
            this.selfUserId = d.user?.id || null
            this.reconnectAttempt = 0

            Debug.write("[GatewayPresence] Ready - watching presence for self")
            this.onConnectedChange?.(true)

            return
        }

        if (type === "RESUMED") {
            Debug.write("[GatewayPresence] Session resumed")
            this.onConnectedChange?.(true)

            return
        }

        if (type === "PRESENCE_UPDATE") {
            if (!this.selfUserId || d?.user?.id !== this.selfUserId) return

            this.emitSpotifyActivity(d.activities || [])
        }
    }

    private emitSpotifyActivity(activities: any[]): void {
        // Discord marks the Spotify listening activity with type 2 (LISTENING) and name
        // "Spotify". Other activities (games, custom status text, etc.) are ignored.
        const spotify = activities.find((a) => a?.type === 2 && a?.name === "Spotify")

        if (!spotify || !spotify.timestamps?.start) {
            this.onSpotifyActivity?.(null)

            return
        }

        // Discord's asset ID for the Spotify album art is prefixed "spotify:" followed by
        // the raw Spotify image ID - i.scdn.co serves it directly from that ID.
        const largeImage: string = spotify.assets?.large_image || ""
        const albumArtUrl = largeImage.startsWith("spotify:")
            ? `https://i.scdn.co/image/${largeImage.slice("spotify:".length)}`
            : ""

        this.onSpotifyActivity?.({
            songId: spotify.sync_id || spotify.details || "",
            name: spotify.details || "",
            artist: (spotify.state || "").split(";")[0].trim(),
            album: spotify.assets?.large_text || "",
            albumArtUrl,
            startTimestamp: spotify.timestamps.start,
            endTimestamp: spotify.timestamps.end || spotify.timestamps.start
        })
    }

    private identifyOrResume(): void {
        if (this.sessionId && this.seq != null) {
            this.send({
                op: 6,
                d: { token: this.token, session_id: this.sessionId, seq: this.seq }
            })

            return
        }

        this.send({
            op: 2,
            d: {
                token: this.token,
                properties: {
                    os: process.platform,
                    browser: "lyric-status",
                    device: "lyric-status"
                },
                compress: false
            }
        })
    }

    private startHeartbeat(intervalMs: number): void {
        this.clearHeartbeat()
        this.heartbeatAckReceived = true

        // Discord's own gateway spec calls for jittering only the first heartbeat by a
        // random fraction of the interval - this is protocol-mandated, not traffic shaping.
        const firstDelay = Math.floor(Math.random() * intervalMs)

        setTimeout(() => {
            this.sendHeartbeat()
            this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), intervalMs)
        }, firstDelay)
    }

    private sendHeartbeat(): void {
        if (!this.heartbeatAckReceived) {
            Debug.write("[GatewayPresence] Missed heartbeat ACK, reconnecting")
            this.ws?.close()

            return
        }

        this.heartbeatAckReceived = false
        this.send({ op: 1, d: this.seq })
    }

    private clearHeartbeat(): void {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
        this.heartbeatTimer = null
    }

    private send(payload: unknown): void {
        if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(payload))
    }

    private handleClose(code: number, reason: string): void {
        this.clearHeartbeat()
        this.onConnectedChange?.(false)

        if (this.closedByUs) return

        Debug.write(`[GatewayPresence] Connection closed (${code}: ${reason || "no reason"}), reconnecting`)

        this.reconnectAttempt++

        // Simple capped backoff so a persistent failure doesn't hammer Discord - not evasion,
        // just basic good-citizen retry behaviour.
        const delay = Math.min(30000, 1000 * Math.pow(1.5, Math.min(this.reconnectAttempt, 8)))

        setTimeout(() => {
            const url = code === 4000 || !this.sessionId ? GATEWAY_URL : (this.resumeGatewayUrl || GATEWAY_URL)

            this.open(`${url}?v=${GATEWAY_VERSION}&encoding=json`)
        }, delay)
    }
}
