"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayStatusClient = void 0;
const ws_1 = __importDefault(require("ws"));
const Debug_1 = require("./Debug");
const Settings_1 = require("./Settings");
const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
const VALID_PRESENCE_STATUSES = new Set(["online", "idle", "dnd", "invisible"]);
class GatewayStatusClient {
    constructor() {
        this.ws = null;
        this.heartbeatTimer = null;
        this.heartbeatAckReceived = true;
        this.seq = null;
        this.sessionId = null;
        this.resumeGatewayUrl = null;
        this.reconnectAttempt = 0;
        this.closedByUs = false;
        this.lastSendAt = 0;
        this.recentSendTimes = [];
        this.lastPayloadKey = "";
        this.currentActivity = null;
        this.flashTimer = null;
        this.flashActive = false;
        this.flashIndex = -1;
        this.connected = false;
        this.reconnecting = false;
    }
    connect() {
        if (this.ws || this.connected || this.reconnecting)
            return;
        if (!Settings_1.Settings.credentials.token) {
            Debug_1.Debug.write("[GatewayStatus] No Discord token configured - gateway disabled");
            return;
        }
        this.closedByUs = false;
        this.open(this.resumeGatewayUrl || GATEWAY_URL);
    }
    disconnect() {
        var _a;
        this.closedByUs = true;
        this.connected = false;
        this.reconnecting = false;
        this.clearHeartbeat();
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
        this.ws = null;
    }
    setCustomStatus(text, emojiName, emojiId = null) {
        if (!Settings_1.Settings.gateway.enabled)
            return false;
        if (!this.connected) {
            this.connect();
            return false;
        }
        const now = Date.now();
        const minInterval = Math.max(0, Settings_1.Settings.gateway.minIntervalMs || 0);
        if (minInterval && now - this.lastSendAt < minInterval)
            return false;
        this.recentSendTimes = this.recentSendTimes.filter((time) => now - time <= 20000);
        if (this.recentSendTimes.length >= 5) {
            Debug_1.Debug.write("[GatewayStatus] Discord gateway presence limit reached (5 sends/20s)");
            return false;
        }
        const status = this.resolvePresenceStatus();
        const payloadKey = `${status}|${text || ""}|${emojiName || ""}|${emojiId || ""}`;
        if (payloadKey === this.lastPayloadKey)
            return false;
        const activity = {
            id: "custom",
            type: 4,
            name: "Custom Status",
            state: text || "",
            emoji: emojiName ? { name: emojiName, id: emojiId } : null,
            created_at: now
        };
        this.currentActivity = activity;
        this.sendPresence(status);
        this.lastPayloadKey = payloadKey;
        this.lastSendAt = now;
        this.recentSendTimes.push(now);
        Debug_1.Debug.write(`[GatewayStatus] Sent custom status over gateway: "${text}"`);
        this.startStatusFlash();
        return true;
    }
    stopStatusFlash(restorePresence = false) {
        const wasActive = this.flashActive;
        this.flashActive = false;
        if (this.flashTimer)
            clearTimeout(this.flashTimer);
        this.flashTimer = null;
        this.flashIndex = -1;
        if (!restorePresence || !wasActive || !this.connected)
            return;
        const restoreStatus = this.normalizePresenceStatus(Settings_1.Settings.statusFlash.restoreStatus || Settings_1.Settings.gateway.presenceStatus);
        Debug_1.Debug.write(`[GatewayStatus] Restoring presence to ${restoreStatus}`);
        this.sendPresence(restoreStatus);
    }
    getDebugState() {
        const now = Date.now();
        this.recentSendTimes = this.recentSendTimes.filter((time) => now - time <= 20000);
        return {
            enabled: Settings_1.Settings.gateway.enabled,
            connected: this.connected,
            reconnecting: this.reconnecting,
            recentSends: this.recentSendTimes.length,
            flashEnabled: Settings_1.Settings.statusFlash.enabled,
            flashActive: this.flashActive,
            nextSendInMs: Math.max(0, (this.lastSendAt + Math.max(0, Settings_1.Settings.gateway.minIntervalMs || 0)) - now)
        };
    }
    startStatusFlash() {
        if (!Settings_1.Settings.statusFlash.enabled || this.flashActive)
            return;
        const states = this.getFlashStates();
        if (!states.length)
            return;
        this.flashActive = true;
        this.flashIndex = states.indexOf(this.resolvePresenceStatus());
        Debug_1.Debug.write(`[GatewayStatus] Starting status flash: ${states.join(" -> ")}`);
        this.scheduleFlashTick();
    }
    scheduleFlashTick() {
        if (!this.flashActive)
            return;
        const intervalMs = Math.max(300, Number(Settings_1.Settings.statusFlash.intervalMs) || 2000);
        this.flashTimer = setTimeout(() => {
            this.flashTimer = null;
            this.flashTick();
            this.scheduleFlashTick();
        }, intervalMs);
    }
    flashTick() {
        if (!this.flashActive || !this.connected)
            return;
        if (!Settings_1.Settings.statusFlash.enabled) {
            this.stopStatusFlash(true);
            return;
        }
        const states = this.getFlashStates();
        if (!states.length)
            return;
        this.flashIndex = (this.flashIndex + 1) % states.length;
        this.sendPresence(states[this.flashIndex]);
    }
    getFlashStates() {
        const states = Array.isArray(Settings_1.Settings.statusFlash.states) ? Settings_1.Settings.statusFlash.states : [];
        const valid = states
            .map((status) => this.normalizePresenceStatus(status))
            .filter((status, index, list) => list.indexOf(status) === index);
        return valid.length ? valid : ["online", "idle", "dnd"];
    }
    open(url) {
        Debug_1.Debug.write(`[GatewayStatus] Connecting to ${url}`);
        this.reconnecting = true;
        this.ws = new ws_1.default(url);
        this.ws.on("open", () => Debug_1.Debug.write("[GatewayStatus] Socket open"));
        this.ws.on("message", (data) => this.handleMessage(data.toString()));
        this.ws.on("close", (code, reason) => this.handleClose(code, reason.toString()));
        this.ws.on("error", (err) => Debug_1.Debug.write("[GatewayStatus] Socket error: " + err));
    }
    handleMessage(raw) {
        var _a;
        let payload;
        try {
            payload = JSON.parse(raw);
        }
        catch (_b) {
            return;
        }
        if (payload.s != null)
            this.seq = payload.s;
        switch (payload.op) {
            case 10:
                this.startHeartbeat(payload.d.heartbeat_interval);
                this.identifyOrResume();
                break;
            case 11:
                this.heartbeatAckReceived = true;
                break;
            case 1:
                this.sendHeartbeat();
                break;
            case 7:
                (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
                break;
            case 9:
                this.sessionId = null;
                this.seq = null;
                setTimeout(() => this.identifyOrResume(), 1500);
                break;
            case 0:
                this.handleDispatch(payload.t || "", payload.d);
                break;
        }
    }
    handleDispatch(type, d) {
        if (type === "READY") {
            this.sessionId = d.session_id;
            this.resumeGatewayUrl = d.resume_gateway_url || GATEWAY_URL;
            this.connected = true;
            this.reconnecting = false;
            this.reconnectAttempt = 0;
            Debug_1.Debug.write("[GatewayStatus] Ready");
        }
        else if (type === "RESUMED") {
            this.connected = true;
            this.reconnecting = false;
            this.reconnectAttempt = 0;
            Debug_1.Debug.write("[GatewayStatus] Resumed");
        }
    }
    identifyOrResume() {
        const token = Settings_1.Settings.credentials.token;
        if (!token)
            return;
        if (this.sessionId && this.seq != null) {
            this.send({
                op: 6,
                d: { token, session_id: this.sessionId, seq: this.seq }
            });
            return;
        }
        const status = this.resolvePresenceStatus();
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
        });
    }
    resolvePresenceStatus() {
        return this.normalizePresenceStatus(Settings_1.Settings.gateway.presenceStatus);
    }
    normalizePresenceStatus(status) {
        if (status && VALID_PRESENCE_STATUSES.has(status))
            return status;
        return "online";
    }
    sendPresence(status) {
        this.send({
            op: 3,
            d: {
                since: status === "idle" ? Date.now() : 0,
                afk: status === "idle",
                status,
                activities: this.currentActivity ? [this.currentActivity] : []
            }
        });
    }
    startHeartbeat(intervalMs) {
        this.clearHeartbeat();
        this.heartbeatAckReceived = true;
        const firstDelay = Math.floor(Math.random() * intervalMs);
        setTimeout(() => {
            this.sendHeartbeat();
            this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), intervalMs);
        }, firstDelay);
    }
    sendHeartbeat() {
        var _a;
        if (!this.heartbeatAckReceived) {
            Debug_1.Debug.write("[GatewayStatus] Missed heartbeat ACK, reconnecting");
            (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
            return;
        }
        this.heartbeatAckReceived = false;
        this.send({ op: 1, d: this.seq });
    }
    clearHeartbeat() {
        if (this.heartbeatTimer)
            clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
    }
    send(payload) {
        var _a;
        if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === ws_1.default.OPEN)
            this.ws.send(JSON.stringify(payload));
    }
    handleClose(code, reason) {
        this.clearHeartbeat();
        this.stopStatusFlash(false);
        this.connected = false;
        this.ws = null;
        if (this.closedByUs || !Settings_1.Settings.gateway.enabled) {
            this.reconnecting = false;
            return;
        }
        Debug_1.Debug.write(`[GatewayStatus] Connection closed (${code}: ${reason || "no reason"}), reconnecting`);
        this.reconnecting = true;
        this.reconnectAttempt++;
        const delay = Math.min(30000, 1000 * Math.pow(1.5, Math.min(this.reconnectAttempt, 8)));
        setTimeout(() => {
            if (!Settings_1.Settings.gateway.enabled || this.closedByUs) {
                this.reconnecting = false;
                return;
            }
            this.open(this.resumeGatewayUrl || GATEWAY_URL);
        }, delay);
    }
}
exports.GatewayStatusClient = GatewayStatusClient;
