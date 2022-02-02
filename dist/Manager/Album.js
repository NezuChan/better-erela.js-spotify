"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlbumManager = void 0;
const erela_js_1 = require("erela.js");
const BaseManager_1 = require("./BaseManager");
class AlbumManager extends BaseManager_1.BaseManager {
    async fetch(id, requester) {
        await this.checkFromCache(id, requester);
        const album = await this.resolver.makeRequest(`/albums/${id}`);
        if (album && album.tracks) {
            let page = 1;
            while (album.tracks.next && (!this.resolver.plugin.options.albumPageLimit ? true : page < this.resolver.plugin.options.albumPageLimit)) {
                const tracks = await this.resolver.makeRequest(album.tracks.next);
                page++;
                if (tracks && tracks.items) {
                    album.tracks.next = tracks.next;
                    album.tracks.items.push(...tracks.items);
                }
                else {
                    album.tracks.next = null;
                }
            }
            if (this.resolver.plugin.options.cacheTrack)
                this.cache.set(id, { tracks: album.tracks.items, name: album.name });
            return this.buildSearch("PLAYLIST_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack(album.tracks.items.map(item => erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(item), requester))) : album.tracks.items.map(item => erela_js_1.TrackUtils.buildUnresolved(this.buildUnresolved(item), requester)), undefined, album.name);
        }
        return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}
exports.AlbumManager = AlbumManager;
//# sourceMappingURL=Album.js.map