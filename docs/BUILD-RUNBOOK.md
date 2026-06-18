# Build and installation runbook

This file contains only the currently approved workflow. Update it only after a real successful result.

## 1. Environment check

```powershell
cd C:\git\Fossil\fossil
.\scripts\check-environment.ps1
```

Repository syntax and manifest validation:

```powershell
.\scripts\test-repository.ps1
```

Expected external paths:

```text
C:\git\Fossil\Fossil-HR-SDK
C:\git\Fossil\jerryscript
C:\git\Fossil\_knowledge-archive
```

Docker Desktop must be running.

## 2. Create an app from the known working SDK template

```powershell
.\scripts\new-app.ps1 `
  -Name lion-hello `
  -Identifier lionHelloApp `
  -Title "Lion Hello"
```

The generator copies SDK `examples\simple-menu`, removes generated files, updates `build\app.json`, and replaces the menu title.

Identifiers must:

- contain only letters and digits;
- start with a letter;
- end in `App`;
- remain stable after release.

## 3. Build one app

```powershell
.\scripts\build-app.ps1 -App lion-hello
```

The script:

1. mounts this repository, the SDK, and local JerryScript source into Ubuntu 20.04;
2. installs common build dependencies;
3. builds JerryScript v2.1.0 locally;
4. sets `WATCH_SDK_PATH=/sdk/`;
5. runs `make clean` and `make build`;
6. verifies the expected `.wapp`;
7. copies it to `dist\`.

Success requires a fresh, non-empty file:

```text
dist\<identifier>.wapp
```

## 4. Build all applications

```powershell
.\scripts\build-all.ps1
```

Only directories containing both `Makefile` and `build\app.json` are built.

## 5. Install with Gadgetbridge

Manual installation remains the simplest trusted route:

1. copy the `.wapp` to the Android phone;
2. open it with Gadgetbridge;
3. confirm installation;
4. activate a Gadgetbridge-generated `customWatchFace`;
5. start the exact app identifier from App Manager or the custom menu.

Optional ADB installation:

```powershell
.\scripts\install-app.ps1 -Wapp .\dist\lionHelloApp.wapp
```

The default Gadgetbridge import path is configurable in the script parameters because Android storage paths may differ.

## 6. Real-watch validation

Minimum manual test:

1. application appears in Gadgetbridge App Manager;
2. exact identifier is correct;
3. application starts from the active Gadgetbridge custom watchface;
4. top, middle, and bottom button behavior matches the task;
5. middle hold exits safely;
6. watchface returns correctly;
7. no reboot or persistent broken state occurs.

Record the result in `docs/APP-CATALOG.md`.

## Known limitation

The Docker script installs common packages from normal internet repositories. The Fossil-specific sources remain local. This is intentional: common tools are replaceable; the rare Fossil HR material is preserved separately.
