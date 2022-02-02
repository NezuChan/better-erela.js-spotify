import { SearchResult, TrackUtils } from "erela.js";
import { SpotifyTrack } from "../typings";
import { BaseManager } from "./BaseManager";

export class PlaylistManager extends BaseManager {
    public async fetch(id: string, requester: unknown): Promise<SearchResult> {
        await this.checkFromCache(id, requester)!;
        const playlist = await this.resolver.makeRequest<spotifyPlaylist>(`/playlists/${id}?market=${this.resolver.plugin.options.countryMarket}`);
        if (playlist && playlist.tracks.items.filter(x => x.track !== null).length) {
            let page = 1;
            while (playlist.tracks.next && (!this.resolver.plugin.options.playlistPageLimit ? true : page < this.resolver.plugin.options.playlistPageLimit)) {
                const tracks = await this.resolver.makeRequest<spotifyPlaylist["tracks"]>(playlist.tracks.next);
                page++;
                if (tracks && tracks.items) {
                    playlist.tracks.next = tracks.next;
                    playlist.tracks.items.push(...tracks.items);
                } else { playlist.tracks.next = null; }
            }
            if (this.resolver.plugin.options.cacheTrack) this.cache.set(id, { tracks: playlist.tracks.items.filter(x => x.track).map(x => x.track!), name: playlist.name });
            return this.buildSearch("PLAYLIST_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack(playlist.tracks.items.filter(x => x.track !== null).map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item.track!), requester))) : playlist.tracks.items.filter(x => x.track !== null).map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item.track!), requester)), undefined, playlist.name);
        } return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}

export interface spotifyPlaylist {
    id: string;
    name: string;
    tracks: {
        items: { track: SpotifyTrack | null }[];
        next: string | null;
    };
}
