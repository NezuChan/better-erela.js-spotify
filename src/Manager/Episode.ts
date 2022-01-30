import { SearchResult, TrackUtils } from "erela.js";
import { BaseManager } from "./BaseManager";

export class EpisodeManager extends BaseManager {
    public async fetch(id: string, requester: unknown): Promise<SearchResult> {
        this.checkFromCache(id, requester)!;
        const episode = await this.resolver.makeRequest<SpotifyEpisode>(`/episode/${id}?market=${this.resolver.plugin.options.countryMarket}`);
        if (episode) {
            this.cache.set(id, { tracks: [episode] });
            return this.buildSearch("TRACK_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack([TrackUtils.buildUnresolved(this.buildUnresolved(episode), requester)]) : [TrackUtils.buildUnresolved(this.buildUnresolved(episode), requester)], undefined, episode.name);
        } return this.buildSearch("NO_MATCHES", undefined, "TRACK_NOT_FOUND", undefined);
    }
}

export interface SpotifyEpisode {
    id: string;
    name: string;
    external_urls: {
        spotify: string;
    };
    duration_ms: number;
    images?: { url: string }[];
    type: "episode";
}
