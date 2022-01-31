import { Manager } from "erela.js";
import { Spotify } from "../../plugin";

jest.setTimeout(60000);

test("Spotify album with scrape strategy", (done) => {
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
    manager.search("https://open.spotify.com/album/5ZxEBTl8KlJ2AEC1dxNTMY").then(x => {
        expect(x.loadType).toBe("PLAYLIST_LOADED");
        done();
    }).catch(e => expect(e).toMatch('error'));
})
