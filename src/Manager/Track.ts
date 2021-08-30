import Collection from "@discordjs/collection";
import { getTracks } from "spotify-url-info";
import Spotify from '../index';
import resolver from "../resolver";
import { SpotifyTrack, UnresolvedSpotifyTrack } from "../typings";
export class TrackManager {
    public cache: Collection<string, UnresolvedSpotifyTrack[]> = new Collection();
    public constructor(public plugin: Spotify) {
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear()
            }, plugin.options?.maxCacheLifeTime)
        }
    }
    public async fetch(url: string, id: string) {
        if (this.plugin.options?.cacheTrack) {
            if (this.cache.has(id)) return { tracks: this.cache.get(id)! };
            if (this.plugin.options.stragery === "API") {
                const data = await this.plugin.resolver.makeRequest<SpotifyTrack>(`/tracks/${id}`);
                const track = resolver.buildUnresolved(data);
                this.cache.set(id, [track])
                return { tracks: [track] };
            }
            const tracks = await getTracks(url);
            const unresolvedTrack: UnresolvedSpotifyTrack[] = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
            this.cache.set(id, unresolvedTrack)
            return { tracks: unresolvedTrack! }
        }
        
        if (this.plugin.options?.stragery === "API") {
            const data = await this.plugin.resolver.makeRequest<SpotifyTrack>(`${this.plugin.resolver.BASE_URL}/tracks/${id}`);
            const track = resolver.buildUnresolved(data);
            return { tracks: [track] };
        }
        const tracks = await getTracks(url);
        const unresolvedTrack = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedTrack }
    }
}