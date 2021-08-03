import { Manager, Plugin } from "erela.js";
import { SpotifyOptions } from "./typings";
export declare class Spotify extends Plugin {
    private readonly options;
    private readonly resolver;
    private _search;
    private readonly functions;
    manager: Manager | undefined;
    constructor(options: SpotifyOptions);
    load(manager: Manager): void;
    private search;
}
