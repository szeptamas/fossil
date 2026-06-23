# Lion Flappy

Flappy Bird-style Fossil Hybrid HR game.

## v0.10 changes

- first pipe pair is intentionally easy:
  - starts farther away
  - centered gap
  - larger first gap
- lower pipes now reach the floor line
- upper pipes reach the ceiling line
- pipe lips/caps return near the gap, but do not extend past floor/ceiling
- bird has a small eye and animated wing

## Controls

- top / middle / bottom short press: flap, start, restart
- short press during crash pause: skip to Game Over
- middle hold: exit

## Simulator

```powershell
.\scripts\run-simulator.ps1 -AppPath .\apps\lion-flappy
```

## Build

```powershell
.\scripts\build-app.ps1 -App lion-flappy
```
