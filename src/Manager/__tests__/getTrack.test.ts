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
    manager.search("https://open.spotify.com/track/6NEoeBLQbOMw92qMeLfI40").then(x => {
        expect(x.loadType).toBe("TRACK_LOADED");
        done();
    }).catch(e => expect(e).toMatch('error'));
})