"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtistManager = void 0;
const erela_js_1 = require("erela.js");
const BaseManager_1 = require("./BaseManager");
class ArtistManager extends BaseManager_1.BaseManager {
    async fetch(id, requester) {
        await this.checkFromCache(id, requester);
        const artistTracks = await this.resolver.makeRequest(`/artists/${id}/top-tracks?market=${this.resolver.plugin.options.countryMarket}`);
        const artistInfo = await this.resolver.makeRequest(`/artists/${id}`);
        if (artistInfo && artistTracks) {
            if (this.resolver.plugin.options.cacheTrack)
                this.cache.set(id, { tracks: artistTracks.tracks, name: artistInfo.name });
            return this.buildSearch("PLAYLIST_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack(artistTracks.tracks.map(item => erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(item), requester))) : artistTracks.tracks.map(item => erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(item), requester)), undefined, artistInfo.name);
        }
        return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}
exports.ArtistManager = ArtistManager;
//# sourceMappingURL=Artist.js.map