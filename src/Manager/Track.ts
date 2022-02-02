import { SearchResult, TrackUtils } from "erela.js";
import { SpotifyTrack } from "../typings";
import { BaseManager } from "./BaseManager";
export class TrackManager extends BaseManager {
    public async fetch(id: string, requester: unknown): Promise<SearchResult> {
        await this.checkFromCache(id, requester)!;
        const track = await this.resolver.makeRequest<SpotifyTrack>(`/tracks/${id}`);
        if (track) {
            if (this.resolver.plugin.options.cacheTrack) this.cache.set(id, { tracks: [track] });
            return this.buildSearch("TRACK_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack([TrackUtils.buildUnresolved(this.buildUnresolved(track), requester)]) : [TrackUtils.buildUnresolved(this.buildUnresolved(track), requester)], undefined, track.name);
        } return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}
