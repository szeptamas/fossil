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
## v0.18 changes

Small safe bird pass:
- adds a few supported solid details to the bird
- adds subtle velocity-based bird pose offsets
- keeps bird collision size unchanged
- keeps background, pipes, ground, labels, collision, scoring, physics, and controls unchanged
## v0.19 changes

Small safe pipe pass:
- adds subtle light highlights to pipe bodies and caps
- uses only supported solid layout nodes
- keeps pipe geometry, collision, scoring, physics, controls, bird, ground, and labels unchanged
## v0.20 changes

Small safe bird proportion pass:
- slightly adjusts the existing bird body, wing, eye, and beak proportions
- uses only existing supported solid layout nodes
- keeps bird collision size unchanged
- keeps background, pipes, ground, labels, collision, scoring, physics, and controls unchanged
## v0.21 changes

Small safe bird detail pass:
- nudges beak, eye, tail, and crest positions by 1 pixel
- keeps all layout node types Fossil-compatible
- keeps bird collision size unchanged
- keeps background, pipes, ground, labels, collision, scoring, physics, and controls unchanged
## v0.22 changes

Small safe bird pose pass:
- nudges wing, beak, and tail x positions by bird movement state
- makes up/down/crash poses slightly more readable
- keeps all layout node types Fossil-compatible
- keeps bird collision size unchanged
- keeps background, pipes, ground, labels, collision, scoring, physics, and controls unchanged
## v0.23 changes

Small safe title pass:
- shows the current Highscore on the title screen
- uses only supported 	ext layout nodes
- keeps gameplay, graphics, collision, scoring, physics, and controls unchanged
## v0.24 changes

Small safe result-label pass:
- changes the Game Over result label from "Score:" to "Last score:"
- keeps the in-game HUD label as "Score:"
- keeps title screen, gameplay, graphics, collision, scoring, physics, and controls unchanged
## v0.25 changes

Small safe Game Over panel pass:
- makes the lower Game Over result panel slightly taller
- gives Last score, Highscore, and Press Any Button more deliberate spacing
- keeps title screen, gameplay, graphics, collision, scoring, physics, and controls unchanged
## v0.26 changes

Small safe title panel pass:
- makes the lower title panel slightly taller
- groups Highscore and Press Any Button more consistently
- keeps gameplay, graphics, collision, scoring, physics, and controls unchanged
## v0.27 changes

Full inverted visual pass:
- inverts all explicit black/white layout colors
- assigns explicit colors to drawable nodes that previously relied on defaults
- adds an explicit full black background
- applies consistently to title, gameplay, crash, and Game Over screens
- uses only supported layout primitives
- keeps collision, scoring, physics, and controls unchanged
## v0.28 changes

Small safe inverted-bird pass:
- makes the bird slightly larger and more readable on the black gameplay background
- keeps dark eye and wing details for contrast
- uses only supported solid layout nodes
- keeps title, Game Over, pipes, ground, collision, scoring, physics, and controls unchanged
## v0.29 changes

Small safe score panel pass:
- moves the in-game Score panel slightly down from the circular display edge
- keeps the inverted black panel / light text style
- keeps title, Game Over, bird, pipes, ground, collision, scoring, physics, and controls unchanged
## v0.30 changes

Small safe score HUD simplification:
- removes the separate in-game Score background panel
- keeps only the light Score text on the black gameplay background
- moves the Score text slightly down to avoid overlap with the ceiling line
- keeps title, Game Over, bird, pipes, ground, collision, scoring, physics, and controls unchanged