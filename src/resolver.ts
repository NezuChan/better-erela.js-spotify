import { UnresolvedTrack, LoadType, ModifyRequest, TrackUtils, Track } from "erela.js";
import { Tracks } from "spotify-url-info";
import { SearchResult, SpotifyTrack, UnresolvedSpotifyTrack } from "./typings";
import { EpisodeManager, PlaylistManager, ShowManager, TrackManager, AlbumManager, ArtistManager } from './Manager';
import Spotify from './index';
import fetch from 'petitio';
import Collection from "@discordjs/collection";

export default class resolver {
    constructor(public plugin: Spotify) {
        if (plugin.options?.maxCacheLifeTime) {
            setInterval(() => {
                this.cache.clear()
            }, this.plugin.options?.maxCacheLifeTime)
        }
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
    public cache: Collection<string, UnresolvedTrack | Track> = new Collection();
    public UNRESOLVED_TRACK_SYMBOL = Symbol("unresolved")
    public static buildUnresolved(track: Tracks | SpotifyTrack) {
        if (!track) throw new ReferenceError("The Spotify track object was not provided");
        if (!track.name) throw new ReferenceError("The track name was not provided");
        if (typeof track.name !== "string") throw new TypeError(`The track name must be a string, received type ${typeof track.name}`);
        return {
            title: track.name,
            author: Array.isArray(track.artists) ? track.artists.map((x) => x.name).join(" ") : '',
            duration: track.duration_ms,
            uri: track.external_urls.spotify,
            thumbnail: (track as SpotifyTrack).images ? (track as SpotifyTrack)?.images[0]?.url ?? null : (track as SpotifyTrack).album.images[0].url ?? null
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
        if (!this.token) await this.requestToken()
        const req = fetch(`${this.BASE_URL}${/^\//.test(endpoint) ? endpoint : `/${endpoint}`}`)
            .header("Authorization", this.token);

        modify(req);
        return req.json();
    }

    private async retrieveTrack(unresolvedTrack: Partial<UnresolvedTrack>, requester?: unknown) {
        const response = await this.plugin.manager?.search(`${unresolvedTrack.author} - ${unresolvedTrack.title} - topic`, requester)!
        return response.tracks[0];
    }

    public buildUnresolved(track: UnresolvedSpotifyTrack, requester: unknown): UnresolvedTrack {
        
        const _this = this; // eslint-disable-line
        let unresolvedTrack: Partial<UnresolvedTrack> = {
            requester,
            async resolve(): Promise<void> {
                const resolved = await _this.resolveTrack(this)
                //@ts-ignore
                Object.getOwnPropertyNames(this).forEach(prop => delete this[prop]);
                Object.assign(this, resolved);
            }
        };
        Object.defineProperty(unresolvedTrack, this.UNRESOLVED_TRACK_SYMBOL, {
            configurable: true,
            value: true
        });

        if (typeof track === "string") unresolvedTrack.title = track;
        else unresolvedTrack = { ...unresolvedTrack, ...track }
        return unresolvedTrack as UnresolvedTrack;
    }

    private async resolveTrack(unresolvedTrack: Partial<UnresolvedTrack>, requester?: unknown) {
        if (this.cache.has(unresolvedTrack.identifier!)) return this.cache.get(unresolvedTrack.identifier!);

        const lavaTrack = await this.retrieveTrack(unresolvedTrack, requester);
        if (lavaTrack) {
            if (this.plugin.options?.useSpotifyMetadata) {
                Object.assign(lavaTrack, {
                    title: unresolvedTrack.title,
                    author: unresolvedTrack.author,
                    uri: unresolvedTrack.uri,
                    thumbnail: unresolvedTrack.thumbnail
                });
            }
            if (this.plugin.options?.cacheTrack) this.cache.set(lavaTrack.identifier, Object.freeze(lavaTrack));
        }
        return lavaTrack;
    }

    public async requestToken(): Promise<void> {
        if (this.nextRequest) return;

        try {
            const request = await fetch("https://accounts.spotify.com/api/token", "POST")
                .header({
                    Authorization: `Basic ${Buffer.from(this.plugin.options?.clientId + ":" + this.plugin.options?.clientSecret).toString("base64")}`, // eslint-disable-line
                    "Content-Type": "application/x-www-form-urlencoded"
                }).body("grant_type=client_credentials").send();

            if (request.statusCode === 400) return Promise.reject(new Error("Invalid Spotify Client"));
            const { access_token, token_type, expires_in }: { access_token: string; token_type: string; expires_in: number } = request.json();
            Object.defineProperty(this, "token", {
                value: `${token_type} ${access_token}`
            });
            Object.defineProperty(this, "nextRequest", {
                configurable: true,
                value: setTimeout(() => {
                    delete this.nextRequest;
                    void this.requestToken();
                }, expires_in * 1000)
            });
        } catch (e: any) {
            if (e.statusCode === 400) {
                return Promise.reject(new Error("Invalid Spotify client."));
            }
            await this.requestToken();
        }
    }
}