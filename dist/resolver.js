"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spotify_url_info_1 = require("spotify-url-info");
class resolver {
    async getTrack(id) {
        const tracks = await spotify_url_info_1.getTracks(id);
        const unresolvedTrack = tracks.map(track => resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedTrack };
    }
    async getPlaylist(id) {
        const tracks = await spotify_url_info_1.getTracks(id);
        const metaData = await spotify_url_info_1.getData(id);
        //@ts-expect-error no typings
        if (typeof tracks[0].track === "object") {
            //@ts-expect-error no typings
            const unresolvedPlaylistTracks = tracks.filter(x => x.track).map(track => resolver.buildUnresolved(track.track)) ?? [];
            return { tracks: unresolvedPlaylistTracks, name: metaData.name };
        }
        else {
            const unresolvedPlaylistTracks = tracks.map(track => resolver.buildUnresolved(track)) ?? [];
            return { tracks: unresolvedPlaylistTracks, name: metaData.name };
        }
    }
    async getAlbum(id) {
        const tracks = await spotify_url_info_1.getTracks(id);
        const metaData = await spotify_url_info_1.getData(id);
        const unresolvedAlbumTracks = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name };
    }
    async getArtist(id) {
        const tracks = await spotify_url_info_1.getTracks(id);
        const metaData = await spotify_url_info_1.getData(id);
        const unresolvedAlbumTracks = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name };
    }
    async getShow(id) {
        const tracks = await spotify_url_info_1.getTracks(id);
        const metaData = await spotify_url_info_1.getData(id);
        const unresolvedAlbumTracks = tracks.map(track => track && resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedAlbumTracks, name: metaData.name };
    }
    async getEpisode(id) {
        const tracks = await spotify_url_info_1.getTracks(id);
        const unresolvedTrack = tracks.map(track => resolver.buildUnresolved(track)) ?? [];
        return { tracks: unresolvedTrack };
    }
    static buildUnresolved(track) {
        if (!track)
            throw new ReferenceError("The Spotify track object was not provided");
        if (!track.artists)
            throw new ReferenceError("The track artists array was not provided");
        if (!track.name)
            throw new ReferenceError("The track name was not provided");
        if (!Array.isArray(track.artists))
            throw new TypeError(`The track artists must be an array, received type ${typeof track.artists}`);
        if (typeof track.name !== "string")
            throw new TypeError(`The track name must be a string, received type ${typeof track.name}`);
        return {
            title: track.name,
            author: track.artists?.map(x => x.name).join(" "),
            duration: track.duration_ms
        };
    }
    static buildSearch(loadType, tracks, error, name) {
        return {
            loadType: loadType,
            tracks: tracks ?? [],
            playlist: name ? {
                name,
                duration: tracks?.reduce((acc, cur) => acc + (cur.duration || 0), 0)
            } : null,
            exception: error ? {
                message: error,
                severity: "COMMON",
            } : null
        };
    }
}
exports.default = resolver;
//# sourceMappingURL=resolver.js.map