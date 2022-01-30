import { Manager, Plugin } from "erela.js";
import resolver from "./resolver";
import { SpotifyOptions } from "./typings";
export declare class Spotify extends Plugin {
    readonly resolver: resolver;
    spotifyMatch: RegExp;
    manager: Manager | undefined;
    private _search;
    options: {
        clientID?: string | undefined;
        convertUnresolved: boolean;
        strategy: string;
        clientSecret?: string | undefined;
        clientId?: string | undefined;
        cacheTrack: boolean;
        showPageLimit: number;
        playlistPageLimit: number;
        albumPageLimit: number;
        maxCacheLifeTime: number;
        countryMarket: string;
    };
    constructor(options?: SpotifyOptions);
    load(manager: Manager): Promise<void>;
    private search;
}
