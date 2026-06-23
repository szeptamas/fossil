# Lion Flappy

Flappy Bird-style Fossil Hybrid HR game.

## v0.16 changes

Small safe polish pass:
- changes gameplay label to "Score:"
- changes game-over labels to "Score:" and "Highscore:"
- lengthens the crash pause
- prevents short-press skipping during the crash pause
- leaves graphics, layout primitives, collision, scoring, physics, controls, and pipe geometry unchanged
- leaves persist.version unchanged because stored data schema is unchanged
## v0.15 changes

Keeps the v0.14 fixes and adds visual fine-tuning to the pipes:

- full-width lips/caps still stay visible on partial pipes
- lip/cap is 2 px wider
- inner white highlight is narrower and less dominant
- right-side shadow is slightly stronger
- overall pipe silhouette stays close to v13/v14, but reads more like the original Flappy Bird style

## Controls

- top / middle / bottom short press: flap, start, restart
- short press during crash pause: skip to Game Over
- middle hold: exit
## v0.17 changes

Small safe visual pass:
- adds a scrolling wave-like ground detail
- uses only supported solid layout nodes
- keeps background, pipes, bird, labels, collision, scoring, physics, and controls unchanged