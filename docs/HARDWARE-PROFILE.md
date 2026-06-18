# Fossil Hybrid HR Collider hardware profile

Last reviewed: 2026-06-18

This document separates development-relevant facts from unverified marketing or AI-generated specifications.

## Confidence labels

- **Verified on watch:** reproduced on the user's real Fossil Hybrid HR Collider.
- **Strong source evidence:** supported by the SDK, Gadgetbridge behavior, or multiple consistent technical sources.
- **Probable:** widely reported and consistent with observed behavior, but not yet tied to an authoritative hardware document.
- **Unverified:** plausible, but must not guide hard limits or architecture decisions yet.
- **Incorrect or misleading:** internally inconsistent or technically oversimplified.

## Development-relevant hardware profile

| Property | Current status | Development consequence |
|---|---|---|
| Circular, always-visible, monochrome low-power display | Strong source evidence | Design for high contrast, sparse updates, and a circular safe area. |
| Logical application canvas of 240 × 240 pixels | Strong source evidence | Use 240 × 240 layouts, but avoid relying on the extreme corners because the physical display is circular. |
| Physical analog hour and minute hands over the display | Verified on watch | Important content can be obscured; applications may reposition the hands using the runtime response API. |
| No touchscreen | Verified on watch | All interaction must use buttons, timed events, or phone-side interaction. |
| Three physical side buttons | Verified on watch | Primary app input is top, middle, and bottom button events. |
| Front illumination triggered by double tap | Verified on watch as user-facing behavior | Do not assume the tap is exposed to custom apps as an input event. |
| Haptic vibration, no useful app speaker output | Probable | Prefer visual and haptic feedback; do not design around sound. |
| Optical heart-rate sensor | Strong product-level evidence | Sensor presence does not imply that custom WAPP code can access raw HR data. API exposure must be researched separately. |
| Motion sensor / accelerometer | Strong product-level evidence | Used by system features; custom app access must be proven before use. |
| Bluetooth Low Energy phone connection | Strong source evidence | Data exchange and installation are mediated through the phone and Gadgetbridge. |
| Very constrained embedded runtime | Verified indirectly by toolchain and WAPP format | Keep code, assets, retained state, and redraw frequency small even before exact memory limits are known. |

## Display details

### Resolution

The SDK examples and layouts consistently use a 240 × 240 coordinate space. Treat this as the logical framebuffer for app design.

### Physical size and pixel density

The commonly repeated value is approximately 1.1 inches for the display. The frequently copied claim of **218 ppi** is inconsistent with a 240 × 240 square pixel grid and a 1.1-inch diagonal:

```text
sqrt(240² + 240²) / 1.1 ≈ 309 ppi
```

Therefore:

- 240 × 240 is usable as a development fact;
- 1.1 inches is probable product information;
- 218 ppi should not be stored as a verified specification.

### Refresh behavior

The display is commonly described as E-ink or electronic paper. The statement that it “uses power only when the image changes” is misleading for the whole watch:

- the display panel may retain an image with very low or no panel-drive power;
- the microcontroller, Bluetooth radio, sensors, hands, storage, and firmware still consume power;
- frequent redraws and lighting still affect battery use.

Development guidance:

- avoid animation-like continuous redraws;
- prefer partial updates where supported;
- design for possible ghosting;
- batch visual changes;
- keep static content visible without unnecessary refresh.

### Circular safe area

Although the coordinate system is 240 × 240, the visible dial is circular and is crossed by physical hands.

Until a measured safe-area mask is documented:

- keep essential text and controls near the center;
- treat corners as non-essential;
- avoid small text under normal hand positions;
- deliberately move hands when the app needs an unobstructed screen.

## Input hardware

Known working event names from SDK examples include:

```text
top_short_press_release
middle_short_press_release
bottom_short_press_release
middle_hold
```

The glass double tap used for illumination should not be assumed to be a touchscreen gesture. It is more likely detected through motion/tap sensing, but the exact hardware path is unverified.

## Memory, storage, processor, and battery

The following values appeared in an AI-generated Google answer but are **not yet verified strongly enough to become architectural limits**:

| Claim | Status | Why it is not yet trusted |
|---|---|---|
| 256 KB RAM | Unverified | Could be total MCU SRAM, one memory region, or a copied value from a possible chipset; it is not proven to be WAPP-available memory. |
| 16 MB flash | Unverified | Could describe external flash or total storage; it does not prove the space available to custom apps. |
| 55 mAh battery | Unverified | Plausible for the form factor but needs teardown, regulatory, or service evidence. |
| Bluetooth 5.0 exactly | Probable but unverified | BLE is certain; the exact controller/version is not yet important to WAPP design. |
| “Custom microcontroller” | Misleading | The exact MCU should be identified by component evidence, firmware, FCC internal photographs, or teardown data rather than described generically. |
| 50–60 minutes to 80%, 80–90 minutes to 100% | Unverified | Charging time varies by charger, battery age, temperature, and firmware. |
| 2–3 week runtime | Product-level expectation, not a hard development fact | Real runtime depends heavily on HR sampling, notifications, light usage, redraw frequency, battery health, and app behavior. |

## Rules for application development

Until exact limits are proven:

- do not allocate or embed large assets casually;
- do not infer available WAPP memory from total device RAM;
- do not infer app storage quota from total flash;
- prefer compact JavaScript and JSON;
- reuse assets;
- avoid rapid repeated full-screen redraws;
- test package size changes;
- validate long-running timers and retained state on the real watch;
- treat sensor access as unavailable until an API and watch test prove otherwise.

## Hardware research backlog

High-value open questions:

1. Exact MCU and radio SoC.
2. Internal and external RAM/flash components.
3. WAPP heap, stack, package, and asset limits.
4. Display controller and supported grayscale/bit depth.
5. Full versus partial refresh behavior and ghosting.
6. Exact visible circular mask and safe area.
7. Battery part number and rated capacity.
8. Accelerometer and PPG component models.
9. Which sensor values are exposed to WAPP code.
10. Whether illumination/tap events are exposed to applications.
11. Maximum reliable BLE payload and app data-request behavior.
12. Power impact of timers, redraws, vibration, hand motion, and phone requests.

Each answer must be recorded with:

- exact source path or regulatory document;
- component marking or source symbol;
- confidence;
- whether it was reproduced on the real watch.

Use `knowledge/EVIDENCE-NOTE-TEMPLATE.md`.
