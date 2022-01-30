import { SearchResult, TrackUtils } from "erela.js";
import { SpotifyTrack } from "../typings";
import { BaseManager } from "./BaseManager";
export class TrackManager extends BaseManager {
    public async fetch(id: string, requester: unknown): Promise<SearchResult> {
        this.checkFromCache(id, requester)!;
        const track = await this.resolver.makeRequest<SpotifyTrack>(`/tracks/${id}?market=${this.resolver.plugin.options.countryMarket}`);
        if (track) {
            this.cache.set(id, { tracks: [track] });
            return this.buildSearch("TRACK_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack([TrackUtils.buildUnresolved(this.buildUnresolved(track), requester)]) : [TrackUtils.buildUnresolved(this.buildUnresolved(track), requester)], undefined, track.name);
        } return this.buildSearch("NO_MATCHES", undefined, "TRACK_NOT_FOUND", undefined);
    }
}
