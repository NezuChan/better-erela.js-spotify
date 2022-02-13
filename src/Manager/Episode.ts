import { SearchResult, TrackUtils } from "erela.js";
import { BaseManager } from "./BaseManager";

export class EpisodeManager extends BaseManager {
    public async fetch(id: string, requester: unknown): Promise<SearchResult> {
        await this.checkFromCache(id, requester)!;
        const episode = await this.resolver.makeRequest<SpotifyEpisode>(`/episodes/${id}?market=${this.resolver.plugin.options.countryMarket}`);
        if (episode && !episode.error) {
            if (this.resolver.plugin.options.cacheTrack) this.cache.set(id, { tracks: [episode] });
            return this.buildSearch("TRACK_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack([TrackUtils.buildUnresolved(this.buildUnresolved(episode), requester)]) : [TrackUtils.buildUnresolved(this.buildUnresolved(episode), requester)], undefined, episode.name);
        } return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}

export interface SpotifyEpisode {
    error?: { message: string };
    id: string;
    name: string;
    external_urls: {
        spotify: string;
    };
    duration_ms: number;
    images?: { url: string }[];
    type: "episode";
}
