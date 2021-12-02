"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackManager = void 0;
const resolver_1 = __importDefault(require("../resolver"));
class TrackManager {
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
                return { tracks: this.cache.get(id) };
            const data = await this.plugin.resolver.makeRequest(`/tracks/${id}`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!data)
                return { tracks: [] };
            const track = resolver_1.default.buildUnresolved(data);
            this.cache.set(id, [track]);
            return { tracks: [track] };
        }
        const data = await this.plugin.resolver.makeRequest(`/tracks/${id}`);
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        if (!data)
            return { tracks: [] };
        const track = resolver_1.default.buildUnresolved(data);
        this.cache.set(id, [track]);
        return { tracks: [track] };
    }
}
exports.TrackManager = TrackManager;
//# sourceMappingURL=Track.js.map