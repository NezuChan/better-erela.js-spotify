"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistManager = void 0;
const resolver_1 = __importDefault(require("../resolver"));
class PlaylistManager {
    constructor(plugin) {
        this.plugin = plugin;
        this.cache = new Map();
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear();
            }, plugin.options.maxCacheLifeTime);
        }
    }
    async fetch(id) {
        if (this.plugin.options?.cacheTrack) {
            if (this.cache.has(id))
                return this.cache.get(id);
            const playlist = await this.plugin.resolver.makeRequest(`/playlists/${id}`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!playlist.tracks)
                return { tracks: [], name: undefined };
            const tracks = playlist.tracks.items.filter(x => x.track.name).map(item => resolver_1.default.buildUnresolved(item.track));
            let next = playlist.tracks.next;
            let page = 1;
            /* eslint no-negated-condition: "off" */
            while (next && (!this.plugin.options.playlistPageLimit ? true : page < this.plugin.options.playlistPageLimit)) {
                const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
                tracks.push(...nextPage.items.filter(x => x.track.name).map(item => resolver_1.default.buildUnresolved(item.track)));
                next = nextPage.next;
                page++;
            }
            this.cache.set(id, { tracks, name: playlist.name });
            return { tracks, name: playlist.name };
        }
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        const playlist = await this.plugin.resolver.makeRequest(`/playlists/${id}`);
        if (!playlist.tracks)
            return { tracks: [], name: undefined };
        const tracks = playlist.tracks.items.filter(x => x.track.name).map(item => resolver_1.default.buildUnresolved(item.track));
        let next = playlist.tracks.next;
        let page = 1;
        /* eslint no-negated-condition: "off" */
        while (next && (!this.plugin.options?.playlistPageLimit ? true : page < this.plugin.options.playlistPageLimit)) {
            const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
            tracks.push(...nextPage.items.filter(x => x.track.name).map(item => resolver_1.default.buildUnresolved(item.track)));
            next = nextPage.next;
            page++;
        }
        return { tracks, name: playlist.name };
    }
}
exports.PlaylistManager = PlaylistManager;
//# sourceMappingURL=Playlist.js.map