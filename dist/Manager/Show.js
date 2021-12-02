"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowManager = void 0;
const resolver_1 = __importDefault(require("../resolver"));
class ShowManager {
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
            const show = await this.plugin.resolver.makeRequest(`/shows/${id}?market=US`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!show.episodes)
                return { tracks: [], name: undefined };
            const tracks = show.episodes.items.map(item => resolver_1.default.buildUnresolved(item));
            let next = show.episodes.next;
            let page = 1;
            /* eslint no-negated-condition: "off" */
            while (next && (!this.plugin.options.showPageLimit ? true : page < this.plugin.options.showPageLimit)) {
                const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
                tracks.push(...nextPage.items.map(item => resolver_1.default.buildUnresolved(item)));
                next = nextPage.next;
                page++;
            }
            this.cache.set(id, { tracks, name: show.name });
            return { tracks, name: show.name };
        }
        const show = await this.plugin.resolver.makeRequest(`/shows/${id}?market=US`);
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        if (!show.episodes)
            return { tracks: [], name: undefined };
        const tracks = show.episodes.items.map(item => resolver_1.default.buildUnresolved(item));
        let next = show.episodes.next;
        let page = 1;
        while (next && (!this.plugin.options?.showPageLimit ? true : page < this.plugin.options.showPageLimit)) {
            const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
            tracks.push(...nextPage.items.map(item => resolver_1.default.buildUnresolved(item)));
            next = nextPage.next;
            page++;
        }
        return { tracks, name: show.name };
    }
}
exports.ShowManager = ShowManager;
//# sourceMappingURL=Show.js.map