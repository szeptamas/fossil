# Troubleshooting

## Gadgetbridge Start appears to do nothing

**Observed symptom**

The app is installed, but pressing Start in Gadgetbridge produces no visible result.

**Known cause**

A stock Fossil watchface is active. The launcher writes `start_app` into the Gadgetbridge custom watchface configuration.

**Resolution**

Create, install, and activate a Gadgetbridge-generated `customWatchFace`, then start the app again.

**Confidence**

Verified on the Fossil Hybrid HR Collider.

---

## The app is not found by the launcher

Check the exact identifier in:

```text
apps\<name>\build\app.json
```

The menu or launcher must use the same case-sensitive value, for example:

```text
snakeApp
testMenuApp
lionHelloApp
```

---

## Docker runs but no `.wapp` appears

A green Docker exit is not enough.

Check:

1. `build\app.json` contains the intended identifier;
2. the app has a `Makefile`;
3. `WATCH_SDK_PATH` points to `/sdk/`;
4. JerryScript `jerry-snapshot` was built successfully;
5. `apps\<name>\build\<identifier>.wapp` exists and is non-empty;
6. `dist\<identifier>.wapp` was copied freshly.

---

## `jerry-snapshot` is missing

The approved version is JerryScript `v2.1.0`.

Approved build:

```text
python3 tools/build.py --jerry-cmdline-snapshot ON
```

Do not silently substitute a newer JerryScript version.

---

## Temporary custom menu disappears after reboot

Sending the menu from Menu Companion can be temporary.

For persistence, send the menu and then generate/reinstall a Gadgetbridge custom watchface so that the menu JSON is embedded into it.

---

## Middle hold does not exit safely

Use the known working event:

```text
middle_hold
```

The simple-menu example responds with:

```text
response.go_back(true)
```

Verify on the real watch before generalizing.

---

## A test or behavior fails twice with the same theory

Stop repeating the same command or edit.

Record:

- current hypothesis;
- evidence against it;
- new hypothesis;
- smallest next discriminating test.
