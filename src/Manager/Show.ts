import { SearchResult, TrackUtils } from "erela.js";
import { SpotifyTrack } from "../typings";
import { BaseManager } from "./BaseManager";
import { SpotifyEpisode } from "./Episode";

export class ShowManager extends BaseManager {
    public async fetch(id: string, requester: unknown): Promise<SearchResult> {
        await this.checkFromCache(id, requester)!;
        const show = await this.resolver.makeRequest<spotifyShow>(`/shows/${id}?market=${this.resolver.plugin.options.countryMarket}`);
        if (show && show.episodes) {
            let page = 1;
            while (show.episodes.next && (!this.resolver.plugin.options.showPageLimit ? true : page < this.resolver.plugin.options.showPageLimit)) {
                const episodes = await this.resolver.makeRequest<spotifyShow["episodes"]>(show.episodes.next);
                page++;
                if (episodes && episodes.items) {
                    show.episodes.next = episodes.next;
                    show.episodes.items.push(...episodes.items);
                } else { show.episodes.next = null; }
            }
            if (this.resolver.plugin.options.cacheTrack) this.cache.set(id, { tracks: show.episodes.items, name: show.name });
            return this.buildSearch("PLAYLIST_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack(show.episodes.items.map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item as unknown as SpotifyTrack), requester))) : show.episodes.items.map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item as unknown as SpotifyTrack), requester)), undefined, show.name);
        } return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}

export interface spotifyShow {
    id: string;
    name: string;
    episodes?: {
        items: SpotifyEpisode[];
        next: string | null;
    };
}
