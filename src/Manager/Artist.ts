import { SearchResult, TrackUtils } from "erela.js";
import { SpotifyTrack } from "../typings";
import { BaseManager } from "./BaseManager";

export class ArtistManager extends BaseManager {
    public async fetch(id: string, requester: unknown): Promise<SearchResult> {
        await this.checkFromCache(id, requester)!;
        const artistTracks = await this.resolver.makeRequest<SpotifyArtistTracks>(`/artists/${id}/top-tracks?market=${this.resolver.plugin.options.countryMarket}`);
        const artistInfo = await this.resolver.makeRequest<SpotifyArtist>(`/artists/${id}`);
        if (artistInfo && artistTracks) {
            if (this.resolver.plugin.options.cacheTrack) this.cache.set(id, { tracks: artistTracks.tracks, name: artistInfo.name });
            return this.buildSearch("PLAYLIST_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack(artistTracks.tracks.map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item), requester))) : artistTracks.tracks.map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item), requester)), undefined, artistInfo.name);
        } return this.buildSearch("NO_MATCHES", undefined, "Could not find any suitable track(s), unexpected spotify response", undefined);
    }
}
export interface SpotifyArtistTracks {
    tracks: SpotifyTrack[];
}

export interface SpotifyArtist {
    id: string;
    name: string;
}
