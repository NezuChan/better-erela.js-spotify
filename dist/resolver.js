"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Manager_1 = require("./Manager");
const undici_1 = require("undici");
class resolver {
    constructor(plugin) {
        this.plugin = plugin;
        this.resolveManager = {
            episode: new Manager_1.EpisodeManager(this),
            playlist: new Manager_1.PlaylistManager(this),
            show: new Manager_1.ShowManager(this),
            track: new Manager_1.TrackManager(this),
            album: new Manager_1.AlbumManager(this),
            artist: new Manager_1.ArtistManager(this)
        };
        this.token = undefined;
        this.BASE_URL = "https://api.spotify.com/v1";
    }
    async makeRequest(endpoint) {
        try {
            if (!this.token)
                await this.renew();
            const req = await (0, undici_1.fetch)(endpoint.startsWith("http") ? endpoint : `${this.BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`, { headers: { Authorization: this.token } });
            if ([401].includes(req.status)) {
                await this.renew();
                return await this.makeRequest(endpoint);
            }
            return await req.json();
        }
        catch (_e) {
            return null;
        }
    }
    async getToken() {
        const response = await (0, undici_1.fetch)("https://accounts.spotify.com/api/token?grant_type=client_credentials", {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${this.plugin.options.clientID ?? this.plugin.options.clientId}:${this.plugin.options.clientSecret}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        const { access_token, expires_in } = await response.json();
        if (!access_token) {
            throw new Error("Invalid Spotify client.");
        }
        this.token = `Bearer ${access_token}`;
        return expires_in * 1000;
    }
    async fetchAccessToken() {
        const response = await (0, undici_1.fetch)("https://open.spotify.com/get_access_token", { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59", referer: "https://open.spotify.com" } });
        const { accessToken, accessTokenExpirationTimestampMs } = await response.json();
        if (!accessToken)
            throw new Error("Could not fetch self spotify token.");
        this.token = `Bearer ${accessToken}`;
        return (new Date(accessTokenExpirationTimestampMs).getMilliseconds() - 10) * 1000;
    }
    async renew() {
        if (this.plugin.options.strategy === "API") {
            await this.getToken();
        }
        else {
            await this.fetchAccessToken();
        }
    }
}
exports.default = resolver;
//# sourceMappingURL=resolver.js.map