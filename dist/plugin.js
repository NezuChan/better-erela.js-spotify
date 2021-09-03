"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spotify = void 0;
const erela_js_1 = require("erela.js");
const resolver_1 = __importDefault(require("./resolver"));
const check = (options) => {
    if (typeof options?.convertUnresolved !== "undefined" &&
        typeof options?.convertUnresolved !== "boolean") {
        throw new TypeError("Spotify option \"convertUnresolved\" must be a boolean.");
    }
    if (typeof options?.strategy !== "undefined" &&
        typeof options?.strategy !== "string") {
        throw new TypeError("Spotify option \"strategy\" must be a string.");
    }
    if (typeof options?.strategy !== "undefined" &&
        options?.strategy === "API" &&
        !options?.clientSecret) {
        throw new TypeError("Spotify option \"clientSecret\" required if strategy set to API.");
    }
    if (typeof options?.strategy !== "undefined" &&
        options?.strategy === "API" &&
        !options?.clientId) {
        throw new TypeError("Spotify option \"clientId\" required if strategy set to API.");
    }
    if (typeof options?.playlistPageLimit !== "undefined" &&
        typeof options?.playlistPageLimit !== "number") {
        throw new TypeError("Spotify option \"playlistPageLimit\" must be a number.");
    }
    if (typeof options?.albumPageLimit !== "undefined" &&
        typeof options?.albumPageLimit !== "number") {
        throw new TypeError("Spotify option \"albumPageLimit\" must be a number.");
    }
    if (typeof options?.showPageLimit !== "undefined" &&
        typeof options?.showPageLimit !== "number") {
        throw new TypeError("Spotify option \"showPageLimit\" must be a number.");
    }
    if (typeof options?.maxCacheLifeTime !== "undefined" &&
        typeof options?.maxCacheLifeTime !== "number") {
        throw new TypeError("Spotify option \"maxCacheLifeTime\" must be a number.");
    }
};
class Spotify extends erela_js_1.Plugin {
    constructor(options) {
        super();
        this.options = options;
        this.resolver = new resolver_1.default(this);
        this.spotifyMatch = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|episode|show|album)[\/:]([A-Za-z0-9]+)/;
        this.functions = {
            track: this.resolver.getTrack,
            album: this.resolver.getAlbum,
            playlist: this.resolver.getPlaylist,
            artist: this.resolver.getArtist,
            show: this.resolver.getShow,
            episode: this.resolver.getEpisode
        };
        check(options);
        this.options = {
            ...options,
        };
        if (this.options?.strategy === "API") {
            this.resolver.renew();
        }
    }
    async load(manager) {
        this.manager = manager;
        this._search = manager.search.bind(manager);
        manager.search = this.search.bind(this);
    }
    async search(query, requester) {
        const finalQuery = query.query || query;
        const [, type, id] = finalQuery.match(this.spotifyMatch) ?? [];
        if (type in this.functions) {
            try {
                const func = this.functions[type];
                if (func) {
                    const data = await func.fetch(finalQuery, id);
                    const loadType = type === "track" || type === "episode" ? "TRACK_LOADED" : "PLAYLIST_LOADED";
                    const name = ["playlist", "album", 'artist', 'episode', 'show'].includes(type) ? data.name : null;
                    const tracks = await Promise.all(data.tracks.map(async (query) => {
                        let track = erela_js_1.TrackUtils.buildUnresolved(query, requester);
                        if (this.options?.convertUnresolved) {
                            try {
                                track = await this.resolver.resolve(track, requester);
                            }
                            catch {
                                return null;
                            }
                        }
                        return track;
                    }).filter(track => !!track));
                    //@ts-expect-error type mabok
                    return resolver_1.default.buildSearch(loadType, tracks, null, name);
                }
                const msg = "Incorrect type for Spotify URL, must be one of \"track\", \"album\", \"artist\", \"show\", \"episode\" or \"playlist\".";
                //@ts-expect-error type mabok
                return resolver_1.default.buildSearch("LOAD_FAILED", [], msg, null);
            }
            catch (e) {
                //@ts-expect-error type mabok
                return resolver_1.default.buildSearch(e.loadType ?? "LOAD_FAILED", [], e.message ?? null, null);
            }
        }
        return this._search(query, requester);
    }
}
exports.Spotify = Spotify;
//# sourceMappingURL=plugin.js.map