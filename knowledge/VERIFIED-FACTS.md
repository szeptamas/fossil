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

## Development-relevant hardware

Officially described:

- dynamic readout display;
- real mechanical hands;
- heart-rate sensor;
- programmable pushers;
- step, sleep and workout features;
- 2+ weeks advertised battery life, usage dependent;
- charging in under one hour;
- iPhone and Android compatibility.

Verified or technically supported:

- the WAPP layout coordinate space is 240 × 240;
- the physical visible area is circular;
- the display is not touch-sensitive;
- three side controls are the primary WAPP input;
- physical hands can obscure app content;
- the SDK response API can request hand movement;
- double tapping the glass activates illumination on this watch.

Not yet verified as official hardware specifications:

- E-ink panel terminology;
- 1.1-inch display size;
- 218 ppi;
- 256 KB RAM;
- 16 MB flash;
- 55 mAh battery;
- exact MCU;
- Bluetooth 5.0 exactly;
- accelerometer model;
- onboard GPS;
- WAPP memory and storage limits.

See `docs/HARDWARE-PROFILE.md`.
