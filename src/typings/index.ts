import {
    UnresolvedTrack,
    UnresolvedQuery,
} from "erela.js";
import { ArtistsEntity } from "spotify-url-info";

export interface SpotifyOptions {
    convertUnresolved?: boolean,
    stragery?: Strategy,
    clientSecret?: string,
    clientId?: string,
    cacheTrack?: boolean,
    showPageLimit?: number,
    playlistPageLimit?: number,
    albumPageLimit?: number,
    maxCacheLifeTime?: number
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
        message: string
    } | null;
    loadType: string;
    playlist?: {
        duration: number;
        name: string
    } | null;
    tracks: UnresolvedTrack[]
}
export interface UnresolvedSpotifyTrack {
    title: string,
    author: string,
    duration: number,
    uri: string,
    thumbnail: string | null
}
export type Strategy = "SCRAPE" | "API";

export interface SpotifyTrack {
    artists: ArtistsEntity[];
    name: string;
    duration_ms: number;
    external_urls: {
        spotify: string;
    };
    album: {
        images: spotifyThumbnail[]
    }
}

export interface spotifyThumbnail {
    height: number,
    url: string,
    width: number
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
    items: SpotifyTrack[]
};

export interface Show {
    name: string,
    episodes: ShowTracks
}

export interface Result {
    tracks: UnresolvedQuery[];
    name?: string;
}
