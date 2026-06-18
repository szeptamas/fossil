# Validation workflow

- Check Docker, SDK path, JerryScript path, app manifest, and Makefile.
- Run `scripts\check-environment.ps1`.
- Build one app with `scripts\build-app.ps1 -App <name>`.
- Verify `dist\<identifier>.wapp` exists and is non-empty.
- Check the file is fresh for the current build.
- Install through Gadgetbridge.
- Activate a Gadgetbridge-generated custom watchface.
- Launch the exact identifier.
- Test only the behavior affected by the task.
- Test middle-hold exit and watchface return.
- Record the watch result in `docs\APP-CATALOG.md`.
- After two failed attempts with the same approach, stop and change the hypothesis.
