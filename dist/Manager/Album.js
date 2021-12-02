"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlbumManager = void 0;
const resolver_1 = __importDefault(require("../resolver"));
class AlbumManager {
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
            const album = await this.plugin.resolver.makeRequest(`/albums/${id}`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!album.tracks)
                return { tracks: [], name: undefined };
            const tracks = album.tracks.items.map(item => resolver_1.default.buildUnresolved(item));
            let next = album.tracks.next;
            let page = 1;
            /* eslint no-negated-condition: "off" */
            while (next && (!this.plugin.options.albumPageLimit ? true : page < this.plugin.options.albumPageLimit)) {
                const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
                tracks.push(...nextPage.tracks.items.map(item => resolver_1.default.buildUnresolved(item)));
                next = nextPage.tracks.next;
                page++;
            }
            this.cache.set(id, { tracks, name: album.name });
            return { tracks, name: album.name };
        }
        const album = await this.plugin.resolver.makeRequest(`/albums/${id}`);
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        if (!album.tracks)
            return { tracks: [], name: undefined };
        const tracks = album.tracks.items.map(item => resolver_1.default.buildUnresolved(item));
        let next = album.tracks.next;
        let page = 1;
        while (next && (!this.plugin.options?.albumPageLimit ? true : page < this.plugin.options.albumPageLimit)) {
            const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
            tracks.push(...nextPage.tracks.items.map(item => resolver_1.default.buildUnresolved(item)));
            next = nextPage.tracks.next;
            page++;
        }
        return { tracks, name: album.name };
    }
}
exports.AlbumManager = AlbumManager;
//# sourceMappingURL=Album.js.map