"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyService = void 0;
const Settings_1 = require("./Settings");
const Debug_1 = require("./Debug");
class SpotifyService {
    // Cookie-based auth is an alternative to the Client ID/Secret app flow above - it uses
    // the sp_dc session cookie from a logged-in open.spotify.com browser session instead.
    // No Spotify Developer app needed. The trade-off: it's using an internal endpoint
    // (open.spotify.com/get_access_token) that isn't a documented public API, so if Spotify
    // changes it, this breaks until it's updated - same category of risk as the Musixmatch
    // and internal lyrics-endpoint tricks already used elsewhere in this app.
    static refreshViaCookie() {
        return __awaiter(this, void 0, void 0, function* () {
            const cookie = Settings_1.Settings.credentials.spotifyCookie;
            if (!(cookie === null || cookie === void 0 ? void 0 : cookie.trim())) {
                Debug_1.Debug.write("[SpotifyService] No Spotify cookie configured.");
                return false;
            }
            const request = yield fetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player", {
                headers: {
                    "Cookie": `sp_dc=${cookie.trim()}`,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                }
            });
            if (!request.ok) {
                Debug_1.Debug.write(`[SpotifyService] Cookie token refresh failed: HTTP ${request.status}`);
                return false;
            }
            const json = yield request.json();
            if (json.isAnonymous || !json.accessToken) {
                Debug_1.Debug.write("[SpotifyService] Cookie token came back anonymous - the sp_dc cookie is likely expired or invalid.");
                return false;
            }
            this.token = json.accessToken;
            this.tokenExpiresAt = json.accessTokenExpirationTimestampMs;
            Debug_1.Debug.write("[SpotifyService] Refreshed access token via cookie.");
            return true;
        });
    }
    static exchange() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield fetch("https://accounts.spotify.com/api/token", {
                "headers": {
                    "Authorization": `Basic ${Buffer.from(`${Settings_1.Settings.credentials.clientID}:${Settings_1.Settings.credentials.clientSecret}`).toString('base64')}`,
                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: new URLSearchParams({
                    client_id: Settings_1.Settings.credentials.clientID,
                    grant_type: "authorization_code",
                    code: Settings_1.Settings.credentials.code,
                    redirect_uri: Settings_1.Settings.credentials.customRedirectUri
                }).toString(),
                "method": "POST"
            });
            if (!request.ok)
                return;
            const json = yield request.json();
            this.token = json.access_token;
            Settings_1.Settings.credentials.refreshToken = json.refresh_token;
        });
    }
    static refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Settings_1.Settings.credentials.spotifyAuthMethod === "cookie") {
                yield this.refreshViaCookie();
                return;
            }
            const request = yield fetch("https://accounts.spotify.com/api/token", {
                "headers": {
                    "Authorization": `Basic ${Buffer.from(`${Settings_1.Settings.credentials.clientID}:${Settings_1.Settings.credentials.clientSecret}`).toString('base64')}`,
                    "content-type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "refresh_token",
                    refresh_token: Settings_1.Settings.credentials.refreshToken,
                    redirect_uri: Settings_1.Settings.credentials.customRedirectUri
                }).toString(),
                "method": "POST"
            });
            if (!request.ok)
                return;
            const json = yield request.json();
            this.token = json.access_token;
            if (json.refresh_token)
                Settings_1.Settings.credentials.refreshToken = json.refresh_token;
        });
    }
}
exports.SpotifyService = SpotifyService;
SpotifyService.token = "";
SpotifyService.tokenExpiresAt = 0;
