import { Manager } from "erela.js";
import { Spotify } from "../../plugin";

jest.setTimeout(30000);

test("Spotify track with scrape strategy", (done) => {
    const manager = new Manager({
        send: () => {
    
        },
        plugins: [
            new Spotify()
        ]
    });
    manager.search("https://open.spotify.com/episode/5eeZpC35QkgNl3EZN5a8S1").then(x => {
        expect(x.loadType).toContain("TRACK_LOADED");
        done();
    })
})