# Failure classification

- **A — Source defect:** app code or package content is wrong.
- **B — Toolchain defect:** Docker, JerryScript, Python, `jq`, `make`, or packaging failed.
- **C — Manifest/package mismatch:** identifier, package name, expected output, or app files disagree.
- **D — Installation/launcher issue:** Gadgetbridge import, exact identifier, or custom watchface state is wrong.
- **E — Runtime/watch issue:** package installs but behavior fails on the real watch.
- **F — Environmental/transient issue:** network package install, USB/ADB, Docker daemon, or temporary host problem.
- **G — Stale evidence:** old `.wapp`, old log, cached watchface, or previously generated menu is being observed.

Fix the classified cause. Do not rewrite tests or production code before classification.
