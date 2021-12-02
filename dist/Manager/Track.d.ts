import Spotify from "../index";
import { UnresolvedSpotifyTrack } from "../typings";
export declare class TrackManager {
    plugin: Spotify;
    cache: Map<string, UnresolvedSpotifyTrack[]>;
    constructor(plugin: Spotify);
    fetch(id: string): Promise<{
        tracks: UnresolvedSpotifyTrack[];
    }>;
}
