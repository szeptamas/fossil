import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { FossilRuntime } from "../wwwroot/fossil-runtime.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.resolve(here, "../fixtures/simple-menu-demo");
const source = await readFile(path.join(fixture, "app.js"), "utf8");
const manifest = JSON.parse(
  await readFile(path.join(fixture, "build/app.json"), "utf8")
);

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }
}

globalThis.localStorage = new MemoryStorage();

const moves = [];
const responses = [];
const actions = [];
const logs = [];

const runtime = new FossilRuntime({
  onMoveHands: move => moves.push(move),
  onResponse: response => responses.push(response),
  onAction: action => actions.push(action),
  onLog: entry => logs.push(entry),
});

await runtime.load(source, manifest);

assert.equal(runtime.app.node_name, "simulatorDemoApp");
assert.equal(runtime.app.state_machine.n, "menu");
assert.equal(runtime.app.selected_option, 0);
assert.deepEqual(moves.at(-1), { h: 270, m: 90, is_relative: false });
assert.ok(responses.at(-1).draw);

runtime.dispatch("bottom_short_press_release");
assert.equal(runtime.app.selected_option, 1);
assert.ok(responses.at(-1).draw);

runtime.dispatch("middle_short_press_release");
assert.equal(runtime.app.options[1], "Selected 2");

runtime.dispatch("middle_hold");
assert.deepEqual(actions.at(-1), { type: "go_back", Se: true });

const restored = new FossilRuntime();
await restored.load(source, manifest);
assert.equal(restored.app.selected_option, 1);

assert.ok(logs.some(entry => entry.kind === "event"));
assert.ok(logs.some(entry => entry.kind === "response"));

console.log("Runtime smoke test passed.");
