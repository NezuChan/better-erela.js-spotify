import { SearchResult, TrackUtils } from "erela.js";
import { SpotifyTrack } from "../typings";
import { BaseManager } from "./BaseManager";

export class AlbumManager extends BaseManager {
    public async fetch(id: string, requester: unknown): Promise<SearchResult> {
        this.checkFromCache(id, requester)!;
        const album = await this.resolver.makeRequest<SpotifyAlbum>(`/albums/${id}`);
        if (album && album.tracks) {
            let page = 1;
            while (album.tracks.next && (!this.resolver.plugin.options.albumPageLimit ? true : page < this.resolver.plugin.options.albumPageLimit)) {
                const tracks = await this.resolver.makeRequest<SpotifyAlbum["tracks"]>(album.tracks.next);
                page++;
                if (tracks && tracks.items) {
                    album.tracks.next = tracks.next;
                    album.tracks.items.push(...tracks.items);
                } else { album.tracks.next = null; }
            }
            this.cache.set(id, { tracks: album.tracks.items, name: album.name });
            return this.buildSearch("PLAYLIST_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack(album.tracks.items.map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item), requester))) : album.tracks.items.map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item), requester)), undefined, album.name);
        } return this.buildSearch("NO_MATCHES", undefined, "ALBUM_NOT_FOUND", undefined);
    }
}

export interface SpotifyAlbum {
    id: string;
    name: string;
    tracks?: {
        items: SpotifyTrack[];
        next: string | null;
    };
}
