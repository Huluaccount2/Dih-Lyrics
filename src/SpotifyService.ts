import { Settings } from "./Settings"
import { Debug } from "./Debug"

interface IAccessTokenResponse {
    access_token: string
    refresh_token: string
}

interface ICookieTokenResponse {
    accessToken: string
    accessTokenExpirationTimestampMs: number
    isAnonymous: boolean
}

export class SpotifyService {
    public static token: string = ""
    public static tokenExpiresAt: number = 0

    // Cookie-based auth is an alternative to the Client ID/Secret app flow above - it uses
    // the sp_dc session cookie from a logged-in open.spotify.com browser session instead.
    // No Spotify Developer app needed. The trade-off: it's using an internal endpoint
    // (open.spotify.com/get_access_token) that isn't a documented public API, so if Spotify
    // changes it, this breaks until it's updated - same category of risk as the Musixmatch
    // and internal lyrics-endpoint tricks already used elsewhere in this app.
    public static async refreshViaCookie(): Promise<boolean> {
        const cookie = Settings.credentials.spotifyCookie

        if (!cookie?.trim()) {
            Debug.write("[SpotifyService] No Spotify cookie configured.")

            return false
        }

        const request = await fetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player", {
            headers: {
                "Cookie": `sp_dc=${cookie.trim()}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            }
        })

        if (!request.ok) {
            Debug.write(`[SpotifyService] Cookie token refresh failed: HTTP ${request.status}`)

            return false
        }

        const json = await request.json() as ICookieTokenResponse

        if (json.isAnonymous || !json.accessToken) {
            Debug.write("[SpotifyService] Cookie token came back anonymous - the sp_dc cookie is likely expired or invalid.")

            return false
        }

        this.token = json.accessToken
        this.tokenExpiresAt = json.accessTokenExpirationTimestampMs

        Debug.write("[SpotifyService] Refreshed access token via cookie.")

        return true
    }

    public static async exchange(): Promise<void> {
        const request = await fetch("https://accounts.spotify.com/api/token", {
            "headers": {
                "Authorization": `Basic ${Buffer.from(`${Settings.credentials.clientID}:${Settings.credentials.clientSecret}`).toString('base64')}`,
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: new URLSearchParams({
                client_id: Settings.credentials.clientID,
                grant_type: "authorization_code",
                code: Settings.credentials.code,
                redirect_uri: Settings.credentials.customRedirectUri
            }).toString(),
            "method": "POST"
        });

        if (!request.ok) return

        const json = await request.json() as IAccessTokenResponse

        this.token = json.access_token

        Settings.credentials.refreshToken = json.refresh_token
    }

    public static async refresh(): Promise<void> {
        if (Settings.credentials.spotifyAuthMethod === "cookie") {
            await this.refreshViaCookie()

            return
        }

        const request = await fetch("https://accounts.spotify.com/api/token", {
            "headers": {
                "Authorization": `Basic ${Buffer.from(`${Settings.credentials.clientID}:${Settings.credentials.clientSecret}`).toString('base64')}`,
                "content-type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: Settings.credentials.refreshToken,
                redirect_uri: Settings.credentials.customRedirectUri
            }).toString(),
            "method": "POST"
        });

        if (!request.ok) return

        const json = await request.json() as IAccessTokenResponse

        this.token = json.access_token

        if (json.refresh_token) Settings.credentials.refreshToken = json.refresh_token
    }
}
