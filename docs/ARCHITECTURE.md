# Repository architecture

## Design goal

Keep original application development isolated from fragile upstream reverse-engineering repositories while making local evidence easy for an AI coding agent to find.

## Layers

### 1. Original application layer

```text
apps\<app-name>\
```

Each app is self-contained and derived from a known working SDK example.

Expected minimum:

```text
app.js
Makefile
build\app.json
build\files\...
```

Generated code snapshots and `.wapp` packages are not committed.

### 2. Tooling layer

```text
scripts\
```

Responsibilities:

- environment checks;
- new app generation;
- single-app builds;
- all-app builds;
- optional ADB installation;
- local knowledge indexing.

Scripts must not modify upstream repositories.

### 3. Distilled knowledge layer

```text
docs\
knowledge\
```

This contains concise, reviewed, reusable conclusions.

The complete raw archive remains external:

```text
C:\git\Fossil\_knowledge-archive
```

### 4. Upstream evidence layer

Read-only external repositories:

```text
C:\git\Fossil\Fossil-HR-SDK
C:\git\Fossil\Gadgetbridge
C:\git\Fossil\fossil-hr-gbapps
C:\git\Fossil\jerryscript
```

## Dependency direction

```text
original app
    ↓ uses
Fossil HR SDK format and runtime APIs
    ↓ investigated through
SDK docs/examples + Gadgetbridge + archived discussions
```

Original apps must never depend on modifying an upstream checkout.

## Change boundaries

A normal app task may modify:

- one app directory;
- a directly related test/check script;
- app catalog or verified evidence.

It must not casually modify:

- unrelated apps;
- upstream repositories;
- global guardrails;
- skills;
- raw archive;
- app identifiers;
- build infrastructure.

Infrastructure changes should be separate tasks and PRs.


### 5. PC simulator layer

```text
simulator/
```

The first version is a source-mode simulator:

- a Python standard-library local HTTP server;
- a browser-hosted Fossil runtime shim;
- a Canvas renderer;
- deterministic fixtures.

It deliberately avoids pretending to emulate the MCU, JerryScript memory model, or display controller.
