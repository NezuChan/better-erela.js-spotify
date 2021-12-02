import Spotify from "../index";
import { UnresolvedSpotifyTrack } from "../typings";
export declare class AlbumManager {
    plugin: Spotify;
    cache: Map<string, AlbumCache>;
    constructor(plugin: Spotify);
    fetch(id: string): Promise<AlbumCache>;
}
interface AlbumCache {
    tracks: UnresolvedSpotifyTrack[];
    name: string;
}
export {};
