import Collection from "@discordjs/collection";
import Spotify from '../index';
import { UnresolvedSpotifyTrack } from "../typings";
export declare class PlaylistManager {
    plugin: Spotify;
    cache: Collection<string, ShowCache>;
    constructor(plugin: Spotify);
    fetch(url: string, id: string): Promise<ShowCache | {
        tracks: {
            title: string;
            author: string;
            duration: number;
            uri: string;
            thumbnail: string;
        }[];
        name: any;
    }>;
}
interface ShowCache {
    tracks: UnresolvedSpotifyTrack[];
    name: string;
}
export {};
