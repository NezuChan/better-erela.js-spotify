import { SearchResult } from "erela.js";
import { BaseManager } from "./BaseManager";
import { SpotifyEpisode } from "./Episode";
export declare class ShowManager extends BaseManager {
    fetch(id: string, requester: unknown): Promise<SearchResult>;
}
export interface spotifyShow {
    id: string;
    name: string;
    episodes?: {
        items: SpotifyEpisode[];
        next: string | null;
    };
}
