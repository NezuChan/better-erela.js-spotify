import { UnresolvedTrack, LoadType, ModifyRequest } from "erela.js";
import { SearchResult, SpotifyTrack } from "./typings";
import { EpisodeManager, PlaylistManager, ShowManager, TrackManager, AlbumManager, ArtistManager } from "./Manager";
import Spotify from "./index";
export default class resolver {
    plugin: Spotify;
    constructor(plugin: Spotify);
    getTrack: TrackManager;
    getPlaylist: PlaylistManager;
    getAlbum: AlbumManager;
    getArtist: ArtistManager;
    getShow: ShowManager;
    getEpisode: EpisodeManager;
    token: string;
    BASE_URL: string;
    static buildUnresolved(track: SpotifyTrack | undefined): {
        title: string;
        author: string;
        duration: number;
        uri: string;
        thumbnail: string | null;
    };
    static buildSearch(loadType: LoadType, tracks: UnresolvedTrack[] | undefined, error: string, name: string | undefined): SearchResult;
    makeRequest<T>(endpoint: string, modify?: ModifyRequest): Promise<T>;
    renewToken(): Promise<number>;
    getSelfToken(): Promise<number>;
    renew(): Promise<void>;
}
