import { UnresolvedTrack, LoadType } from "erela.js";
import { Tracks } from "spotify-url-info";
import { SearchResult } from "./typings";
export default class resolver {
    getTrack(id: string): Promise<{
        tracks: {
            title: string;
            author: string;
            duration: number;
        }[];
    }>;
    getPlaylist(id: string): Promise<{
        tracks: {
            title: string;
            author: string;
            duration: number;
        }[];
        name: any;
    }>;
    getAlbum(id: string): Promise<{
        tracks: {
            title: string;
            author: string;
            duration: number;
        }[];
        name: any;
    }>;
    getArtist(id: string): Promise<{
        tracks: {
            title: string;
            author: string;
            duration: number;
        }[];
        name: any;
    }>;
    getShow(id: string): Promise<{
        tracks: {
            title: string;
            author: string;
            duration: number;
        }[];
        name: any;
    }>;
    getEpisode(id: string): Promise<{
        tracks: {
            title: string;
            author: string;
            duration: number;
        }[];
    }>;
    static buildUnresolved(track: Tracks): {
        title: string;
        author: string;
        duration: number;
    };
    static buildSearch(loadType: LoadType, tracks: UnresolvedTrack[], error: string, name: string): SearchResult;
}
