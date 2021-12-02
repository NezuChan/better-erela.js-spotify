import Spotify from "../index";
import { UnresolvedSpotifyTrack } from "../typings";
export declare class PlaylistManager {
    plugin: Spotify;
    cache: Map<string, PlaylistCache>;
    constructor(plugin: Spotify);
    fetch(id: string): Promise<PlaylistCache>;
}
interface PlaylistCache {
    tracks: UnresolvedSpotifyTrack[];
    name: string;
}
export {};
