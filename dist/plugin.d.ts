import { Manager, Plugin } from "erela.js";
import resolver from "./resolver";
import { SpotifyOptions } from "./typings";
export declare class Spotify extends Plugin {
    options?: SpotifyOptions | undefined;
    readonly resolver: resolver;
    private _search;
    private readonly functions;
    manager: Manager | undefined;
    constructor(options?: SpotifyOptions | undefined);
    load(manager: Manager): Promise<void>;
    private search;
}
