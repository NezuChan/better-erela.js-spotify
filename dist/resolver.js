"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Manager_1 = require("./Manager");
const undici_1 = require("undici");
class resolver {
    constructor(plugin) {
        this.plugin = plugin;
        this.getTrack = new Manager_1.TrackManager(this.plugin);
        this.getPlaylist = new Manager_1.PlaylistManager(this.plugin);
        this.getAlbum = new Manager_1.AlbumManager(this.plugin);
        this.getArtist = new Manager_1.ArtistManager(this.plugin);
        this.getShow = new Manager_1.ShowManager(this.plugin);
        this.getEpisode = new Manager_1.EpisodeManager(this.plugin);
        this.BASE_URL = "https://api.spotify.com/v1";
    }
    static buildUnresolved(track) {
        if (!track)
            throw new ReferenceError("The Spotify track object was not provided");
        if (!track.name)
            throw new ReferenceError("The track name was not provided");
        if (typeof track.name !== "string")
            throw new TypeError(`The track name must be a string, received type ${typeof track.name}`);
        return {
            title: track.name,
            author: Array.isArray(track.artists) ? track.artists.map(x => x.name).join(" ") : "",
            duration: track.duration_ms,
            uri: track.external_urls.spotify,
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            thumbnail: track.album?.images?.length ? track.album.images[0].url ?? null : track.images?.length ? track.images[0].url ?? null : null
        };
    }
    static buildSearch(loadType, tracks, error, name) {
        return {
            loadType,
            tracks: tracks ?? [],
            /* eslint @typescript-eslint/prefer-nullish-coalescing: "off" */
            playlist: name ? { name, duration: tracks?.reduce((acc, cur) => acc + (cur.duration || 0), 0) ?? 0 } : null,
            exception: error ? { message: error, severity: "COMMON" } : null
        };
    }
    async makeRequest(endpoint) {
        if (!this.token)
            await this.renew();
        const req = await (0, undici_1.fetch)(`${this.BASE_URL}${/^\//.test(endpoint) ? endpoint : `/${endpoint}`}`, { headers: { Authorization: this.token } });
        return req.json();
    }
    async renewToken() {
        const response = await (0, undici_1.fetch)("https://accounts.spotify.com/api/token?grant_type=client_credentials", {
            method: "POST", headers: {
                /* eslint @typescript-eslint/restrict-template-expressions: "off" */
                Authorization: `Basic ${Buffer.from(`${this.plugin.options?.clientId}:${this.plugin.options?.clientSecret}`).toString("base64")}`,
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
    async getSelfToken() {
        const response = await (0, undici_1.fetch)("https://open.spotify.com/get_access_token?reason=transport&productType=embed", { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59" } });
        const { accessToken, accessTokenExpirationTimestampMs } = await response.json();
        if (!accessToken)
            throw new Error("Could not fetch self spotify token.");
        this.token = `Bearer ${accessToken}`;
        return new Date(accessTokenExpirationTimestampMs).getMilliseconds() * 1000;
    }
    async renew() {
        if (this.plugin.options?.strategy === "API") {
            const lastRenew = await this.renewToken();
            setTimeout(() => this.renew(), lastRenew);
        }
        else {
            const lastRenew = await this.getSelfToken();
            setTimeout(() => this.renew(), lastRenew);
        }
    }
}
exports.default = resolver;
//# sourceMappingURL=resolver.js.map