# TCast Companion module

A [Bitfocus Companion](https://bitfocus.io/companion) module for controlling TCast from a Stream Deck. It drives TCast's HTTP + WebSocket control API (enabled under **Settings → Remote Control**, default port `7341`).

See [companion/HELP.md](companion/HELP.md) for actions, feedbacks, and connection setup.

## Install as a developer module

Plain CommonJS — no transpile step. Yarn 4 is required (Bitfocus CI rejects
`package-lock.json`); on Node ≥ 25, install corepack first (`npm i -g corepack`).

```sh
cd companion-module
corepack enable && yarn install

mkdir -p ~/companion-dev
ln -s "$(pwd)" ~/companion-dev/tcast-tcast
```

Before submitting a release, test the _packaged_ build instead — that's what
users get:

```sh
yarn companion-module-build --dev --output=pkg
ln -sfn "$(pwd)/pkg" ~/companion-dev/tcast-tcast
```

Then in Companion:

1. Open the Companion **launcher → gear icon → Developer modules path**, set it to `~/companion-dev`, and relaunch.
2. In the web UI: **Connections → Add connection → TCast**.
3. Enter the host/IP and port from TCast's **Settings → Remote Control**.

The connection goes green once it reaches TCast; clip dropdowns populate from the live board.

## Layout

```
companion-module/
  main.js                 # InstanceBase: wires client → actions/feedbacks/variables
  companion/manifest.json # module id, runtime (node22), entrypoint
  companion/HELP.md       # in-app help
  src/config.js           # host + port + optional control password
  src/client.js           # WebSocket (feedback) + fetch (commands), auto-reconnect
  src/actions.js          # trigger, transport, black, clear, volume, mute
  src/feedbacks.js        # clip-live tally, black, live, playing, muted
  src/variables.js        # clip name, time, duration, master dB, …
  src/presets.js          # ready-made buttons
```

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
     /api/volume/set?db=-12         set master volume in dB (-60…6)
     /api/volume/step?by=1          nudge master volume ±3 dB
     /api/mute/on|off|toggle
     ws://host:port/                feedback socket (snapshot on connect + on change)
```
