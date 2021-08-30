import Collection from "@discordjs/collection";
import { getData, getTracks } from "spotify-url-info";
import Spotify from '../index';
import resolver from "../resolver";
import { Artist, ArtistTrack, UnresolvedSpotifyTrack } from "../typings";
export class ArtistManager {
    public cache: Collection<string, ShowCache> = new Collection();
    public constructor(public plugin: Spotify) {
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear()
            }, plugin.options?.maxCacheLifeTime)
        }
    }
    public async fetch(url: string, id: string) {
        if (this.plugin.options?.cacheTrack) {
            if (this.cache.has(id)) return this.cache.get(id)!;
            if (this.plugin.options.stragery === "API") {
                const metaData = await this.plugin.resolver.makeRequest<Artist>(`/artists/${id}?market=US`);
                const playlist = await this.plugin.resolver.makeRequest<ArtistTrack>(`/artists/${id}/top-tracks?country=US`);
                const tracks = playlist.tracks.filter(x => x != null).map(item => resolver.buildUnresolved(item));
                this.cache.set(id, {
                    tracks,
                    name: metaData.name
                })
                return { tracks, name: metaData.name };
            }
            const tracks = await getTracks(url);
            const metaData = await getData(url)
            const unresolvedAlbumTracks: UnresolvedSpotifyTrack[] = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
            this.cache.set(id, {
                tracks: unresolvedAlbumTracks,
                name: metaData.name
            })
            return { tracks: unresolvedAlbumTracks, name: metaData.name }
        }
        if (this.plugin.options?.stragery === "API") {
            const metaData = await this.plugin.resolver.makeRequest<Artist>(`/artists/${id}?market=US`);
            const playlist = await this.plugin.resolver.makeRequest<ArtistTrack>(`/artists/${id}/top-tracks?country=US`);
            const tracks = playlist.tracks.filter(x => x != null).map(item => resolver.buildUnresolved(item));
            return { tracks, name: metaData.name };
        }
        const tracks = await getTracks(url);
        const metaData = await getData(url)
        const unresolvedAlbumTracks = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name }
    }
}

interface ShowCache {
    tracks: UnresolvedSpotifyTrack[],
    name: string
}