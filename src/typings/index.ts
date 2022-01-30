import {
    UnresolvedTrack,
    UnresolvedQuery
} from "erela.js";

export interface ExternalUrls {
    spotify: string;
}

export interface ISpotifyAccessTokenAPIScrapeResult {
    clientId: string;
    accessToken?: string;
    accessTokenExpirationTimestampMs: number;
    isAnonymous: boolean;
}

export interface ISpotifyAccessTokenAPIResult {
    access_token?: string;
    expires_in: number;
}

export interface ArtistsEntity {
    external_urls: ExternalUrls;
    href: string;
    id: string;
    name: string;
    type: string;
    uri: string;
}

export interface SpotifyOptions {
    /** @deprecated Please use `clientId` instead, **this is backward compability for erela.js-spotify user.** */
    clientID?: string;
    /** @default false */
    convertUnresolved?: boolean;
    /** @default SCRAPE */
    strategy?: Strategy;
    clientSecret?: string;
    clientId?: string;
    /** @default true */
    cacheTrack?: boolean;
    /** @default 10 */
    showPageLimit?: number;
    /** @default 10 */
    playlistPageLimit?: number;
    /** @default 10 */
    albumPageLimit?: number;
    /** @default 360000 */
    maxCacheLifeTime?: number;
    /** @default US */
    countryMarket?: string;
}

export interface Playlist {
    tracks: PlaylistTracks;
    name: string;
}


export interface Artist {
    name: string;
}

export interface ArtistTrack {
    tracks: SpotifyTrack[];
}

export interface PlaylistTracks {
    items: [
        {
            track: SpotifyTrack;
        }
    ];
    next: string | null;
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
export interface UnresolvedSpotifyTrack {
    title: string;
    author: string;
    duration: number;
    uri: string;
    thumbnail: string | null;
}
export type Strategy = "API" | "SCRAPE";

export interface SpotifyTrack {
    artists: ArtistsEntity[];
    name: string;
    duration_ms: number;
    external_urls: {
        spotify: string;
    };
    images?: spotifyThumbnail[];
    album?: {
        images: spotifyThumbnail[];
    };
    type: "track";
}

export interface spotifyThumbnail {
    height: number;
    url: string;
    width: number;
}
export interface Album {
    name: string;
    tracks: AlbumTracks;
}

export interface AlbumTracks {
    items: SpotifyTrack[];
    next: string | null;
}

export interface ShowTracks {
    next: string | null;
    items: SpotifyTrack[];
}

export interface Show {
    name: string;
    episodes: ShowTracks;
}

export interface Result {
    tracks: UnresolvedQuery[];
    name?: string;
}
