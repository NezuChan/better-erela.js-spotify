import { Manager } from "erela.js";
import { Spotify } from "../../plugin";

jest.setTimeout(30000);

test("Spotify playlist with scrape strategy", (done) => {
    const manager = new Manager({
        send: () => {
    
        },
        nodes: [
            {
                host: "lava.link",
                password: "youshallnotpass",
                port: 80
            }
        ],
        plugins: [
            new Spotify()
        ]
    });
    manager.search("https://open.spotify.com/playlist/0uz5eKD137p0HTnM1xdN21").then(x => {
        expect(x.loadType).toBe("PLAYLIST_LOADED");
        done();
    }).catch(e => expect(e).toMatch('error'));
})