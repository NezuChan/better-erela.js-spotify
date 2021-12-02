import Spotify from "../index";
import { UnresolvedSpotifyTrack } from "../typings";
export declare class ShowManager {
    plugin: Spotify;
    cache: Map<string, ShowCache>;
    constructor(plugin: Spotify);
    fetch(id: string): Promise<ShowCache>;
}
interface ShowCache {
    tracks: UnresolvedSpotifyTrack[];
    name: string;
}
export {};
