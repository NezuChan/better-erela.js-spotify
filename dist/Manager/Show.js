"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowManager = void 0;
const erela_js_1 = require("erela.js");
const BaseManager_1 = require("./BaseManager");
class ShowManager extends BaseManager_1.BaseManager {
    async fetch(id, requester) {
        await this.checkFromCache(id, requester);
        const show = await this.resolver.makeRequest(`/shows/${id}?market=${this.resolver.plugin.options.countryMarket}`);
        if (show && show.episodes) {
            let page = 1;
            while (show.episodes.next && (!this.resolver.plugin.options.showPageLimit ? true : page < this.resolver.plugin.options.showPageLimit)) {
                const episodes = await this.resolver.makeRequest(show.episodes.next);
                page++;
                if (episodes && episodes.items) {
                    show.episodes.next = episodes.next;
                    show.episodes.items.push(...episodes.items);
                }
                else {
                    show.episodes.next = null;
                }
            }
            if (this.resolver.plugin.options.cacheTrack)
                this.cache.set(id, { tracks: show.episodes.items, name: show.name });
            return this.buildSearch("PLAYLIST_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack(show.episodes.items.map(item => erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(item), requester))) : show.episodes.items.map(item => erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(item), requester)), undefined, show.name);
        }
        return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}
exports.ShowManager = ShowManager;
//# sourceMappingURL=Show.js.map