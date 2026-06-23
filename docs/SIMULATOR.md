# PC simulator architecture and validation

## Goal

Provide a fast source-mode development loop for Fossil Hybrid HR applications before the slower Docker build, Gadgetbridge install, and real-watch test.

## Execution path

```text
SDK-style app directory
  ├── app.js
  ├── build/app.json
  └── build/files/layout/*
          ↓
Python local server
          ↓
Browser Fossil runtime shim
          ↓
240 × 240 canvas + physical hands + button events
```

## Trust boundary

The simulator validates:

- JavaScript application logic;
- state transitions;
- event handling;
- timers;
- persistence shape;
- layout placeholders;
- supported visual nodes;
- requested hand movements;
- response actions.

It does not prove:

- JerryScript snapshot compatibility;
- WAPP package correctness;
- firmware memory behavior;
- exact physical display rendering;
- Bluetooth behavior;
- battery impact;
- real sensor behavior.

## Required validation sequence

```text
PC simulator
→ repository/simulator tests
→ Docker WAPP build
→ Gadgetbridge install
→ real watch
```

## First compatibility target

The SDK `examples\simple-menu` application.

Acceptance:

- it loads from its real source directory;
- `system_state_update` enters the menu;
- top and bottom short events change selection;
- middle short event executes selection behavior;
- middle hold requests `go_back`;
- requested hand angles are visible;
- the last response and event sequence are inspectable.

## Next targets

1. complete simple-menu visual fidelity;
2. timer and persistence verification;
3. Snake layout and timer compatibility;
4. WAPP resource parser;
5. optional native JerryScript snapshot execution.
