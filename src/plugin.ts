import {
    Manager,
    Plugin,
    SearchQuery,
    TrackUtils,
    SearchResult
} from "erela.js";
import resolver from "./resolver";
import { Result, SpotifyOptions } from "./typings";

const REGEX = /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|artist|album)[\/:]([A-Za-z0-9]+)/;



const check = (options?: SpotifyOptions) => {
    if (
        typeof options?.convertUnresolved !== "undefined" &&
        typeof options?.convertUnresolved !== "boolean"
    ) {
        throw new TypeError(
            "Spotify option \"convertUnresolved\" must be a boolean.",
        );
    }
}

export class Spotify extends Plugin {
    private readonly options: SpotifyOptions;
    private readonly resolver = new resolver()
    //@ts-expect-error _search is persistent
    private _search: (query: string | SearchQuery, requester?: unknown) => Promise<SearchResult>;
    private readonly functions = {
        track: this.resolver.getTrack.bind(this),
        album: this.resolver.getAlbum.bind(this),
        playlist: this.resolver.getPlaylist.bind(this),
        artist: this.resolver.getArtist.bind(this)
    };
    
    public manager: Manager | undefined;
    public constructor(options?: SpotifyOptions) {
        super();
        check(options);
        this.options = {
            ...options,
        };
    }

    public load(manager: Manager) {
        this.manager = manager;
        this._search = manager.search.bind(manager);
        manager.search = this.search.bind(this);
    }

    private async search(query: string | SearchQuery, requester?: unknown): Promise<SearchResult> {
        const finalQuery = (query as SearchQuery).query || query as string;
        const [ , type, id ] = finalQuery.match(REGEX) ?? [];
        if (type in this.functions) {
            try {
                const func = this.functions[type as keyof Spotify['functions']];

                if (func) {
                    const data: Result = await func(finalQuery);

                    const loadType = type === "track" ? "TRACK_LOADED" : "PLAYLIST_LOADED";
                    const name = [ "playlist", "album", 'artist' ].includes(type) ? data.name : null;

                    const tracks = data.tracks.map(query => {
                        const track = TrackUtils.buildUnresolved(query, requester);

                        if (this.options.convertUnresolved) {
                            try {
                                track.resolve();
                            } catch {
                                return null;
                            }
                        }

                        return track;
                    }).filter(track => !!track);
                    //@ts-expect-error type mabok
                    return resolver.buildSearch(loadType, tracks, null, name);
                }
                const msg = "Incorrect type for Spotify URL, must be one of \"track\", \"album\", \"artist\" or \"playlist\".";
                //@ts-expect-error type mabok
                return resolver.buildSearch("LOAD_FAILED", [], msg, null);
            } catch (e) {
                //@ts-expect-error type mabok
                return resolver.buildSearch(e.loadType ?? "LOAD_FAILED", [], e.message ?? null, null);
            }
    }
    return this._search(query, requester);
}

}


