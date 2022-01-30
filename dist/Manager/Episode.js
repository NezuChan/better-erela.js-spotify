"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpisodeManager = void 0;
const erela_js_1 = require("erela.js");
const BaseManager_1 = require("./BaseManager");
class EpisodeManager extends BaseManager_1.BaseManager {
    async fetch(id, requester) {
        this.checkFromCache(id, requester);
        const episode = await this.resolver.makeRequest(`/episode/${id}?market=${this.resolver.plugin.options.countryMarket}`);
        if (episode) {
            this.cache.set(id, { tracks: [episode] });
            return this.buildSearch("TRACK_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack([erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(episode), requester)]) : [erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(episode), requester)], undefined, episode.name);
        }
        else
            return this.buildSearch("NO_MATCHES", undefined, "TRACK_NOT_FOUND", undefined);
    }
}
exports.EpisodeManager = EpisodeManager;
//# sourceMappingURL=Episode.js.map