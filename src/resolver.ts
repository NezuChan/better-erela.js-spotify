import { UnresolvedTrack, LoadType } from "erela.js";
import { ISpotifyAccessTokenAPIResult, ISpotifyAccessTokenAPIScrapeResult, SearchResult, SpotifyTrack } from "./typings";
import { EpisodeManager, PlaylistManager, ShowManager, TrackManager, AlbumManager, ArtistManager } from "./Manager";
import Spotify from "./index";
import { fetch } from "undici";

export default class resolver {
    public constructor(public plugin: Spotify) { }

    public getTrack = new TrackManager(this.plugin);
    public getPlaylist = new PlaylistManager(this.plugin);
    public getAlbum = new AlbumManager(this.plugin);
    public getArtist = new ArtistManager(this.plugin);
    public getShow = new ShowManager(this.plugin);
    public getEpisode = new EpisodeManager(this.plugin);
    public token!: string;
    public BASE_URL = "https://api.spotify.com/v1";
    public static buildUnresolved(track: SpotifyTrack | undefined): { title: string; author: string; duration: number; uri: string; thumbnail: string | null } {
        if (!track) throw new ReferenceError("The Spotify track object was not provided");
        if (!track.name) throw new ReferenceError("The track name was not provided");
        if (typeof track.name !== "string") throw new TypeError(`The track name must be a string, received type ${typeof track.name}`);
        return {
            title: track.name,
            author: Array.isArray(track.artists) ? track.artists.map(x => x.name).join(" ") : "",
            duration: track.duration_ms,
            uri: track.external_urls.spotify,
            /* eslint @typescript-eslint/no-unnecessary-condition: "off" */
            thumbnail: track.album?.images?.length ? track.album.images[0].url ?? null : track.images?.length ? track.images[0].url ?? null : null
        };
    }

    public static buildSearch(loadType: LoadType, tracks: UnresolvedTrack[] | undefined, error: string, name: string | undefined): SearchResult {
        return {
            loadType,
            tracks: tracks ?? [],
            /* eslint @typescript-eslint/prefer-nullish-coalescing: "off" */
            playlist: name ? { name, duration: tracks?.reduce((acc: number, cur: UnresolvedTrack) => acc + (cur.duration || 0), 0) ?? 0 } : null,
            exception: error ? { message: error, severity: "COMMON" } : null
        };
    }

    public async makeRequest<T>(endpoint: string): Promise<T> {
        if (!this.token) await this.renew();
        const req = await fetch(`${this.BASE_URL}${/^\//.test(endpoint) ? endpoint : `/${endpoint}`}`, { headers: { Authorization: this.token } });
        return req.json() as Promise<T>;
    }

    public async renewToken(): Promise<number> {
        const response = await fetch("https://accounts.spotify.com/api/token?grant_type=client_credentials", {
            method: "POST", headers: {
                /* eslint @typescript-eslint/restrict-template-expressions: "off" */
                Authorization: `Basic ${Buffer.from(`${this.plugin.options?.clientId}:${this.plugin.options?.clientSecret}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        const { access_token, expires_in } = await response.json() as ISpotifyAccessTokenAPIResult;
        if (!access_token) {
            throw new Error("Invalid Spotify client.");
        }

        this.token = `Bearer ${access_token}`;
        return expires_in * 1000;
    }

    public async getSelfToken(): Promise<number> {
        const response = await fetch("https://open.spotify.com/get_access_token?reason=transport&productType=embed", { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59" } });
        const { accessToken, accessTokenExpirationTimestampMs } = await response.json() as ISpotifyAccessTokenAPIScrapeResult;
        if (!accessToken) throw new Error("Could not fetch self spotify token.");
        this.token = `Bearer ${accessToken}`;
        return new Date(accessTokenExpirationTimestampMs).getMilliseconds() * 1000;
    }

    public async renew(): Promise<void> {
        if (this.plugin.options?.strategy === "API") {
            const lastRenew = await this.renewToken();
            setTimeout(() => this.renew(), lastRenew);
        } else {
            const lastRenew = await this.getSelfToken();
            setTimeout(() => this.renew(), lastRenew);
        }
    }
}
