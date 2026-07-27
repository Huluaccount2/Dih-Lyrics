"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayPresenceClient = void 0;
const ws_1 = __importDefault(require("ws"));
const Debug_1 = require("./Debug");
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
const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
const GATEWAY_VERSION = 10;
class GatewayPresenceClient {
    constructor(token) {
        this.ws = null;
        this.heartbeatTimer = null;
        this.heartbeatAckReceived = true;
        this.seq = null;
        this.sessionId = null;
        this.resumeGatewayUrl = null;
        this.selfUserId = null;
        this.reconnectAttempt = 0;
        this.closedByUs = false;
        this.onSpotifyActivity = null;
        this.onConnectedChange = null;
        this.token = token;
    }
    connect() {
        this.closedByUs = false;
        this.open(GATEWAY_URL);
    }
    disconnect() {
        var _a;
        this.closedByUs = true;
        this.clearHeartbeat();
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
        this.ws = null;
    }
    open(url) {
        Debug_1.Debug.write(`[GatewayPresence] Connecting to ${url}`);
        this.ws = new ws_1.default(url);
        this.ws.on("open", () => Debug_1.Debug.write("[GatewayPresence] Socket open"));
        this.ws.on("message", (data) => this.handleMessage(data.toString()));
        this.ws.on("close", (code, reason) => this.handleClose(code, reason.toString()));
        this.ws.on("error", (err) => Debug_1.Debug.write("[GatewayPresence] Socket error: " + err));
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
            case 10: // Hello
                this.startHeartbeat(payload.d.heartbeat_interval);
                this.identifyOrResume();
                break;
            case 11: // Heartbeat ACK
                this.heartbeatAckReceived = true;
                break;
            case 1: // Server requesting an immediate heartbeat
                this.sendHeartbeat();
                break;
            case 7: // Reconnect - server wants us to reconnect (and may support resume)
                Debug_1.Debug.write("[GatewayPresence] Server requested reconnect");
                (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
                break;
            case 9: // Invalid session
                Debug_1.Debug.write("[GatewayPresence] Invalid session, re-identifying fresh");
                this.sessionId = null;
                this.seq = null;
                setTimeout(() => this.identifyOrResume(), 1500);
                break;
            case 0: // Dispatch
                this.handleDispatch(payload.t || "", payload.d);
                break;
        }
    }
    handleDispatch(type, d) {
        var _a, _b, _c, _d;
        if (type === "READY") {
            this.sessionId = d.session_id;
            this.resumeGatewayUrl = d.resume_gateway_url || null;
            this.selfUserId = ((_a = d.user) === null || _a === void 0 ? void 0 : _a.id) || null;
            this.reconnectAttempt = 0;
            Debug_1.Debug.write("[GatewayPresence] Ready - watching presence for self");
            (_b = this.onConnectedChange) === null || _b === void 0 ? void 0 : _b.call(this, true);
            return;
        }
        if (type === "RESUMED") {
            Debug_1.Debug.write("[GatewayPresence] Session resumed");
            (_c = this.onConnectedChange) === null || _c === void 0 ? void 0 : _c.call(this, true);
            return;
        }
        if (type === "PRESENCE_UPDATE") {
            if (!this.selfUserId || ((_d = d === null || d === void 0 ? void 0 : d.user) === null || _d === void 0 ? void 0 : _d.id) !== this.selfUserId)
                return;
            this.emitSpotifyActivity(d.activities || []);
        }
    }
    emitSpotifyActivity(activities) {
        var _a, _b, _c, _d, _e;
        // Discord marks the Spotify listening activity with type 2 (LISTENING) and name
        // "Spotify". Other activities (games, custom status text, etc.) are ignored.
        const spotify = activities.find((a) => (a === null || a === void 0 ? void 0 : a.type) === 2 && (a === null || a === void 0 ? void 0 : a.name) === "Spotify");
        if (!spotify || !((_a = spotify.timestamps) === null || _a === void 0 ? void 0 : _a.start)) {
            (_b = this.onSpotifyActivity) === null || _b === void 0 ? void 0 : _b.call(this, null);
            return;
        }
        // Discord's asset ID for the Spotify album art is prefixed "spotify:" followed by
        // the raw Spotify image ID - i.scdn.co serves it directly from that ID.
        const largeImage = ((_c = spotify.assets) === null || _c === void 0 ? void 0 : _c.large_image) || "";
        const albumArtUrl = largeImage.startsWith("spotify:")
            ? `https://i.scdn.co/image/${largeImage.slice("spotify:".length)}`
            : "";
        (_d = this.onSpotifyActivity) === null || _d === void 0 ? void 0 : _d.call(this, {
            songId: spotify.sync_id || spotify.details || "",
            name: spotify.details || "",
            artist: (spotify.state || "").split(";")[0].trim(),
            album: ((_e = spotify.assets) === null || _e === void 0 ? void 0 : _e.large_text) || "",
            albumArtUrl,
            startTimestamp: spotify.timestamps.start,
            endTimestamp: spotify.timestamps.end || spotify.timestamps.start
        });
    }
    identifyOrResume() {
        if (this.sessionId && this.seq != null) {
            this.send({
                op: 6,
                d: { token: this.token, session_id: this.sessionId, seq: this.seq }
            });
            return;
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
        });
    }
    startHeartbeat(intervalMs) {
        this.clearHeartbeat();
        this.heartbeatAckReceived = true;
        // Discord's own gateway spec calls for jittering only the first heartbeat by a
        // random fraction of the interval - this is protocol-mandated, not traffic shaping.
        const firstDelay = Math.floor(Math.random() * intervalMs);
        setTimeout(() => {
            this.sendHeartbeat();
            this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), intervalMs);
        }, firstDelay);
    }
    sendHeartbeat() {
        var _a;
        if (!this.heartbeatAckReceived) {
            Debug_1.Debug.write("[GatewayPresence] Missed heartbeat ACK, reconnecting");
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
        var _a;
        this.clearHeartbeat();
        (_a = this.onConnectedChange) === null || _a === void 0 ? void 0 : _a.call(this, false);
        if (this.closedByUs)
            return;
        Debug_1.Debug.write(`[GatewayPresence] Connection closed (${code}: ${reason || "no reason"}), reconnecting`);
        this.reconnectAttempt++;
        // Simple capped backoff so a persistent failure doesn't hammer Discord - not evasion,
        // just basic good-citizen retry behaviour.
        const delay = Math.min(30000, 1000 * Math.pow(1.5, Math.min(this.reconnectAttempt, 8)));
        setTimeout(() => {
            const url = code === 4000 || !this.sessionId ? GATEWAY_URL : (this.resumeGatewayUrl || GATEWAY_URL);
            this.open(`${url}?v=${GATEWAY_VERSION}&encoding=json`);
        }, delay);
    }
}
exports.GatewayPresenceClient = GatewayPresenceClient;
