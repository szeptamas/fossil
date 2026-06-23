# Fossil Hybrid HR API catalog

This catalog starts with APIs observed in the known working SDK `simple-menu` example. It is not yet a complete firmware specification.

Status labels:

- **Verified build:** compiled in a known working example.
- **Verified watch:** behavior reproduced on the real watch.
- **Observed:** present in source but not independently reproduced.
- **Hypothesis:** inferred and requires testing.

## Application object

| Member | Purpose | Status |
|---|---|---|
| `handler(event, response)` | Main event entry point | Verified build |
| `manifest.timers` | Declares timer names | Observed |
| `persist` | Persistent state container | Observed |
| `config` | Runtime configuration container | Observed |
| `init()` | Creates and wraps the state machine | Verified build |

## Events

| Event type | Meaning | Status |
|---|---|---|
| `system_state_update` | App visibility/state change | Verified build |
| `top_short_press_release` | Top button short press | Verified watch through examples |
| `middle_short_press_release` | Middle button short press | Verified watch through examples |
| `bottom_short_press_release` | Bottom button short press | Verified watch through examples |
| `middle_hold` | Middle button hold | Verified watch through examples |

## Response helpers observed in the SDK example

| Helper | Result |
|---|---|
| `move_hands(hourDegrees, minuteDegrees, relative)` | Requests hand movement |
| `go_back(killApp)` | Returns to previous context |
| `go_home(killApp)` | Returns to home/watchface |
| `draw_screen(nodeName, fullUpdate, layoutInfo)` | Draws a JSON-defined layout |
| `send_user_class_event(eventType)` | Emits a user-class event |
| `send_generic_event(eventObject)` | Adds a generic event to the response |

## Runtime functions observed

| Function | Purpose | Status |
|---|---|---|
| `state_machine(...)` | Fossil runtime state machine | Verified build |
| `localization_snprintf(...)` | Formats localized/display text | Verified build |
| `req_data(...)` | Sends data/log requests | Observed |
| `layout_parser_json` | Renders JSON layout information | Verified build |

## Research backlog

Populate from SDK docs and archived evidence:

- image formats and compression;
- persistent storage semantics;
- timer lifecycle;
- vibration/haptics;
- notifications;
- weather/data requests;
- activity and sensor access;
- app-to-Gadgetbridge communication;
- app package structure and version constraints;
- memory and package size limits.

Every addition must include a source path and confidence level.
