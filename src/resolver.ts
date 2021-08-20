import { UnresolvedTrack, LoadType } from "erela.js";
import { getData, getTracks, Tracks } from "spotify-url-info";
import { SearchResult } from "./typings";

export default class resolver {
    public async getTrack(id: string) {
        const tracks = await getTracks(id);
        const unresolvedTrack = tracks.map(track => resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedTrack }
    }

    public async getPlaylist(id: string) {
        const tracks = await getTracks(id);
        const metaData = await getData(id)
        //@ts-expect-error no typings
        const unresolvedPlaylistTracks = tracks.map(track => track.track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedPlaylistTracks, name: metaData.name }
    }

    public async getAlbum(id: string) {
        const tracks = await getTracks(id);
        const metaData = await getData(id)
        const unresolvedAlbumTracks = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name }
    }

    public async getArtist(id: string) {
        const tracks = await getTracks(id);
        const metaData = await getData(id)
        const unresolvedAlbumTracks = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name }
    }

    public async getShow(id: string) {
        const tracks = await getTracks(id);
        const metaData = await getData(id)
        const unresolvedAlbumTracks = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name }
    }

    public async getEpisode(id: string) {
        const tracks = await getTracks(id);
        const unresolvedTrack = tracks.map(track => resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedTrack }
    }
    public static buildUnresolved(track: Tracks) { 
        if (!track) throw new ReferenceError("The Spotify track object was not provided");
        if (!track.artists) throw new ReferenceError("The track artists array was not provided");
        if (!track.name) throw new ReferenceError("The track name was not provided");
        if (!Array.isArray(track.artists)) throw new TypeError(`The track artists must be an array, received type ${typeof track.artists}`);
        if (typeof track.name !== "string") throw new TypeError(`The track name must be a string, received type ${typeof track.name}`);
        return {
            title: track.name,
            author: track.artists?.map(x => x.name).join(" "),
            duration: track.duration_ms
        }
    }

    public static buildSearch(loadType: LoadType, tracks: UnresolvedTrack[], error: string, name: string): SearchResult  {
        return {
            loadType: loadType,
            tracks: tracks ?? [],
            playlist: name ? {
                name,
                duration: tracks?.reduce((acc: number, cur: UnresolvedTrack) => acc + (cur.duration || 0), 0, )
            } : null,
            exception: error ? {
                message: error,
                severity: "COMMON",
            } : null
        }
    }
}