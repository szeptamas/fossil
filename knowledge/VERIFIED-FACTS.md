# Verified facts

Last reviewed: 2026-06-17

## Toolchain

- JerryScript `v2.1.0` builds compatible Fossil HR snapshots.
- The successful command used `python3 tools/build.py --jerry-cmdline-snapshot ON`.
- Docker with Ubuntu 20.04 produced working `.wapp` packages.
- `snakeApp.wapp` and `testMenuApp.wapp` built successfully from the SDK.

## Installation and launch

- `snakeApp` and `testMenuApp` installed through Gadgetbridge.
- Both launched successfully on the Fossil Hybrid HR Collider.
- Gadgetbridge app launching depends on an active Gadgetbridge-generated `customWatchFace`.
- A stock Fossil watchface may cause Start to appear ineffective.
- The launcher app identifier is case-sensitive and must match `build\app.json`.

## Controls observed in working examples

- top short press;
- middle short press;
- bottom short press;
- middle hold for exit/back.

## Menu persistence

- A menu sent directly from Menu Companion may be temporary.
- Recreating/reinstalling the Gadgetbridge custom watchface embeds the menu structure for persistence.

## Build evidence

A build is accepted only when the expected fresh `.wapp` exists and has non-zero length.
