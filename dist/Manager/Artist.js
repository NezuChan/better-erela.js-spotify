"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtistManager = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
const spotify_url_info_1 = require("spotify-url-info");
const resolver_1 = __importDefault(require("../resolver"));
class ArtistManager {
    constructor(plugin) {
        this.plugin = plugin;
        this.cache = new collection_1.default();
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear();
            }, plugin.options?.maxCacheLifeTime);
        }
    }
    async fetch(url, id) {
        if (this.plugin.options?.cacheTrack) {
            if (this.cache.has(id))
                return this.cache.get(id);
            if (this.plugin.options.stragery === "API") {
                const metaData = await this.plugin.resolver.makeRequest(`/artists/${id}?market=US`);
                const playlist = await this.plugin.resolver.makeRequest(`/artists/${id}/top-tracks?country=US`);
                const tracks = playlist.tracks.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item));
                this.cache.set(id, {
                    tracks,
                    name: metaData.name
                });
                return { tracks, name: metaData.name };
            }
            const tracks = await (0, spotify_url_info_1.getTracks)(url);
            const metaData = await (0, spotify_url_info_1.getData)(url);
            const unresolvedAlbumTracks = tracks.map(track => track && resolver_1.default.buildUnresolved(track)) ?? [];
            this.cache.set(id, {
                tracks: unresolvedAlbumTracks,
                name: metaData.name
            });
            return { tracks: unresolvedAlbumTracks, name: metaData.name };
        }
        if (this.plugin.options?.stragery === "API") {
            const metaData = await this.plugin.resolver.makeRequest(`/artists/${id}?market=US`);
            const playlist = await this.plugin.resolver.makeRequest(`/artists/${id}/top-tracks?country=US`);
            const tracks = playlist.tracks.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item));
            return { tracks, name: metaData.name };
        }
        const tracks = await (0, spotify_url_info_1.getTracks)(url);
        const metaData = await (0, spotify_url_info_1.getData)(url);
        const unresolvedAlbumTracks = tracks.map(track => track && resolver_1.default.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name };
    }
}
exports.ArtistManager = ArtistManager;
//# sourceMappingURL=Artist.js.map