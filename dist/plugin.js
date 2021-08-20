"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spotify = void 0;
const erela_js_1 = require("erela.js");
const resolver_1 = __importDefault(require("./resolver"));
const REGEX = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|episode|show|album)[\/:]([A-Za-z0-9]+)/;
const check = (options) => {
    if (typeof options?.convertUnresolved !== "undefined" &&
        typeof options?.convertUnresolved !== "boolean") {
        throw new TypeError("Spotify option \"convertUnresolved\" must be a boolean.");
    }
};
class Spotify extends erela_js_1.Plugin {
    constructor(options) {
        super();
        this.resolver = new resolver_1.default();
        this.functions = {
            track: this.resolver.getTrack.bind(this),
            album: this.resolver.getAlbum.bind(this),
            playlist: this.resolver.getPlaylist.bind(this),
            artist: this.resolver.getArtist.bind(this),
            show: this.resolver.getShow.bind(this),
            episode: this.resolver.getEpisode.bind(this)
        };
        check(options);
        this.options = {
            ...options,
        };
    }
    load(manager) {
        this.manager = manager;
        this._search = manager.search.bind(manager);
        manager.search = this.search.bind(this);
    }
    async search(query, requester) {
        const finalQuery = query.query || query;
        const [, type, id] = finalQuery.match(REGEX) ?? [];
        if (type in this.functions) {
            try {
                const func = this.functions[type];
                if (func) {
                    const data = await func(finalQuery);
                    const loadType = type === "track" ? "TRACK_LOADED" : "PLAYLIST_LOADED";
                    const name = ["playlist", "album", 'artist', 'episode', 'show'].includes(type) ? data.name : null;
                    const tracks = data.tracks.map(query => {
                        const track = erela_js_1.TrackUtils.buildUnresolved(query, requester);
                        if (this.options.convertUnresolved) {
                            try {
                                track.resolve();
                            }
                            catch {
                                return null;
                            }
                        }
                        return track;
                    }).filter(track => !!track);
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