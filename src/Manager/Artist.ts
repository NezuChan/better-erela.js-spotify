import Spotify from "../index";
import resolver from "../resolver";
import { Artist, ArtistTrack, UnresolvedSpotifyTrack } from "../typings";
export class ArtistManager {
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
            const metaData = await this.plugin.resolver.makeRequest<Artist>(`/artists/${id}?market=US`);
            const playlist = await this.plugin.resolver.makeRequest<ArtistTrack>(`/artists/${id}/top-tracks?country=US`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!playlist.tracks) return { tracks: [], name: undefined! };
            const tracks = playlist.tracks.map(item => resolver.buildUnresolved(item));
            this.cache.set(id, { tracks, name: `${metaData.name} Top Tracks` });
            return { tracks, name: `${metaData.name} Top Tracks` };
        }
        const metaData = await this.plugin.resolver.makeRequest<Artist>(`/artists/${id}?market=US`);
        const playlist = await this.plugin.resolver.makeRequest<ArtistTrack>(`/artists/${id}/top-tracks?country=US`);
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        if (!playlist.tracks) return { tracks: [], name: undefined! };
        const tracks = playlist.tracks.map(item => resolver.buildUnresolved(item));
        return { tracks, name: `${metaData.name} Top Tracks` };
    }
}

interface ShowCache {
    tracks: UnresolvedSpotifyTrack[];
    name: string;
}
