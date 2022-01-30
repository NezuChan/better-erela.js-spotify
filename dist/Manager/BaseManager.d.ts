import { LoadType, SearchResult, UnresolvedTrack } from "erela.js";
import resolver from "../resolver";
import { SpotifyTrack } from "../typings";
import { SpotifyEpisode } from "./Episode";
export declare abstract class BaseManager {
    resolver: resolver;
    cache: Map<string, {
        tracks: (SpotifyTrack | SpotifyEpisode)[];
        name?: string;
    }>;
    constructor(resolver: resolver);
    abstract fetch(id: string, requester: unknown): Promise<SearchResult>;
    checkFromCache(id: string, requester: unknown): SearchResult | undefined;
    buildSearch(loadType: LoadType, tracks: UnresolvedTrack[] | undefined, error: string | undefined, name: string | undefined): SearchResult;
    autoResolveTrack(tracks: UnresolvedTrack[]): Promise<UnresolvedTrack[]>;
    buildUnresolved(track: SpotifyTrack | SpotifyEpisode): Omit<UnresolvedTrack, "resolve">;
}
