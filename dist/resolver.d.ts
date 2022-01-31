import { EpisodeManager, PlaylistManager, ShowManager, TrackManager, AlbumManager, ArtistManager } from "./Manager";
import Spotify from "./index";
export default class resolver {
    plugin: Spotify;
    constructor(plugin: Spotify);
    resolveManager: {
        episode: EpisodeManager;
        playlist: PlaylistManager;
        show: ShowManager;
        track: TrackManager;
        album: AlbumManager;
        artist: ArtistManager;
    };
    token: string | undefined;
    BASE_URL: string;
    makeRequest<T>(endpoint: string): Promise<T | null>;
    getToken(): Promise<number>;
    fetchAccessToken(): Promise<number>;
    renew(): Promise<void>;
}
