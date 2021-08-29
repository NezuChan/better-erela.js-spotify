"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlbumManager = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
const spotify_url_info_1 = require("spotify-url-info");
const resolver_1 = __importDefault(require("../resolver"));
class AlbumManager {
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
                const album = await this.plugin.resolver.makeRequest(`/albums/${id}`);
                const tracks = album.tracks.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item));
                let next = album.tracks.next, page = 1;
                while (next && (!this.plugin.options.albumPageLimit ? true : page < this.plugin.options.albumPageLimit)) {
                    const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
                    tracks.push(...nextPage.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item)));
                    next = nextPage.next;
                    page++;
                }
                this.cache.set(id, {
                    tracks,
                    title: album.name
                });
                return { tracks, name: album.name };
            }
            const tracks = await (0, spotify_url_info_1.getTracks)(url);
            const metaData = await (0, spotify_url_info_1.getData)(url);
            const unresolvedAlbumTracks = tracks.map(track => track && resolver_1.default.buildUnresolved(track)) ?? [];
            this.cache.set(id, {
                tracks: unresolvedAlbumTracks,
                title: metaData.name
            });
            return { tracks: unresolvedAlbumTracks, name: metaData.name };
        }
        if (this.plugin.options?.stragery === "API") {
            const album = await this.plugin.resolver.makeRequest(`/albums/${id}`);
            const tracks = album.tracks.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item));
            let next = album.tracks.next, page = 1;
            while (next && (!this.plugin.options?.albumPageLimit ? true : page < this.plugin.options.albumPageLimit)) {
                const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
                tracks.push(...nextPage.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item)));
                next = nextPage.next;
                page++;
            }
            return { tracks, name: album.name };
        }
        const tracks = await (0, spotify_url_info_1.getTracks)(url);
        const metaData = await (0, spotify_url_info_1.getData)(url);
        const unresolvedAlbumTracks = tracks.map(track => track && resolver_1.default.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name };
    }
}
exports.AlbumManager = AlbumManager;
//# sourceMappingURL=Album.js.map