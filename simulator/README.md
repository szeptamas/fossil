# Fossil Hybrid HR PC simulator

The first simulator milestone runs SDK-style `app.js` source code in a browser while a local Python server exposes the selected app's manifest, layouts, and resources.

## Run the included fixture

```powershell
.\scripts\run-simulator.ps1
```

## Run the real SDK simple-menu example

```powershell
.\scripts\run-simulator.ps1 `
  -AppPath C:\git\Fossil\Fossil-HR-SDK\examples\simple-menu
```

## Current support

- SDK-style `app.js` application object
- `init()` and `handler(event, response)`
- Fossil-style state machine aliases
- visible/hidden/background lifecycle events
- top, middle, and bottom button events
- timers
- persistence through browser local storage
- `common` data editing
- `response.draw`
- `response.move`
- `response.action`
- generic events such as `double_tap`
- 240 × 240 circular display
- physical hand overlay
- `wapp_template`
- `option_menu`
- basic text, line, rectangle, and circle nodes
- event, response, timer, and error logging

## Not yet emulated faithfully

- JerryScript snapshots
- `.wapp` package loading
- exact firmware memory limits
- all layout node types
- exact fonts and icon rendering
- E-paper refresh/ghosting
- Bluetooth timing
- power consumption
- real sensor behavior

Real-watch testing remains mandatory.


## Automated checks

`scripts/test-simulator.ps1` validates:

- Python server syntax;
- JavaScript syntax when Node.js is installed;
- runtime state-machine, button, response, action, and persistence behavior;
- HTTP status, manifest, source, layout, and page endpoints.
