import Collection from "@discordjs/collection";
import Spotify from '../index';
import { UnresolvedSpotifyTrack } from "../typings";
export declare class AlbumManager {
    plugin: Spotify;
    cache: Collection<string, AlbumCache>;
    constructor(plugin: Spotify);
    fetch(url: string, id: string): Promise<AlbumCache | {
        tracks: UnresolvedSpotifyTrack[];
        name: any;
    }>;
}
interface AlbumCache {
    tracks: UnresolvedSpotifyTrack[];
    title: string;
}
export {};
