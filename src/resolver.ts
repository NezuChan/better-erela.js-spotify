import { UnresolvedTrack, LoadType, ModifyRequest, LavalinkResult, TrackUtils } from "erela.js";
import { Tracks } from "spotify-url-info";
import { SearchResult, SpotifyTrack } from "./typings";
import { EpisodeManager, PlaylistManager, ShowManager, TrackManager, AlbumManager, ArtistManager } from './Manager';
import Spotify from './index';
import fetch from 'petitio';

export default class resolver {
    constructor(public plugin: Spotify) {
    }
    public getTrack = new TrackManager(this.plugin);
    public getPlaylist = new PlaylistManager(this.plugin);
    public getAlbum = new AlbumManager(this.plugin);
    public getArtist = new ArtistManager(this.plugin);
    public getShow = new ShowManager(this.plugin);
    public getEpisode = new EpisodeManager(this.plugin);
    private nextRequest?: NodeJS.Timeout;
    public token!: string;
    public BASE_URL = "https://api.spotify.com/v1";
    public static buildUnresolved(track: Tracks | SpotifyTrack) {
        if (!track) throw new ReferenceError("The Spotify track object was not provided");
        if (!track.name) throw new ReferenceError("The track name was not provided");
        if (typeof track.name !== "string") throw new TypeError(`The track name must be a string, received type ${typeof track.name}`);
        return {
            title: track?.name,
            author: Array.isArray(track.artists) ? track.artists.map((x) => x.name).join(" ") : '',
            duration: track.duration_ms,
            uri: track.external_urls.spotify,
            thumbnail: (track as SpotifyTrack)?.images ? (track as SpotifyTrack)?.images[0]?.url ?? null : (track as SpotifyTrack).album?.images[0]?.url ?? null
        }
    }
    public static buildSearch(loadType: LoadType, tracks: UnresolvedTrack[], error: string, name: string): SearchResult  {
        return {
            loadType: loadType,
            tracks: tracks ?? [],
            playlist: name ? {
                name,
                duration: tracks?.reduce((acc: number, cur: UnresolvedTrack) => acc + (cur.duration || 0), 0, )
            } : null,
            exception: error ? {
                message: error,
                severity: "COMMON",
            } : null
        }
    }
    
    public async makeRequest<T>(endpoint: string, modify: ModifyRequest = () => void 0): Promise<T> {
        if (!this.token) await this.renew()
        const req = fetch(`${this.BASE_URL}${/^\//.test(endpoint) ? endpoint : `/${endpoint}`}`)
            .header("Authorization", this.token);

        modify(req);
        return req.json();
    }

      public async renewToken(): Promise<number> {
        const { access_token, expires_in } = await fetch("https://accounts.spotify.com/api/token", "POST")
            .query("grant_type", "client_credentials")
            .header("Authorization", `Basic ${Buffer.from(this.plugin.options?.clientId + ":" + this.plugin.options?.clientSecret).toString("base64")}`)
            .header("Content-Type", "application/x-www-form-urlencoded")
            .json();

        if (!access_token) {
            throw new Error("Invalid Spotify client.");
        }

        this.token = `Bearer ${access_token}`;
        return expires_in * 1000;
    }

     public async renew(): Promise<void> {
        const expiresIn = await this.renewToken();
        setTimeout(() => this.renew(), expiresIn);
     }
}
