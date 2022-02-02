"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackManager = void 0;
const erela_js_1 = require("erela.js");
const BaseManager_1 = require("./BaseManager");
class TrackManager extends BaseManager_1.BaseManager {
    async fetch(id, requester) {
        await this.checkFromCache(id, requester);
        const track = await this.resolver.makeRequest(`/tracks/${id}`);
        if (track) {
            if (this.resolver.plugin.options.cacheTrack)
                this.cache.set(id, { tracks: [track] });
            return this.buildSearch("TRACK_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack([erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(track), requester)]) : [erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(track), requester)], undefined, track.name);
        }
        return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}
exports.TrackManager = TrackManager;
//# sourceMappingURL=Track.js.map