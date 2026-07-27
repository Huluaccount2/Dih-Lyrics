import WebSocket from "ws"
import { Debug } from "./Debug"
import { Settings } from "./Settings"

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json"

type PresenceStatus = "online" | "idle" | "dnd" | "invisible"

const VALID_PRESENCE_STATUSES = new Set(["online", "idle", "dnd", "invisible"])

interface CustomStatusActivity {
    id: string
    type: number
    name: string
    state: string
    emoji: { name: string; id: string | null } | null
    created_at: number
}

export class GatewayStatusClient {
    private ws: WebSocket | null = null
    private heartbeatTimer: NodeJS.Timeout | null = null
    private heartbeatAckReceived = true
    private seq: number | null = null
    private sessionId: string | null = null
    private resumeGatewayUrl: string | null = null
    private reconnectAttempt = 0
    private closedByUs = false
    private lastSendAt = 0
    private recentSendTimes: number[] = []
    private lastPayloadKey = ""
    private currentActivity: CustomStatusActivity | null = null
    private flashTimer: NodeJS.Timeout | null = null
    private flashActive = false
    private flashIndex = -1

    public connected = false
    public reconnecting = false

    public connect(): void {
        if (this.ws || this.connected || this.reconnecting) return
        if (!Settings.credentials.token) {
            Debug.write("[GatewayStatus] No Discord token configured - gateway disabled")
            return
        }

        this.closedByUs = false
        this.open(this.resumeGatewayUrl || GATEWAY_URL)
    }

    public disconnect(): void {
        this.closedByUs = true
        this.connected = false
        this.reconnecting = false
        this.clearHeartbeat()
        this.ws?.close()
        this.ws = null
    }

    public setCustomStatus(text: string, emojiName: string | null, emojiId: string | null = null): boolean | "hold" {
        if (!Settings.gateway.enabled) return false
        if (!this.connected) {
            this.connect()
            return false
        }

        const now = Date.now()
        const minInterval = Math.max(0, Settings.gateway.minIntervalMs || 0)

        if (minInterval && now - this.lastSendAt < minInterval) return false

        this.recentSendTimes = this.recentSendTimes.filter((time) => now - time <= 20000)
        if (this.recentSendTimes.length >= 5) {
            Debug.write("[GatewayStatus] Discord gateway presence limit reached (5 sends/20s)")
            return false
        }

        const status = this.resolvePresenceStatus()
        const payloadKey = `${status}|${text || ""}|${emojiName || ""}|${emojiId || ""}`
        if (payloadKey === this.lastPayloadKey) return false

        const activity = {
            id: "custom",
            type: 4,
            name: "Custom Status",
            state: text || "",
            emoji: emojiName ? { name: emojiName, id: emojiId } : null,
            created_at: now
        }
        this.currentActivity = activity

        this.sendPresence(status)

        this.lastPayloadKey = payloadKey
        this.lastSendAt = now
        this.recentSendTimes.push(now)
        Debug.write(`[GatewayStatus] Sent custom status over gateway: "${text}"`)
        this.startStatusFlash()

        return true
    }

    public stopStatusFlash(restorePresence: boolean = false): void {
        const wasActive = this.flashActive
        this.flashActive = false
        if (this.flashTimer) clearTimeout(this.flashTimer)
        this.flashTimer = null
        this.flashIndex = -1

        if (!restorePresence || !wasActive || !this.connected) return

        const restoreStatus = this.normalizePresenceStatus(Settings.statusFlash.restoreStatus || Settings.gateway.presenceStatus)
        Debug.write(`[GatewayStatus] Restoring presence to ${restoreStatus}`)
        this.sendPresence(restoreStatus)
    }

    public getDebugState(): Record<string, number | string | boolean> {
        const now = Date.now()
        this.recentSendTimes = this.recentSendTimes.filter((time) => now - time <= 20000)

        return {
            enabled: Settings.gateway.enabled,
            connected: this.connected,
            reconnecting: this.reconnecting,
            recentSends: this.recentSendTimes.length,
            flashEnabled: Settings.statusFlash.enabled,
            flashActive: this.flashActive,
            nextSendInMs: Math.max(0, (this.lastSendAt + Math.max(0, Settings.gateway.minIntervalMs || 0)) - now)
        }
    }

    private startStatusFlash(): void {
        if (!Settings.statusFlash.enabled || this.flashActive) return

        const states = this.getFlashStates()
        if (!states.length) return

        this.flashActive = true
        this.flashIndex = states.indexOf(this.resolvePresenceStatus())
        Debug.write(`[GatewayStatus] Starting status flash: ${states.join(" -> ")}`)
        this.scheduleFlashTick()
    }

    private scheduleFlashTick(): void {
        if (!this.flashActive) return

        const intervalMs = Math.max(300, Number(Settings.statusFlash.intervalMs) || 2000)

        this.flashTimer = setTimeout(() => {
            this.flashTimer = null
            this.flashTick()
            this.scheduleFlashTick()
        }, intervalMs)
    }

    private flashTick(): void {
        if (!this.flashActive || !this.connected) return
        if (!Settings.statusFlash.enabled) {
            this.stopStatusFlash(true)
            return
        }

        const states = this.getFlashStates()
        if (!states.length) return

        this.flashIndex = (this.flashIndex + 1) % states.length
        this.sendPresence(states[this.flashIndex])
    }

    private getFlashStates(): PresenceStatus[] {
        const states = Array.isArray(Settings.statusFlash.states) ? Settings.statusFlash.states : []
        const valid = states
            .map((status) => this.normalizePresenceStatus(status))
            .filter((status, index, list) => list.indexOf(status) === index)

        return valid.length ? valid : ["online", "idle", "dnd"]
    }

    private open(url: string): void {
        Debug.write(`[GatewayStatus] Connecting to ${url}`)
        this.reconnecting = true

        this.ws = new WebSocket(url)

        this.ws.on("open", () => Debug.write("[GatewayStatus] Socket open"))
        this.ws.on("message", (data) => this.handleMessage(data.toString()))
        this.ws.on("close", (code, reason) => this.handleClose(code, reason.toString()))
        this.ws.on("error", (err) => Debug.write("[GatewayStatus] Socket error: " + err))
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
            case 10:
                this.startHeartbeat(payload.d.heartbeat_interval)
                this.identifyOrResume()
                break
            case 11:
                this.heartbeatAckReceived = true
                break
            case 1:
                this.sendHeartbeat()
                break
            case 7:
                this.ws?.close()
                break
            case 9:
                this.sessionId = null
                this.seq = null
                setTimeout(() => this.identifyOrResume(), 1500)
                break
            case 0:
                this.handleDispatch(payload.t || "", payload.d)
                break
        }
    }

    private handleDispatch(type: string, d: any): void {
        if (type === "READY") {
            this.sessionId = d.session_id
            this.resumeGatewayUrl = d.resume_gateway_url || GATEWAY_URL
            this.connected = true
            this.reconnecting = false
            this.reconnectAttempt = 0
            Debug.write("[GatewayStatus] Ready")
        } else if (type === "RESUMED") {
            this.connected = true
            this.reconnecting = false
            this.reconnectAttempt = 0
            Debug.write("[GatewayStatus] Resumed")
        }
    }

    private identifyOrResume(): void {
        const token = Settings.credentials.token
        if (!token) return

        if (this.sessionId && this.seq != null) {
            this.send({
                op: 6,
                d: { token, session_id: this.sessionId, seq: this.seq }
            })

            return
        }

        const status = this.resolvePresenceStatus()

        this.send({
            op: 2,
            d: {
                token,
                properties: {
                    os: process.platform,
                    browser: "dihlyrics",
                    device: "dihlyrics"
                },
                compress: false,
                presence: {
                    status,
                    afk: status === "idle",
                    since: status === "idle" ? Date.now() : 0,
                    activities: []
                }
            }
        })
    }

    private resolvePresenceStatus(): PresenceStatus {
        return this.normalizePresenceStatus(Settings.gateway.presenceStatus)
    }

    private normalizePresenceStatus(status: string | null | undefined): PresenceStatus {
        if (status && VALID_PRESENCE_STATUSES.has(status)) return status as PresenceStatus
        return "online"
    }

    private sendPresence(status: PresenceStatus): void {
        this.send({
            op: 3,
            d: {
                since: status === "idle" ? Date.now() : 0,
                afk: status === "idle",
                status,
                activities: this.currentActivity ? [this.currentActivity] : []
            }
        })
    }

    private startHeartbeat(intervalMs: number): void {
        this.clearHeartbeat()
        this.heartbeatAckReceived = true

        const firstDelay = Math.floor(Math.random() * intervalMs)

        setTimeout(() => {
            this.sendHeartbeat()
            this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), intervalMs)
        }, firstDelay)
    }

    private sendHeartbeat(): void {
        if (!this.heartbeatAckReceived) {
            Debug.write("[GatewayStatus] Missed heartbeat ACK, reconnecting")
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
        this.stopStatusFlash(false)
        this.connected = false
        this.ws = null

        if (this.closedByUs || !Settings.gateway.enabled) {
            this.reconnecting = false
            return
        }

        Debug.write(`[GatewayStatus] Connection closed (${code}: ${reason || "no reason"}), reconnecting`)
        this.reconnecting = true
        this.reconnectAttempt++

        const delay = Math.min(30000, 1000 * Math.pow(1.5, Math.min(this.reconnectAttempt, 8)))

        setTimeout(() => {
            if (!Settings.gateway.enabled || this.closedByUs) {
                this.reconnecting = false
                return
            }

            this.open(this.resumeGatewayUrl || GATEWAY_URL)
        }, delay)
    }
}
