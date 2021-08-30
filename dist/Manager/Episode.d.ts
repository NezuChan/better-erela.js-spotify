import Collection from "@discordjs/collection";
import Spotify from '../index';
import { UnresolvedSpotifyTrack } from "../typings";
export declare class EpisodeManager {
    plugin: Spotify;
    constructor(plugin: Spotify);
    cache: Collection<string, UnresolvedSpotifyTrack[]>;
    fetch(url: string, id: string): Promise<{
        tracks: UnresolvedSpotifyTrack[];
    }>;
}
