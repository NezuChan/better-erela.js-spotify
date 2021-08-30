import Collection from "@discordjs/collection";
import Spotify from '../index';
import { UnresolvedSpotifyTrack } from "../typings";
export declare class ArtistManager {
    plugin: Spotify;
    cache: Collection<string, ShowCache>;
    constructor(plugin: Spotify);
    fetch(url: string, id: string): Promise<{
        tracks: UnresolvedSpotifyTrack[];
        name: any;
    }>;
}
interface ShowCache {
    tracks: UnresolvedSpotifyTrack[];
    name: string;
}
export {};
