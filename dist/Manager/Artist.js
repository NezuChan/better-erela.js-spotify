"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtistManager = void 0;
const resolver_1 = __importDefault(require("../resolver"));
class ArtistManager {
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
            const metaData = await this.plugin.resolver.makeRequest(`/artists/${id}?market=US`);
            const playlist = await this.plugin.resolver.makeRequest(`/artists/${id}/top-tracks?country=US`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!playlist.tracks)
                return { tracks: [], name: undefined };
            const tracks = playlist.tracks.map(item => resolver_1.default.buildUnresolved(item));
            this.cache.set(id, { tracks, name: `${metaData.name} Top Tracks` });
            return { tracks, name: `${metaData.name} Top Tracks` };
        }
        const metaData = await this.plugin.resolver.makeRequest(`/artists/${id}?market=US`);
        const playlist = await this.plugin.resolver.makeRequest(`/artists/${id}/top-tracks?country=US`);
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        if (!playlist.tracks)
            return { tracks: [], name: undefined };
        const tracks = playlist.tracks.map(item => resolver_1.default.buildUnresolved(item));
        return { tracks, name: `${metaData.name} Top Tracks` };
    }
}
exports.ArtistManager = ArtistManager;
//# sourceMappingURL=Artist.js.map