---
name: fossil-hr-simulator-development
description: Use for Fossil Hybrid HR PC simulator runtime, layout rendering, event compatibility, fixtures, simulator tests, or source-mode app debugging.
---

# fossil-hr-simulator-development

Use `$fossil-hr-simulator-development`.

## Scope

- `simulator/`
- `scripts/run-simulator.ps1`
- `scripts/test-simulator.ps1`
- `docs/SIMULATOR.md`
- directly related tests and fixtures

## Core rules

- Keep simulator behavior evidence-based.
- Match SDK event and response shapes before adding convenience APIs.
- Do not claim firmware fidelity for unsupported behavior.
- Keep source-mode execution separate from future WAPP/JerryScript snapshot execution.
- Add one layout node type or runtime API family per focused task.
- Preserve the included fixture as a deterministic smoke test.
- Do not modify upstream SDK examples.
- Treat real-watch behavior as the final source of truth.

## Validation

1. Parse all Python files.
2. Run JavaScript syntax checks when Node.js is available.
3. Start the server with the included fixture.
4. Verify status, manifest, source, layout, and index endpoints.
5. For visual/runtime changes, load the real SDK simple-menu manually.
6. Do not claim watch compatibility without a fresh watch test.

## References

- [Compatibility matrix](references/compatibility-matrix.md)
- [Known fidelity gaps](references/known-fidelity-gaps.md)
