"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowManager = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
const spotify_url_info_1 = require("spotify-url-info");
const resolver_1 = __importDefault(require("../resolver"));
class ShowManager {
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
                const show = await this.plugin.resolver.makeRequest(`/shows/${id}?market=US`);
                const tracks = show.episodes.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item));
                let next = show.episodes.next, page = 1;
                while (next && (!this.plugin.options.showPageLimit ? true : page < this.plugin.options.showPageLimit)) {
                    const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
                    tracks.push(...nextPage.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item)));
                    next = nextPage.next;
                    page++;
                }
                this.cache.set(id, {
                    tracks,
                    name: show.name
                });
                return { tracks, name: show.name };
            }
            const tracks = await (0, spotify_url_info_1.getTracks)(url);
            const metaData = await (0, spotify_url_info_1.getData)(url);
            const unresolvedShowTracks = tracks.map(track => track && resolver_1.default.buildUnresolved(track)) ?? [];
            this.cache.set(id, {
                tracks: unresolvedShowTracks,
                name: metaData.name
            });
            return { tracks: unresolvedShowTracks, name: metaData.name };
        }
        if (this.plugin.options?.stragery === "API") {
            const show = await this.plugin.resolver.makeRequest(`/shows/${id}?market=US`);
            const tracks = show.episodes.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item));
            let next = show.episodes.next, page = 1;
            while (next && !this.plugin.options.showPageLimit ? true : page < this.plugin.options.showPageLimit) {
                const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
                tracks.push(...nextPage.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item)));
                next = nextPage.next;
                page++;
            }
            return { tracks, name: show.name };
        }
        const tracks = await (0, spotify_url_info_1.getTracks)(url);
        const metaData = await (0, spotify_url_info_1.getData)(url);
        const unresolvedShowTracks = tracks.map(track => track && resolver_1.default.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedShowTracks, name: metaData.name };
    }
}
exports.ShowManager = ShowManager;
//# sourceMappingURL=Show.js.map