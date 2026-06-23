# Simulator layout fidelity

The PC simulator is not a creative rendering engine. Its job is to approximate the real Fossil Hybrid HR runtime as closely as practical.

This means the simulator should only render layout node types and behavior that are known or intentionally assumed to be compatible with the Fossil Hybrid HR layout/runtime model. If an application layout contains an unsupported node type, the simulator should keep surfacing it as an unsupported node instead of silently inventing behavior.

## Supported layout node types

The simulator renderer currently has explicit handling for these top-level layout node types:

- `container`
- `solid`
- `wapp_template`
- `option_menu`
- `text`
- `text_box`
- `label`
- `line`
- `rectangle`
- `rect`
- `circle`

The repository validation script enforces this list for top-level nodes in app and simulator fixture layout JSON files.

## Important distinction

Only top-level layout node `type` values are validated as node types.

Nested values such as:

```json
"placement": {
  "type": "absolute"
}
```

are placement metadata, not layout node types. They must not be confused with actual node types.

## Unsupported node handling

Unknown layout node types should remain visible as simulator warnings/errors. This is useful because it helps catch layouts that may not be compatible with the real watch runtime.

Do not add custom PC-only node types such as `pixel_sprite` unless there is evidence that the real Fossil Hybrid HR runtime supports the same layout construct.

## Visual design rule

Lion Flappy and other watch apps should use only supported Fossil-compatible layout primitives unless the simulator fidelity documentation and tests are updated with evidence that additional primitives are valid.

For retro graphics, prefer combinations of existing primitives such as `solid`, `line`, `rectangle`, and `text` over PC-only rendering extensions.