import { Manager } from "erela.js";
import { Spotify } from "../../plugin";

jest.setTimeout(30000);

test("Spotify artist top tracks with scrape strategy", (done) => {
    const manager = new Manager({
        send: () => {
    
        },
        plugins: [
            new Spotify()
        ]
    });
    manager.search("https://open.spotify.com/artist/41MozSoPIsD1dJM0CLPjZF").then(x => {
        expect(x.loadType).toBe("PLAYLIST_LOADED");
        done();
    }).catch(e => expect(e).toMatch('error'));
})