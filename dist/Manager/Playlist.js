"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaylistManager = void 0;
const collection_1 = __importDefault(require("@discordjs/collection"));
const spotify_url_info_1 = require("spotify-url-info");
const resolver_1 = __importDefault(require("../resolver"));
class PlaylistManager {
    constructor(plugin) {
        this.plugin = plugin;
        this.cache = new collection_1.default();
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear();
            }, plugin.options?.maxCacheLifeTime);
        }
    }
    async fetch(url, id) {
        if (this.plugin.options?.cacheTrack) {
            if (this.cache.has(id))
                return this.cache.get(id);
            if (this.plugin.options.stragery === "API") {
                const playlist = await this.plugin.resolver.makeRequest(`/playlists/${id}`);
                const tracks = playlist.tracks.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item.track));
                let next = playlist.tracks.next, page = 1;
                while (next && (!this.plugin.options.playlistPageLimit ? true : page < this.plugin.options.playlistPageLimit)) {
                    const nextPage = await this.plugin.resolver.makeRequest(next.split("v1")[1]);
                    tracks.push(...nextPage.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver_1.default.buildUnresolved(item.track)));
                    next = nextPage.next;
                    page++;
                }
                this.cache.set(id, {
                    tracks,
                    title: playlist.name
                });
                return { tracks, name: playlist.name };
            }
            const tracks = await (0, spotify_url_info_1.getTracks)(url);
            const metaData = await (0, spotify_url_info_1.getData)(url);
            //@ts-expect-error no typings
            if (typeof tracks[0].track === "object") {
                //@ts-expect-error no typings
                const unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => resolver_1.default.buildUnresolved(track.track)) ?? [];
                this.cache.set(id, {
                    tracks: unresolvedPlaylistTracks,
                    title: metaData.name
                });
                return { tracks: unresolvedPlaylistTracks, name: metaData.name };
            }
            else {
                const unresolvedPlaylistTracks = tracks.map(track => resolver_1.default.buildUnresolved(track)) ?? [];
                this.cache.set(id, {
                    tracks: unresolvedPlaylistTracks,
                    title: metaData.name
                });
                return { tracks: unresolvedPlaylistTracks, name: metaData.name };
            }
        }
        const tracks = await (0, spotify_url_info_1.getTracks)(url);
        const metaData = await (0, spotify_url_info_1.getData)(url);
        //@ts-expect-error no typings
        if (typeof tracks[0].track === "object") {
            //@ts-expect-error no typings
            const unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => resolver_1.default.buildUnresolved(track.track)) ?? [];
            return { tracks: unresolvedPlaylistTracks, name: metaData.name };
        }
        else {
            const unresolvedPlaylistTracks = tracks.map(track => resolver_1.default.buildUnresolved(track)) ?? [];
            return { tracks: unresolvedPlaylistTracks, name: metaData.name };
        }
    }
}
exports.PlaylistManager = PlaylistManager;
//# sourceMappingURL=Playlist.js.map