# Recurring failures

- Attempting app launch while a stock Fossil watchface is active.
- Using an identifier that does not exactly match `build\app.json`.
- Treating Docker exit code alone as proof that the package was created.
- Building with a JerryScript version other than `v2.1.0`.
- Modifying upstream SDK examples instead of copying them into the original-app repo.
- Mixing tooling changes with app behavior changes.
- Repeating the same failed hypothesis without new evidence.
- Promoting archived discussion claims to verified facts without a build or watch test.
- Losing temporary Menu Companion configuration after reboot because it was not embedded in a regenerated custom watchface.
