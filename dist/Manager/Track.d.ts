import Collection from "@discordjs/collection";
import Spotify from '../index';
import { UnresolvedSpotifyTrack } from "../typings";
export declare class TrackManager {
    plugin: Spotify;
    cache: Collection<string, UnresolvedSpotifyTrack[]>;
    constructor(plugin: Spotify);
    fetch(url: string, id: string): Promise<{
        tracks: UnresolvedSpotifyTrack[];
    }>;
}
