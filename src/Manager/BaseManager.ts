import { LoadType, SearchResult, Track, TrackUtils, UnresolvedTrack } from "erela.js";
import resolver from "../resolver";
import { SpotifyTrack } from "../typings";
import { SpotifyEpisode } from "./Episode";

export abstract class BaseManager {
    public cache: Map<string, { tracks: (SpotifyEpisode | SpotifyTrack)[]; name?: string }> = new Map();

    public constructor(public resolver: resolver) { }

    public abstract fetch(id: string, requester: unknown): Promise<SearchResult>;

    public async checkFromCache(id: string, requester: unknown): Promise<SearchResult | undefined> {
        if (this.cache.has(id) && this.resolver.plugin.options.cacheTrack) {
            const track = this.cache.get(id)!;
            return this.buildSearch(track.name ? "PLAYLIST_LOADED" : "TRACK_LOADED", this.resolver.plugin.options.convertUnresolved ? await this.autoResolveTrack(track.tracks.map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item), requester))) : track.tracks.map(item => TrackUtils.buildUnresolved(this.buildUnresolved(item), requester)), undefined, track.name);
        }
    }

    public buildSearch(loadType: LoadType, tracks: UnresolvedTrack[] | undefined, error: string | undefined, name: string | undefined): SearchResult {
        return {
            loadType,
            tracks: tracks as Track[] ?? [],
            playlist: name ? { name, duration: tracks?.reduce((acc, cur) => acc + (cur.duration || 0), 0) ?? 0 } : undefined,
            exception: error ? { message: error, severity: "COMMON" } : undefined
        };
    }

    public async autoResolveTrack(tracks: UnresolvedTrack[]): Promise<UnresolvedTrack[]> {
        const resolvedTracks = await Promise.all(tracks.map(async track => {
            try {
                await track.resolve();
            } catch (_e) {
                return null;
            }
            return track;
        }).filter(track => Boolean(track)));
        return resolvedTracks.filter(track => track !== null) as UnresolvedTrack[];
    }

    public buildUnresolved(track: SpotifyEpisode | SpotifyTrack): Omit<UnresolvedTrack, "resolve"> {
        if (track.type === "episode" && track.images) {
            return {
                title: track.name,
                duration: track.duration_ms,
                thumbnail: track.images[0].url,
                uri: track.external_urls.spotify,
                author: " "
            };
        } return {
            title: track.name,
            duration: track.duration_ms,
            thumbnail: (track as SpotifyTrack).album?.images[0] ? (track as SpotifyTrack).album?.images[0].url : null,
            uri: track.external_urls.spotify,
            author: Array.isArray((track as SpotifyTrack).artists) ? (track as SpotifyTrack).artists.map(artist => artist.name).join(", ") : " "
        };
    }
}
