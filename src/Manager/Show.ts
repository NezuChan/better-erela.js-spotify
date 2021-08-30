import Collection from "@discordjs/collection";
import { getData, getTracks } from "spotify-url-info";
import Spotify from '../index';
import resolver from "../resolver";
import { Show, ShowTracks, UnresolvedSpotifyTrack } from "../typings";
export class ShowManager {
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
                const show = await this.plugin.resolver.makeRequest<Show>(`/shows/${id}?market=US`)
                const tracks = show.episodes.items.filter(x => x != null).map(item => resolver.buildUnresolved(item));
                let next = show.episodes.next, page = 1
                while (next && (!this.plugin.options.showPageLimit ? true : page < this.plugin.options.showPageLimit!)) {
                    const nextPage = await this.plugin.resolver.makeRequest<ShowTracks>(next!.split("v1")[1]);
                    tracks.push(...nextPage.items.filter(x => x != null).map(item => resolver.buildUnresolved(item)));
                    next = nextPage.next;
                    page++
                }
                this.cache.set(id, {
                    tracks,
                    name: show.name
                })

                return { tracks, name: show.name };
            }
            const tracks = await getTracks(url);
            const metaData = await getData(url)
            const unresolvedShowTracks: UnresolvedSpotifyTrack[] = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
            this.cache.set(id, {
                tracks: unresolvedShowTracks,
                name: metaData.name
            })
            return { tracks: unresolvedShowTracks, name: metaData.name }
        }
        if (this.plugin.options?.stragery === "API") {
            const show = await this.plugin.resolver.makeRequest<Show>(`/shows/${id}?market=US`)
        
            const tracks = show.episodes.items.filter(x => x != null).map(item => resolver.buildUnresolved(item));
            let next = show.episodes.next, page = 1
            while (next && !this.plugin.options.showPageLimit ? true : page < this.plugin.options.showPageLimit!) {
                const nextPage = await this.plugin.resolver.makeRequest<ShowTracks>(next!.split("v1")[1]);
                tracks.push(...nextPage.items.filter(x => x != null).map(item => resolver.buildUnresolved(item)));
                next = nextPage.next;
                page++
            }
            return { tracks, name: show.name };
        }

        const tracks = await getTracks(url);
        const metaData = await getData(url)
        const unresolvedShowTracks = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedShowTracks, name: metaData.name }
    }
}

interface ShowCache {
    tracks: UnresolvedSpotifyTrack[],
    name: string
}