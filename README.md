# TCast Companion module

A [Bitfocus Companion](https://bitfocus.io/companion) module for controlling [TCast](https://tcast.app) playout from a Stream Deck. Trigger clips, run transport, cut to black, clear layers, and ride master volume, with live button feedback.

It talks to TCast's HTTP + WebSocket control API, which you switch on in TCast under **Settings → Remote Control** (default port `7341`).

## Install

Companion 4.0 and later: **Connections → Add connection**, search for **TCast**, and install it from the module store.

## Setup

1. In TCast, open **Settings → Remote Control**, turn on **Enable remote control**, and note the port and address it shows.
2. In Companion, add the TCast connection and fill in the host or IP, the port, and the control password if you set one in TCast.
3. The connection indicator turns green once it reaches TCast, and clip dropdowns fill in from the live board.

If you don't set a control password in TCast, the API is unauthenticated and anyone on the network can drive the show. Set one, or keep TCast on a private network.

[companion/HELP.md](companion/HELP.md) has the full list of actions, feedbacks, variables, and presets. It's the same help you get from the **?** button on the connection in Companion.

## Control API reference

Every action maps to one HTTP route (GET or POST) on the control server, so the same endpoints work from Companion's Generic HTTP connection or `curl`:

```
GET  /api/state                     full feedback snapshot (JSON)
GET  /api/clips                     clip list
     /api/trigger/id/{mediaId}      take a clip live by id
     /api/trigger/index/{n}         take the Nth board clip live (1-based)
     /api/transport/play|pause|toggle|restart
     /api/transport/seek?by=-5      (or ?to=12.5)
     /api/clip/next|prev
     /api/black/on|off|toggle
     /api/clear/{layer}|all         layer = media|overlay|background|audio
     /api/volume/set?db=-12         set master volume in dB (-60 to 6)
     /api/volume/step?by=1          nudge master volume by 3 dB
     /api/mute/on|off|toggle
     ws://host:port/                feedback socket (snapshot on connect + on change)
```

## Source layout

```
main.js                 # InstanceBase: wires client to actions/feedbacks/variables
companion/manifest.json # module id, runtime (node22), entrypoint
companion/HELP.md       # in-app help
src/config.js           # host + port + optional control password
src/client.js           # WebSocket (feedback) + fetch (commands), auto-reconnect
src/actions.js          # trigger, transport, black, clear, volume, mute
src/feedbacks.js        # clip-live tally, black, live, playing, muted
src/variables.js        # clip name, time, duration, master dB
src/presets.js          # buttons you can drop straight onto a page
```

Plain CommonJS, no build step. Yarn 4 is required (`corepack enable && yarn install`).

## License

MIT. See [LICENSE](LICENSE).
