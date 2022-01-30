/// <reference types="erela.js" />
import { BaseManager } from "./BaseManager";
export declare class EpisodeManager extends BaseManager {
    fetch(id: string, requester: unknown): Promise<import("erela.js").SearchResult>;
}
export interface SpotifyEpisode {
    id: string;
    name: string;
    external_urls: {
        spotify: string;
    };
    duration_ms: number;
    images?: {
        url: string;
    }[];
    type: "episode";
}
