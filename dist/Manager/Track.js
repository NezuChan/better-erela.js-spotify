"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackManager = void 0;
const erela_js_1 = require("erela.js");
const BaseManager_1 = require("./BaseManager");
class TrackManager extends BaseManager_1.BaseManager {
    async fetch(id, requester) {
        this.checkFromCache(id, requester);
        const track = await this.resolver.makeRequest(`/tracks/${id}?market=${this.resolver.plugin.options.countryMarket}`);
        if (track) {
            this.cache.set(id, { tracks: [track] });
            return this.buildSearch("TRACK_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack([erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(track), requester)]) : [erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(track), requester)], undefined, track.name);
        }
        else
            return this.buildSearch("NO_MATCHES", undefined, "TRACK_NOT_FOUND", undefined);
    }
}
exports.TrackManager = TrackManager;
//# sourceMappingURL=Track.js.map