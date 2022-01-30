import { SearchResult } from "erela.js";
import { SpotifyTrack } from "../typings";
import { BaseManager } from "./BaseManager";
export declare class PlaylistManager extends BaseManager {
    fetch(id: string, requester: unknown): Promise<SearchResult>;
}
export interface spotifyPlaylist {
    id: string;
    name: string;
    tracks: {
        items: {
            track: SpotifyTrack | null;
        }[];
        next: string | null;
    };
}
