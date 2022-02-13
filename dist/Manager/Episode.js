"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpisodeManager = void 0;
const erela_js_1 = require("erela.js");
const BaseManager_1 = require("./BaseManager");
class EpisodeManager extends BaseManager_1.BaseManager {
    async fetch(id, requester) {
        await this.checkFromCache(id, requester);
        const episode = await this.resolver.makeRequest(`/episodes/${id}?market=${this.resolver.plugin.options.countryMarket}`);
        if (episode && !episode.error) {
            if (this.resolver.plugin.options.cacheTrack)
                this.cache.set(id, { tracks: [episode] });
            return this.buildSearch("TRACK_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack([erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(episode), requester)]) : [erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(episode), requester)], undefined, episode.name);
        }
        return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}
exports.EpisodeManager = EpisodeManager;
//# sourceMappingURL=Episode.js.map