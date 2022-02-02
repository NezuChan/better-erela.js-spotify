import {
    Manager,
    Plugin,
    SearchQuery,
    SearchResult
} from "erela.js";
import resolver from "./resolver";
import { SpotifyOptions } from "./typings";


const check = (options?: SpotifyOptions): void => {
    if (
        typeof options?.convertUnresolved !== "undefined" &&
        typeof options.convertUnresolved !== "boolean"
    ) {
        throw new TypeError(
            "Spotify option \"convertUnresolved\" must be a boolean."
        );
    }
    if (
        typeof options?.strategy !== "undefined" &&
        typeof options.strategy !== "string"
    ) {
        throw new TypeError(
            "Spotify option \"strategy\" must be a string."
        );
    }

    if (
        typeof options?.strategy !== "undefined" &&
        options.strategy === "API" &&
        !options.clientSecret
    ) {
        throw new TypeError(
            "Spotify option \"clientSecret\" required if strategy set to API."
        );
    }
    if (
        typeof options?.strategy !== "undefined" &&
        options.strategy === "API" &&
        (!options.clientId || (!options.clientID && !options.clientId))
    ) {
        throw new TypeError(
            "Spotify option \"clientId\" or \"clientID\" required if strategy set to API."
        );
    }
    if (
        typeof options?.playlistPageLimit !== "undefined" &&
        typeof options.playlistPageLimit !== "number"
    ) {
        throw new TypeError(
            "Spotify option \"playlistPageLimit\" must be a number."
        );
    }
    if (
        typeof options?.albumPageLimit !== "undefined" &&
        typeof options.albumPageLimit !== "number"
    ) {
        throw new TypeError(
            "Spotify option \"albumPageLimit\" must be a number."
        );
    }

    if (
        typeof options?.showPageLimit !== "undefined" &&
        typeof options.showPageLimit !== "number"
    ) {
        throw new TypeError(
            "Spotify option \"showPageLimit\" must be a number."
        );
    }
    if (
        typeof options?.maxCacheLifeTime !== "undefined" &&
        typeof options.maxCacheLifeTime !== "number"
    ) {
        throw new TypeError(
            "Spotify option \"maxCacheLifeTime\" must be a number."
        );
    }
};

export class Spotify extends Plugin {
    public readonly resolver = new resolver(this);
    public spotifyMatch = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|episode|show|album)[\/:]([A-Za-z0-9]+)/;
    public manager: Manager | undefined;

    private _search!: (query: SearchQuery | string, requester?: unknown) => Promise<SearchResult>;
    public options: { clientID?: string | undefined; convertUnresolved: boolean; strategy: string; clientSecret?: string | undefined; clientId?: string | undefined; cacheTrack: boolean; showPageLimit: number; playlistPageLimit: number; albumPageLimit: number; maxCacheLifeTime: number; countryMarket: string };

    public constructor(options?: SpotifyOptions) {
        super();
        check(options);
        this.options = {
            strategy: "SCRAPE",
            cacheTrack: true,
            countryMarket: "US",
            albumPageLimit: 10,
            showPageLimit: 10,
            playlistPageLimit: 10,
            maxCacheLifeTime: 360000,
            convertUnresolved: false,
            ...options
        };
    }

    public async load(manager: Manager): Promise<void> {
        this.manager = manager;
        this._search = manager.search.bind(manager);
        manager.search = this.search.bind(this);
        if (typeof this.options.maxCacheLifeTime === "number") {
            for (const resolverManager of Object.values(this.resolver.resolveManager)) {
                setInterval(() => resolverManager.cache.clear(), this.options.maxCacheLifeTime);
            }
        }
        try {
            await this.resolver.renew();
        } catch (_e) {
            console.log("Failed to renew Spotify token, dont open issue about this. retrying in 10 seconds.");
            setTimeout(async () => {
                try {
                    await this.resolver.renew();
                } catch (e) {
                    console.error(`Failed to renew Spotify token: ${e}, please report this to maintainer`);
                }
            }, 10_000);
        }
    }

    private async search(query: SearchQuery | string, requester?: unknown): Promise<SearchResult> {
        const finalQuery = (query as SearchQuery).query || query as string;
        const [, type, id] = this.spotifyMatch.exec(finalQuery) ?? [];
        if (type in this.resolver.resolveManager) {
            return this.resolver.resolveManager[type as keyof resolver["resolveManager"]].fetch(id, requester);
        }
        return this._search(query, requester);
    }
}


