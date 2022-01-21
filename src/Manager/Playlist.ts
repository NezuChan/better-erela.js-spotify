import Spotify from "../index";
import resolver from "../resolver";
import { Playlist, PlaylistTracks, UnresolvedSpotifyTrack } from "../typings";
export class PlaylistManager {
    public cache: Map<string, PlaylistCache> = new Map();
    public constructor(public plugin: Spotify) {
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear();
            }, plugin.options.maxCacheLifeTime);
        }
    }

    public async fetch(id: string): Promise<PlaylistCache> {
        if (this.plugin.options?.cacheTrack) {
            if (this.cache.has(id)) return this.cache.get(id)!;
            const playlist = await this.plugin.resolver.makeRequest<Playlist>(`/playlists/${id}`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!playlist.tracks) return { tracks: [], name: undefined! };
            const tracks = playlist.tracks.items.filter(x => x.track).filter(x => x.track.name).map(item => resolver.buildUnresolved(item.track));
            let next = playlist.tracks.next; let page = 1;

            /* eslint no-negated-condition: "off" */
            while (next && (!this.plugin.options.playlistPageLimit ? true : page < this.plugin.options.playlistPageLimit)) {
                const nextPage = await this.plugin.resolver.makeRequest<PlaylistTracks>(next.split("v1")[1]);
                tracks.push(...nextPage.items.filter(x => x.track).filter(x => x.track.name).map(item => resolver.buildUnresolved(item.track)));
                next = nextPage.next;
                page++;
            }
            this.cache.set(id, { tracks, name: playlist.name });
            return { tracks, name: playlist.name };
        }
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        const playlist = await this.plugin.resolver.makeRequest<Playlist>(`/playlists/${id}`);
        if (!playlist.tracks) return { tracks: [], name: undefined! };
        const tracks = playlist.tracks.items.filter(x => x.track).filter(x => x.track.name).map(item => resolver.buildUnresolved(item.track));
        let next = playlist.tracks.next; let page = 1;

        /* eslint no-negated-condition: "off" */
        while (next && (!this.plugin.options?.playlistPageLimit ? true : page < this.plugin.options.playlistPageLimit)) {
            const nextPage = await this.plugin.resolver.makeRequest<PlaylistTracks>(next.split("v1")[1]);
            tracks.push(...nextPage.items.filter(x => x.track).filter(x => x.track.name).map(item => resolver.buildUnresolved(item.track)));
            next = nextPage.next;
            page++;
        }

        return { tracks, name: playlist.name };
    }
}

interface PlaylistCache {
    tracks: UnresolvedSpotifyTrack[];
    name: string;
}
