import { ISpotifyAccessTokenAPIResult, ISpotifyAccessTokenAPIScrapeResult } from "./typings";
import { EpisodeManager, PlaylistManager, ShowManager, TrackManager, AlbumManager, ArtistManager } from "./Manager";
import Spotify from "./index";
import { fetch } from "undici";

export default class resolver {
    public constructor(public plugin: Spotify) { }

    public resolveManager = {
        episode: new EpisodeManager(this),
        playlist: new PlaylistManager(this),
        show: new ShowManager(this),
        track: new TrackManager(this),
        album: new AlbumManager(this),
        artist: new ArtistManager(this)
    };

    public token!: string;
    public BASE_URL = "https://api.spotify.com/v1";

    public async makeRequest<T>(endpoint: string): Promise<T | null> {
        try {
            if (!this.token) await this.renew();
            const req = await fetch(endpoint.startsWith("http") ? endpoint : `${this.BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`, { headers: { Authorization: this.token } });
            return await req.json() as Promise<T>;
        } catch (_e) {
            return null;
        }
    }

    public async renewToken(): Promise<number> {
        const response = await fetch("https://accounts.spotify.com/api/token?grant_type=client_credentials", {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${this.plugin.options.clientID ?? this.plugin.options.clientId}:${this.plugin.options.clientSecret}`).toString("base64")}`,
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
        return (new Date(accessTokenExpirationTimestampMs).getMilliseconds() - 10) * 1000;
    }

    public async renew(): Promise<void> {
        if (this.plugin.options.strategy === "API") {
            const lastRenew = await this.renewToken();
            setTimeout(() => this.renew(), lastRenew);
        } else {
            const lastRenew = await this.getSelfToken();
            setTimeout(() => this.renew(), lastRenew);
        }
    }
}
