import { Manager } from "erela.js";
import { Spotify } from "../../plugin";

jest.setTimeout(30000);

test("Spotify show with scrape strategy", (done) => {
    const manager = new Manager({
        send: () => {
    
        },
        plugins: [
            new Spotify()
        ]
    });
    manager.search("https://open.spotify.com/show/6eUQVD6V8zwrR1YN5iJ4Jh").then(x => {
        expect(x.loadType).toBe("PLAYLIST_LOADED");
        done();
    }).catch(e => expect(e).toMatch('error'));
})