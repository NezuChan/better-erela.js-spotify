import { Manager, Track, UnresolvedQuery, UnresolvedTrack, TrackUtils as TrackUtilsOri } from "erela.js";
export declare abstract class TrackUtils extends TrackUtilsOri {
    static trackPartial: string[] | null;
    private static manager;
    /** @hidden */
    static init(manager: Manager): void;
    static setTrackPartial(partial: string[]): void;
    /**
     * Checks if the provided argument is a valid Track or UnresolvedTrack, if provided an array then every element will be checked.
     * @param trackOrTracks
     */
    static validate(trackOrTracks: unknown): boolean;
    /**
     * Checks if the provided argument is a valid UnresolvedTrack.
     * @param track
     */
    static isUnresolvedTrack(track: unknown): boolean;
    /**
     * Checks if the provided argument is a valid Track.
     * @param track
     */
    static isTrack(track: unknown): boolean;
    /**
     * Builds a UnresolvedTrack to be resolved before being played  .
     * @param query
     * @param requester
     */
    static buildUnresolved(query: string | UnresolvedQuery, requester?: unknown): UnresolvedTrack;
    static getClosestTrack(unresolvedTrack: UnresolvedTrack): Promise<Track>;
}
