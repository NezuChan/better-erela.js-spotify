/// <reference types="erela.js" />
import { SpotifyTrack } from "../typings";
import { BaseManager } from "./BaseManager";
export declare class AlbumManager extends BaseManager {
    fetch(id: string, requester: unknown): Promise<import("erela.js").SearchResult>;
}
export interface SpotifyAlbum {
    id: string;
    name: string;
    tracks?: {
        items: SpotifyTrack[];
        next: string | null;
    };
}
