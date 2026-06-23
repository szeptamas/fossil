# Fossil Hybrid HR development hub

This repository is the working home for custom Fossil Hybrid HR watch applications, repeatable build scripts, distilled project knowledge, and AI-agent guardrails.

The upstream SDK, Gadgetbridge, JerryScript, and the full knowledge archive remain separate, read-only references under `C:\git\Fossil`.

## Local layout

```text
C:\git\Fossil\
├── fossil\                     # this repository
├── Fossil-HR-SDK\              # upstream SDK, read-only reference
├── jerryscript\                # JerryScript v2.1.0 source
├── Gadgetbridge\               # upstream Gadgetbridge source
├── fossil-hr-gbapps\           # upstream watchface/navigation apps
└── _knowledge-archive\         # issues, PRs, releases, attachments, docs
```

## Quick start

```powershell
cd C:\git\Fossil\fossil

.\scripts\check-environment.ps1
.\scripts\test-repository.ps1

.\scripts\new-app.ps1 `
  -Name lion-hello `
  -Identifier lionHelloApp `
  -Title "Lion Hello"

.\scripts\build-app.ps1 -App lion-hello
```

## PC simulator

Run the real SDK simple-menu source directly on the PC:

```powershell
.\scripts\run-simulator.ps1 `
  -AppPath C:\git\Fossil\Fossil-HR-SDK\examples\simple-menu
```

Validate the simulator server and fixture:

```powershell
.\scripts\test-simulator.ps1
```

The simulator shortens the development loop but does not replace the final WAPP build and real-watch smoke test.

The built package is copied to:

```text
dist\lionHelloApp.wapp
```

Install the `.wapp` with Gadgetbridge. A Gadgetbridge-generated `customWatchFace` must be active for app launching through `start_app`.

## Project workflow

1. Discuss architecture, scope, and diagnosis in Hungarian.
2. Use a feature branch for each implementation or documentation task.
3. Give the coding agent a short structured English prompt.
4. Search the local knowledge base before guessing.
5. Build the smallest affected app first.
6. Validate the result on the real watch.
7. Record reusable evidence in the distilled documentation.

Read `AGENTS.md` before repository work.

## Main documentation

- `docs/PROJECT-STATE.md`
- `docs/HARDWARE-PROFILE.md`
- `docs/SIMULATOR.md`
- `docs/BUILD-RUNBOOK.md`
- `docs/ARCHITECTURE.md`
- `docs/KNOWLEDGE-BASE.md`
- `docs/TROUBLESHOOTING.md`
- `docs/API-CATALOG.md`
- `docs/DECISIONS.md`
- `knowledge/VERIFIED-FACTS.md`
