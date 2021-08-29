import Collection from "@discordjs/collection";
import { getData, getTracks } from "spotify-url-info";
import Spotify from '../index';
import resolver from "../resolver";
import { Album, AlbumTracks, UnresolvedSpotifyTrack } from "../typings";
export class AlbumManager {
    public cache: Collection<string, AlbumCache> = new Collection();
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
                const album = await this.plugin.resolver.makeRequest<Album>(`/albums/${id}`)
                const tracks = album.tracks.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver.buildUnresolved(item));
                let next = album.tracks.next, page = 1;

                while (next && (!this.plugin.options.albumPageLimit ? true : page < this.plugin.options.albumPageLimit!)) {
                    const nextPage = await this.plugin.resolver.makeRequest<AlbumTracks>(next!.split("v1")[1]);
                    tracks.push(...nextPage.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver.buildUnresolved(item)));
                    next = nextPage.next;
                    page++;
                }
                this.cache.set(id, {
                    tracks,
                    name: album.name
                })
                return { tracks, name: album.name };
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
            const album = await this.plugin.resolver.makeRequest<Album>(`/albums/${id}`)
            const tracks = album.tracks.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver.buildUnresolved(item));
            let next = album.tracks.next, page = 1;

            while (next && (!this.plugin.options?.albumPageLimit ? true : page < this.plugin.options.albumPageLimit!)) {
                const nextPage = await this.plugin.resolver.makeRequest<AlbumTracks>(next!.split("v1")[1]);
                tracks.push(...nextPage.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver.buildUnresolved(item)));
                next = nextPage.next;
                page++;
            }
            return { tracks, name: album.name };
        }
        const tracks = await getTracks(url);
        const metaData = await getData(url)
        const unresolvedAlbumTracks = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name }
    }
}

interface AlbumCache {
    tracks: UnresolvedSpotifyTrack[],
    name: string
}