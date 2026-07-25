# TCast

Control [TCast](https://tcast.app) playout from Bitfocus Companion — trigger clips, run transport, cut to black, clear layers, and ride master volume, with live button feedback (a clip's button lights red while it's on air, even when triggered from the app itself).

## Setup

1. In **TCast**, open **Settings → Remote Control** and make sure **Enable remote control** is on. Note the **port** (default `7341`) and the address shown.
2. In this connection's config, enter:
   - **Host / IP** — the address of the Mac running TCast. Use `127.0.0.1` only if Companion runs on the same Mac; otherwise use the LAN address shown in TCast's Remote Control settings.
   - **Port** — the port from the same screen (default `7341`).
   - **Control password** — only if you set one in TCast's Remote Control settings. It must match exactly; leave blank if TCast has none.
3. The connection indicator turns green once it's talking to TCast.

If no control password is set in TCast, the API is **unauthenticated** — anyone on the network can drive the show. Set a password, or keep it on a private, trusted network.

## Actions

| Action                             | What it does                                                                                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger clip (by name)             | Take a clip live. The dropdown lists every clip on the board and refreshes automatically as you edit the library. Triggering a clip that's already live takes it off. |
| Trigger clip (by board position)   | Take the Nth clip live, in stable board order (playlists top to bottom, then Unsorted). Position doesn't change when you search in the app.                           |
| Play / Pause, Play, Pause, Restart | Transport for the primary layer (media if live, else audio).                                                                                                          |
| Seek (relative)                    | Jump forward/back by a number of seconds.                                                                                                                             |
| Next clip / Previous clip          | Step through the board.                                                                                                                                               |
| Black                              | Cut to/from black (On / Off / Toggle).                                                                                                                                |
| Clear layer                        | Clear one layer or all layers.                                                                                                                                        |
| Master volume nudge / set          | Ride the master fader (±3 dB, or set an exact dB).                                                                                                                    |
| Mute                               | Mute/unmute master audio.                                                                                                                                             |

## Feedbacks

- **Clip is live** — lights a button while that clip is on air (great for a clip-launch grid with tally).
- **Black is active**, **Program is live**, **Primary transport is playing**, **Audio is muted**.

## Variables

`current_clip`, `current_time`, `duration`, `time_remaining`, `master_db`, `black`, `clip_count`.

## Presets

Ready-made buttons under **Program** (Black, Play/Pause, Clear All, Next, Prev, Mute) and **Clips** (a "Trigger clip" template with tally pre-wired — drop it on a button and pick the clip).

## Without this module

Any TCast action also works from Companion's built-in **Generic HTTP** connection: set the base URL to `http://<mac-ip>:7341` and have buttons `GET` paths like `/api/black/toggle`, `/api/trigger/index/1`, or `/api/transport/toggle`. You lose the clip dropdowns and button feedback, but it needs no module install.
