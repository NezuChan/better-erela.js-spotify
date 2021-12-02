import Spotify from "../index";
import resolver from "../resolver";
import { Show, ShowTracks, UnresolvedSpotifyTrack } from "../typings";
export class ShowManager {
    public cache: Map<string, ShowCache> = new Map();
    public constructor(public plugin: Spotify) {
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear();
            }, plugin.options.maxCacheLifeTime);
        }
    }

    public async fetch(id: string): Promise<ShowCache> {
        if (this.plugin.options?.cacheTrack) {
            if (this.cache.has(id)) return this.cache.get(id)!;
            const show = await this.plugin.resolver.makeRequest<Show>(`/shows/${id}?market=US`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!show.episodes) return { tracks: [], name: undefined! };

            const tracks = show.episodes.items.map(item => resolver.buildUnresolved(item));
            let next = show.episodes.next; let page = 1;

            /* eslint no-negated-condition: "off" */
            while (next && (!this.plugin.options.showPageLimit! ? true : page < this.plugin.options.showPageLimit)) {
                const nextPage = await this.plugin.resolver.makeRequest<ShowTracks>(next.split("v1")[1]);
                tracks.push(...nextPage.items.map(item => resolver.buildUnresolved(item)));
                next = nextPage.next;
                page++;
            }
            this.cache.set(id, { tracks, name: show.name });
            return { tracks, name: show.name };
        }
        const show = await this.plugin.resolver.makeRequest<Show>(`/shows/${id}?market=US`);
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        if (!show.episodes) return { tracks: [], name: undefined! };
        const tracks = show.episodes.items.map(item => resolver.buildUnresolved(item));
        let next = show.episodes.next; let page = 1;
        while (next && (!this.plugin.options?.showPageLimit ? true : page < this.plugin.options.showPageLimit)) {
            const nextPage = await this.plugin.resolver.makeRequest<ShowTracks>(next.split("v1")[1]);
            tracks.push(...nextPage.items.map(item => resolver.buildUnresolved(item)));
            next = nextPage.next;
            page++;
        }
        return { tracks, name: show.name };
    }
}

interface ShowCache {
    tracks: UnresolvedSpotifyTrack[];
    name: string;
}
