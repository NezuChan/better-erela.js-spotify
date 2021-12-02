import Spotify from "../index";
import resolver from "../resolver";
import { SpotifyTrack, UnresolvedSpotifyTrack } from "../typings";
export class EpisodeManager {
    public cache: Map<string, UnresolvedSpotifyTrack[]> = new Map();
    public constructor(public plugin: Spotify) {
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear();
            }, plugin.options.maxCacheLifeTime);
        }
    }

    public async fetch(id: string): Promise<{ tracks: UnresolvedSpotifyTrack[] }> {
        if (this.plugin.options?.cacheTrack) {
            if (this.cache.has(id)) return { tracks: this.cache.get(id)! };
            const data = await this.plugin.resolver.makeRequest<SpotifyTrack>(`/episodes/${id}?market=US`);
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            if (!data) return { tracks: [] };
            const track = resolver.buildUnresolved(data);
            this.cache.set(id, [track]);
            return { tracks: [track] };
        }
        const data = await this.plugin.resolver.makeRequest<SpotifyTrack>(`/episodes/${id}?market=US`);
        /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
        if (!data) return { tracks: [] };
        const track = resolver.buildUnresolved(data);
        return { tracks: [track] };
    }
}
