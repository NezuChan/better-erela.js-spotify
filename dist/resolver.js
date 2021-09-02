"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const erela_js_1 = require("erela.js");
const Manager_1 = require("./Manager");
const petitio_1 = __importDefault(require("petitio"));
const collection_1 = __importDefault(require("@discordjs/collection"));
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
        this.cache = new collection_1.default();
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear();
            }, this.plugin.options?.maxCacheLifeTime);
        }
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
            author: Array.isArray(track.artists) ? track.artists.map((x) => x.name).join(" ") : '',
            duration: track.duration_ms,
            uri: track.external_urls.spotify,
            thumbnail: track.images ? track?.images[0]?.url ?? null : track.album.images[0].url ?? null
        };
    }
    static buildSearch(loadType, tracks, error, name) {
        return {
            loadType: loadType,
            tracks: tracks ?? [],
            playlist: name ? {
                name,
                duration: tracks?.reduce((acc, cur) => acc + (cur.duration || 0), 0)
            } : null,
            exception: error ? {
                message: error,
                severity: "COMMON",
            } : null
        };
    }
    async makeRequest(endpoint, modify = () => void 0) {
        if (!this.token)
            await this.requestToken();
        const req = (0, petitio_1.default)(`${this.BASE_URL}${/^\//.test(endpoint) ? endpoint : `/${endpoint}`}`)
            .header("Authorization", this.token);
        modify(req);
        return req.json();
    }
    async retrieveTrack(unresolvedTrack) {
        const params = new URLSearchParams({
            identifier: `ytsearch:${unresolvedTrack.author} - ${unresolvedTrack.title}`
        });
        const node = this.plugin.manager?.leastUsedNodes.first();
        const res = await node.makeRequest(`/loadtracks?${params.toString()}`);
        return res.tracks[0];
    }
    buildUnresolved(track, requester) {
        let unresolvedTrack = erela_js_1.TrackUtils.buildUnresolved(track, requester);
        if (this.plugin.options?.useSpotifyMetadata) {
            Object.assign(unresolvedTrack, {
                title: unresolvedTrack.title,
                author: unresolvedTrack.author,
                uri: unresolvedTrack.uri,
                thumbnail: unresolvedTrack.thumbnail,
            });
        }
        return unresolvedTrack;
    }
    async resolve(unresolvedTrack, requester) {
        const cached = this.cache.get(unresolvedTrack.identifier);
        if (cached)
            return cached;
        const lavaTrack = await this.retrieveTrack(unresolvedTrack);
        const resolvedTrack = erela_js_1.TrackUtils.build(lavaTrack, requester);
        if (lavaTrack) {
            if (this.plugin.options?.useSpotifyMetadata) {
                Object.assign(resolvedTrack, {
                    title: unresolvedTrack.title,
                    author: unresolvedTrack.author,
                    uri: unresolvedTrack.uri,
                    thumbnail: unresolvedTrack.thumbnail,
                });
            }
            if (this.plugin.options?.cacheTrack)
                this.cache.set(unresolvedTrack.identifier, resolvedTrack);
        }
        return resolvedTrack;
    }
    async requestToken() {
        if (this.nextRequest)
            return;
        try {
            const request = await (0, petitio_1.default)("https://accounts.spotify.com/api/token", "POST")
                .header({
                Authorization: `Basic ${Buffer.from(this.plugin.options?.clientId + ":" + this.plugin.options?.clientSecret).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }).body("grant_type=client_credentials").send();
            if (request.statusCode === 400)
                return Promise.reject(new Error("Invalid Spotify Client"));
            const { access_token, token_type, expires_in } = request.json();
            Object.defineProperty(this, "token", {
                value: `${token_type} ${access_token}`
            });
            Object.defineProperty(this, "nextRequest", {
                configurable: true,
                value: setTimeout(() => {
                    delete this.nextRequest;
                    void this.requestToken();
                }, expires_in * 1000)
            });
        }
        catch (e) {
            if (e.statusCode === 400) {
                return Promise.reject(new Error("Invalid Spotify client."));
            }
            await this.requestToken();
        }
    }
}
exports.default = resolver;
//# sourceMappingURL=resolver.js.map