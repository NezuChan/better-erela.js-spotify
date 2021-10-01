import { UnresolvedTrack, LoadType, ModifyRequest } from "erela.js";
import { Tracks } from "spotify-url-info";
import { SearchResult, SpotifyTrack } from "./typings";
import { EpisodeManager, PlaylistManager, ShowManager, TrackManager, AlbumManager, ArtistManager } from './Manager';
import Spotify from './index';
export default class resolver {
    plugin: Spotify;
    constructor(plugin: Spotify);
    getTrack: TrackManager;
    getPlaylist: PlaylistManager;
    getAlbum: AlbumManager;
    getArtist: ArtistManager;
    getShow: ShowManager;
    getEpisode: EpisodeManager;
    private nextRequest?;
    token: string;
    BASE_URL: string;
    static buildUnresolved(track: Tracks | SpotifyTrack): {
        title: string;
        author: string;
        duration: number;
        uri: string;
        thumbnail: string;
    };
    static buildSearch(loadType: LoadType, tracks: UnresolvedTrack[], error: string, name: string): SearchResult;
    makeRequest<T>(endpoint: string, modify?: ModifyRequest): Promise<T>;
    renewToken(): Promise<number>;
    renew(): Promise<void>;
}
