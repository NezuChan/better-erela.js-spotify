import Spotify from "../index";
import resolver from "../resolver";
import { Album, UnresolvedSpotifyTrack } from "../typings";
export class AlbumManager {
    public cache: Map<string, AlbumCache> = new Map();
    public constructor(public plugin: Spotify) {
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear();
            }, plugin.options.maxCacheLifeTime);
        }
    }

    public async fetch(id: string): Promise<AlbumCache> {
        if (this.plugin.options?.cacheTrack) {
            if (this.cache.has(id)) return this.cache.get(id)!;
            const album = await this.plugin.resolver.makeRequest<Album>(`/albums/${id}`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!album.tracks) return { tracks: [], name: undefined! };
            const tracks = album.tracks.items.map(item => resolver.buildUnresolved(item));
            let next = album.tracks.next; let page = 1;

            /* eslint no-negated-condition: "off" */
            while (next && (!this.plugin.options.albumPageLimit ? true : page < this.plugin.options.albumPageLimit)) {
                const nextPage = await this.plugin.resolver.makeRequest<Album>(next.split("v1")[1]);
                tracks.push(...nextPage.tracks.items.map(item => resolver.buildUnresolved(item)));
                next = nextPage.tracks.next;
                page++;
            }
            this.cache.set(id, { tracks, name: album.name });
            return { tracks, name: album.name };
        }
        const album = await this.plugin.resolver.makeRequest<Album>(`/albums/${id}`);
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        if (!album.tracks) return { tracks: [], name: undefined! };
        const tracks = album.tracks.items.map(item => resolver.buildUnresolved(item));
        let next = album.tracks.next; let page = 1;

        while (next && (!this.plugin.options?.albumPageLimit ? true : page < this.plugin.options.albumPageLimit)) {
            const nextPage = await this.plugin.resolver.makeRequest<Album>(next.split("v1")[1]);
            tracks.push(...nextPage.tracks.items.map(item => resolver.buildUnresolved(item)));
            next = nextPage.tracks.next;
            page++;
        }
        return { tracks, name: album.name };
    }
}

interface AlbumCache {
    tracks: UnresolvedSpotifyTrack[];
    name: string;
}
