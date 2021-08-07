# better-erela.js-spotify
 A erela.js spotify plugin, but more better.
## Feature
 - No apikey required!
 
## Example
```js
const { Manager } = require("erela.js");
const Spotify  = require("better-erela.js-spotify");

const manager = new Manager({
  plugins: [
    // Initiate the plugin and pass the 1 required option.
    new Spotify({
        convertUnresolved: false
     })
  ]
});

manager.search("https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC");
```