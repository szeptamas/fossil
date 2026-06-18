# Scripts

| Script | Purpose |
|---|---|
| `check-environment.ps1` | Checks Docker and external Fossil-specific paths |
| `new-app.ps1` | Copies the known working SDK simple-menu template |
| `build-app.ps1` | Builds one app with Docker and local JerryScript v2.1.0 source |
| `build-all.ps1` | Builds every valid app under `apps\` |
| `install-app.ps1` | Optionally pushes and broadcasts a `.wapp` through ADB |
| `refresh-knowledge-index.ps1` | Creates a machine-local file index for the raw archive |
| `test-repository.ps1` | Parses PowerShell files and validates app manifests and generated-output hygiene |

Scripts must not modify upstream repositories.
