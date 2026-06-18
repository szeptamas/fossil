# Fossil Hybrid HR Collider hardware profile

Last reviewed: 2026-06-18

This document distinguishes:

1. Fossil's public product description;
2. behavior verified on the real watch;
3. technical evidence from the Fossil HR SDK and Gadgetbridge;
4. plausible but still unverified internal specifications.

Do not treat a value as a hard application limit unless its source and scope are known.

## Confidence and source labels

- **Official public description:** stated on a Fossil-branded Hybrid HR product page.
- **Verified on this watch:** reproduced on the user's Fossil Hybrid HR Collider.
- **Technical evidence:** supported by SDK layouts, Gadgetbridge, package format, or working applications.
- **Inferred:** strongly suggested by behavior, but the exact component or API is not documented.
- **Unverified:** no sufficiently authoritative evidence has been preserved yet.
- **Incorrect or misleading:** conflicts with stronger evidence, official wording, or basic calculation.

## Confirmed product-level characteristics

| Property | Source status | Development consequence |
|---|---|---|
| Dynamic readout display combined with real mechanical hour and minute hands | Official public description; verified on watch | Important content may be covered by the hands. Move the hands when an app needs an unobstructed display. |
| Readable indoors and outdoors, day or night | Official public description | Use high-contrast layouts; do not design around a luminous colour display. |
| Heart-rate sensor | Official public description | Sensor presence does not prove that custom WAPP code can access live or raw heart-rate data. |
| Step, sleep and workout tracking | Official public description | These features imply motion sensing, but do not identify the accelerometer or prove WAPP sensor access. |
| Programmable pushers | Official public description; verified on watch | The three side controls are the primary application input. |
| Notifications, music control, weather and phone-linked features | Official public description | Phone-side communication is central to the platform. |
| iPhone and Android compatibility | Official public description | Do not assume standalone network services on the watch. |
| Advertised battery life of 2+ weeks, usage dependent | Official public description | Avoid needless redraws, radio requests, hand movements and vibration. |
| Advertised charging time under one hour | Official public description | The earlier claim of 80–90 minutes for a full charge is not the official specification. |

## Display and layout

### Official terminology

Fossil's preserved public description calls it a:

```text
Dynamic Readout Display
```

and describes it as readable outdoors or indoors, day or night.

The official page examined does **not** state:

- E-ink or electrophoretic panel technology;
- display diameter;
- pixel resolution;
- pixel density;
- grayscale or bit depth;
- display-controller model.

Therefore, use “dynamic readout display” when describing the official specification.

“E-ink” or “e-paper” may still be a useful technical description, but it remains a non-official classification until supported by teardown, component or firmware evidence.

### Logical application canvas

The known SDK menu layouts use a rigid:

```text
240 × 240
```

coordinate system.

This is strong technical evidence for the logical WAPP canvas, but it is **not a published Fossil hardware specification**.

Development rule:

- design layouts in a 240 × 240 coordinate space;
- remember that the physical visible area is circular;
- do not place essential information in the square's extreme corners;
- account for the physical hands.

### Physical size and PPI

The previously copied pair:

```text
1.1 inch
218 ppi
```

must not be treated as verified.

It is internally inconsistent if 1.1 inch is the diagonal of a 240 × 240 square pixel area:

```text
sqrt(240² + 240²) / 1.1 ≈ 309 ppi
```

Current status:

- display size: unverified;
- 218 ppi: reject as an established fact;
- 240 × 240 logical canvas: retain as SDK-derived evidence.

### Refresh and power behavior

It is misleading to say that “the watch consumes power only when the image changes.”

Even if the panel retains an image with very low panel-drive power, the following still consume energy:

- processor and memory;
- Bluetooth communication;
- heart-rate and motion sensing;
- physical hand movement;
- illumination;
- vibration;
- firmware timers and background work.

Development guidance:

- avoid animation-like redraw loops;
- batch visual changes;
- prefer partial updates when proven reliable;
- expect possible ghosting until measured;
- keep static screens stable;
- test long-running apps on the real watch.

## Input and physical interaction

### Verified controls

The watch has three physical side controls. Known working SDK event names include:

```text
top_short_press_release
middle_short_press_release
bottom_short_press_release
middle_hold
```

These event names are SDK/runtime evidence, not Fossil marketing terminology.

### Touch and illumination

- The display is not a touchscreen, verified on this watch.
- Double tapping the glass activates illumination, verified on this watch.
- Do not assume that the illumination double tap is exposed as a WAPP input event.
- The exact tap-detection component and firmware path remain unverified.

### Vibration and audio

- Vibration behavior is present and is also used by Fossil setup guidance.
- No useful speaker/audio output has been observed on this watch.
- The official Hybrid HR page examined does not publish a speaker specification.

Keep these as separate facts rather than the combined claim “haptic motor, no speaker.”

## Sensors

### Heart rate

Officially confirmed:

```text
Heart Rate Sensor
```

Not officially confirmed in the preserved public description:

- optical PPG terminology;
- sensor manufacturer or model;
- raw sampling rate;
- direct WAPP access.

The optical/PPG interpretation is physically plausible and likely, but should be labeled technical/observational rather than official.

### Motion sensing

Fossil officially advertises:

- step counting;
- sleep statistics;
- automatic workout start.

A motion sensor is therefore strongly implied. However, the examined official description does not explicitly name a three-axis accelerometer.

Current status:

- motion sensing: functionally confirmed;
- three-axis accelerometer: inferred;
- component model: unverified;
- custom WAPP access: unverified.

### GPS wording

Fossil advertises “Activity & GPS Tracking,” but this wording does not prove an onboard GPS receiver.

Do not add “built-in GPS” to the hardware profile without component, regulatory or firmware evidence. Treat GPS as phone-assisted unless stronger evidence is found.

## Connectivity

Phone connectivity is certain from the product behavior and Gadgetbridge integration.

The preserved official page confirms phone compatibility but does not publish:

- Bluetooth Low Energy wording;
- Bluetooth 5.0;
- controller model;
- supported PHY or packet limits.

Development status:

- BLE communication: strong technical evidence from the integration stack;
- Bluetooth 5.0 exactly: unverified;
- WAPP payload and timing limits: research required.

## Processor, RAM and storage

Fossil's public Hybrid HR description examined does not publish the MCU, RAM or flash capacity.

The following copied values must remain unverified:

| Claim | Status | Reason |
|---|---|---|
| 256 KB RAM | Unverified | It may refer to a candidate MCU's total SRAM, not memory available to a WAPP or JerryScript heap. |
| 16 MB flash | Unverified | It may refer to total external storage and does not establish application quota. |
| “Custom low-power microcontroller” | Too vague | Identify the actual MCU from teardown, component markings, regulatory files or firmware evidence. |

Never use total device memory as the WAPP memory limit.

The runtime is clearly constrained compared with a Wear OS watch, but exact limits must be measured:

- maximum package size;
- code snapshot size;
- asset size;
- JerryScript heap;
- persistent-storage quota;
- stack and timer limits.

## Battery and charging

Official public claims preserved:

```text
2+ weeks between charges
charges in under an hour
usage dependent
```

Not officially established:

| Claim | Status |
|---|---|
| 55 mAh battery capacity | Unverified |
| 50–60 minutes from 0% to 80% | Unverified |
| 80–90 minutes from 0% to 100% | Conflicts with the preserved official “under an hour” claim |
| 3 weeks as a guaranteed runtime | Not official; may occur under light use |

Use the 2+ week value only as an advertised expectation, never as a validation requirement.

## Summary of corrections to the earlier profile

### Keep

- mechanical hands over the display;
- 240 × 240 logical WAPP canvas;
- circular safe-area guidance;
- three physical controls;
- no touchscreen;
- double-tap illumination as watch-verified behavior;
- heart-rate functionality;
- phone-mediated connectivity;
- constrained-runtime development rules;
- exact internals marked unverified.

### Reword

- “E-ink display” → official wording is “dynamic readout display”; E-ink remains a technical hypothesis/common description.
- “optical heart-rate sensor” → official wording is “heart-rate sensor”; optical PPG details need separate evidence.
- “three-axis accelerometer” → motion sensing is confirmed by functions; exact sensor is inferred.
- “Bluetooth 5.0 LE” → phone/BLE integration is technically supported; exact Bluetooth version is not official.

### Correct

- Add the official “charges in under an hour” claim.
- Store battery life as “2+ weeks, usage dependent.”
- Do not store 3 weeks as an official value.
- Reject 218 ppi as an established specification.
- Do not treat 1.1 inches, 256 KB RAM, 16 MB flash or 55 mAh as verified.

## Hardware research backlog

1. Exact MCU and radio SoC.
2. Internal and external RAM/flash components.
3. WAPP heap, stack, package and asset limits.
4. Display panel and display-controller model.
5. Display bit depth and partial-refresh behavior.
6. Exact visible circular mask and measured safe area.
7. Battery part number and rated capacity.
8. Accelerometer and heart-rate sensor component models.
9. Sensor values actually exposed to WAPP code.
10. Whether illumination/tap events are exposed to applications.
11. BLE payload, timing and retry limits.
12. Power cost of redraws, timers, vibration, radio requests and hand movement.
13. Whether any onboard GPS hardware exists.

## Evidence sources to preserve locally

Official product description:

- Fossil-branded regional Hybrid HR page, reviewed 2026-06-18.
- Relevant statements: dynamic readout display, mechanical hands, programmable pushers, heart-rate sensor, 2+ weeks battery, under-one-hour charging, wellness features and phone compatibility.

Technical sources:

```text
C:\git\Fossil\Fossil-HR-SDK\examples\simple-menu\build\files\layout\menu_layout
C:\git\Fossil\Fossil-HR-SDK\examples\simple-menu\app.js
C:\git\Fossil\Gadgetbridge
C:\git\Fossil\fossil-hr-gbapps
C:\git\Fossil\_knowledge-archive
```

Use `knowledge\EVIDENCE-NOTE-TEMPLATE.md` for each future hardware conclusion.
