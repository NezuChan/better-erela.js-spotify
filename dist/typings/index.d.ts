import { UnresolvedTrack, UnresolvedQuery } from "erela.js";
export interface SpotifyOptions {
    convertUnresolved?: boolean;
}
export interface SearchResult {
    exception?: {
        severity: string;
        message: string;
    } | null;
    loadType: string;
    playlist?: {
        duration: number;
        name: string;
    } | null;
    tracks: UnresolvedTrack[];
}
export interface Result {
    tracks: UnresolvedQuery[];
    name?: string;
}
