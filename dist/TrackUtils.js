"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackUtils = void 0;
const erela_js_1 = require("erela.js");
/** @hidden */
const TRACK_SYMBOL = Symbol("track"), 
/** @hidden */
UNRESOLVED_TRACK_SYMBOL = Symbol("unresolved"), SIZES = [
    "0",
    "1",
    "2",
    "3",
    "default",
    "mqdefault",
    "hqdefault",
    "maxresdefault",
];
/** @hidden */
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
class TrackUtils extends erela_js_1.TrackUtils {
    /** @hidden */
    static init(manager) {
        this.manager = manager;
    }
    static setTrackPartial(partial) {
        if (!Array.isArray(partial) || !partial.every(str => typeof str === "string"))
            throw new Error("Provided partial is not an array or not a string array.");
        if (!partial.includes("track"))
            partial.unshift("track");
        this.trackPartial = partial;
    }
    /**
   * Builds a Track from the raw data from Lavalink and a optional requester.
   * @param data
   * @param requester
   */
    static build(data, requester) {
        if (typeof data === "undefined")
            throw new RangeError('Argument "data" must be present.');
        try {
            const track = {
                track: data.track,
                title: data.info.title,
                identifier: data.info.identifier,
                author: data.info.author,
                duration: data.info.length,
                isSeekable: data.info.isSeekable,
                isStream: data.info.isStream,
                uri: data.info.uri,
                thumbnail: data.info.uri.includes("youtube")
                    ? `https://img.youtube.com/vi/${data.info.identifier}/default.jpg`
                    : null,
                //@ts-ignore
                displayThumbnail(size = "default") {
                    const finalSize = SIZES.find((s) => s === size) ?? "default";
                    return this.uri.includes("youtube")
                        ? `https://img.youtube.com/vi/${data.info.identifier}/${finalSize}.jpg`
                        : null;
                },
                requester,
            };
            track.displayThumbnail = track.displayThumbnail.bind(track);
            if (this.trackPartial) {
                for (const key of Object.keys(track)) {
                    if (this.trackPartial.includes(key))
                        continue;
                    //@ts-ignore
                    delete track[key];
                }
            }
            Object.defineProperty(track, TRACK_SYMBOL, {
                configurable: true,
                value: true
            });
            return track;
        }
        catch (error) {
            //@ts-ignore
            throw new RangeError(`Argument "data" is not a valid track: ${error.message}`);
        }
    }
    /**
     * Checks if the provided argument is a valid Track or UnresolvedTrack, if provided an array then every element will be checked.
     * @param trackOrTracks
     */
    static validate(trackOrTracks) {
        if (typeof trackOrTracks === "undefined")
            throw new RangeError("Provided argument must be present.");
        if (Array.isArray(trackOrTracks) && trackOrTracks.length) {
            for (const track of trackOrTracks) {
                if (!(track[TRACK_SYMBOL] || track[UNRESOLVED_TRACK_SYMBOL]))
                    return false;
            }
            return true;
        }
        return (
        //@ts-expect-error
        trackOrTracks[TRACK_SYMBOL] ||
            //@ts-expect-error
            trackOrTracks[UNRESOLVED_TRACK_SYMBOL]) === true;
    }
    /**
     * Checks if the provided argument is a valid UnresolvedTrack.
     * @param track
     */
    static isUnresolvedTrack(track) {
        if (typeof track === "undefined")
            throw new RangeError("Provided argument must be present.");
        //@ts-expect-error
        return track[UNRESOLVED_TRACK_SYMBOL] === true;
    }
    /**
     * Checks if the provided argument is a valid Track.
     * @param track
     */
    static isTrack(track) {
        if (typeof track === "undefined")
            throw new RangeError("Provided argument must be present.");
        //@ts-expect-error
        return track[TRACK_SYMBOL] === true;
    }
    /**
     * Builds a UnresolvedTrack to be resolved before being played  .
     * @param query
     * @param requester
     */
    static buildUnresolved(query, requester) {
        if (typeof query === "undefined")
            throw new RangeError('Argument "query" must be present.');
        let unresolvedTrack = {
            requester,
            async resolve() {
                //@ts-expect-error
                const resolved = await TrackUtils.getClosestTrack(this);
                //@ts-expect-error
                Object.getOwnPropertyNames(this).forEach(prop => delete this[prop]);
                Object.assign(resolved, {
                    title: query.title,
                    thumbnail: query.thumbnail,
                    uri: query.uri
                });
                Object.assign(this, resolved);
            }
        };
        if (typeof query === "string")
            unresolvedTrack.title = query;
        else
            unresolvedTrack = { ...unresolvedTrack, ...query };
        Object.defineProperty(unresolvedTrack, UNRESOLVED_TRACK_SYMBOL, {
            configurable: true,
            value: true
        });
        return unresolvedTrack;
    }
    static async getClosestTrack(unresolvedTrack) {
        if (!TrackUtils.manager)
            throw new RangeError("Manager has not been initiated.");
        if (!TrackUtils.isUnresolvedTrack(unresolvedTrack))
            throw new RangeError("Provided track is not a UnresolvedTrack.");
        const query = [unresolvedTrack.author, unresolvedTrack.title].filter(str => !!str).join(" - ");
        const res = await TrackUtils.manager.search(query, unresolvedTrack.requester);
        if (res.loadType !== "SEARCH_RESULT")
            throw res.exception ?? {
                message: "No tracks found.",
                severity: "COMMON",
            };
        if (unresolvedTrack.author) {
            const channelNames = [unresolvedTrack.author, `${unresolvedTrack.author} - Topic`];
            const originalAudio = res.tracks.find(track => {
                return (channelNames.some(name => new RegExp(`^${escapeRegExp(name)}$`, "i").test(track.author)) ||
                    new RegExp(`^${escapeRegExp(unresolvedTrack.title)}$`, "i").test(track.title));
            });
            if (originalAudio)
                return originalAudio;
        }
        if (unresolvedTrack.duration) {
            const sameDuration = res.tracks.find(track => 
            //@ts-expect-error
            (track.duration >= (unresolvedTrack.duration - 1500)) &&
                //@ts-expect-error
                (track.duration <= (unresolvedTrack.duration + 1500)));
            if (sameDuration)
                return sameDuration;
        }
        return res.tracks[0];
    }
}
exports.TrackUtils = TrackUtils;
TrackUtils.trackPartial = null;
//# sourceMappingURL=TrackUtils.js.map