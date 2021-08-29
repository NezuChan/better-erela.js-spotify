import Collection from "@discordjs/collection";
import { getData, getTracks } from "spotify-url-info";
import Spotify from '../index';
import resolver from "../resolver";
import { Playlist, PlaylistTracks, UnresolvedSpotifyTrack } from "../typings";
export class PlaylistManager {
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
                const playlist = await this.plugin.resolver.makeRequest<Playlist>(`/playlists/${id}`);
                const tracks = playlist.tracks.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver.buildUnresolved(item.track));
                let next = playlist.tracks.next, page = 1;

                while (next && (!this.plugin.options.playlistPageLimit ? true : page < this.plugin.options.playlistPageLimit!)) {
                    const nextPage = await this.plugin.resolver.makeRequest<PlaylistTracks>(next!.split("v1")[1]);
                    tracks.push(...nextPage.items.filter(this.plugin.resolver.filterNullOrUndefined).map(item => resolver.buildUnresolved(item.track)));
                    next = nextPage.next;
                    page++;
                }
                this.cache.set(id, {
                    tracks,
                    name: playlist.name
                })

                return { tracks, name: playlist.name };
            }
            const tracks = await getTracks(url);
            const metaData = await getData(url)
            //@ts-expect-error no typings
            if (typeof tracks[0].track === "object") {
                //@ts-expect-error no typings
                const unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => resolver.buildUnresolved(track.track)) ?? [];
                this.cache.set(id, {
                    tracks: unresolvedPlaylistTracks,
                    name: metaData.name
                })
                return { tracks: unresolvedPlaylistTracks, name: metaData.name }
            } else {
                const unresolvedPlaylistTracks = tracks.map(track => resolver.buildUnresolved(track)) ?? [];
                this.cache.set(id, {
                    tracks: unresolvedPlaylistTracks,
                    name: metaData.name
                })
                return { tracks: unresolvedPlaylistTracks, name: metaData.name }
            }
        }

        const tracks = await getTracks(url);
        const metaData = await getData(url)
        //@ts-expect-error no typings
        if (typeof tracks[0].track === "object") {
            //@ts-expect-error no typings
            const unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => resolver.buildUnresolved(track.track)) ?? [];
            return { tracks: unresolvedPlaylistTracks, name: metaData.name }
        } else {
            const unresolvedPlaylistTracks = tracks.map(track => resolver.buildUnresolved(track)) ?? [];
            return { tracks: unresolvedPlaylistTracks, name: metaData.name }
        }
    }
}

interface ShowCache {
    tracks: UnresolvedSpotifyTrack[],
    name: string
}