---
name: fossil-hr-evidence-first-validation
description: Use for Fossil HR Docker builds, JerryScript snapshot failures, WAPP packaging, Gadgetbridge installation, app launching, or real-watch smoke testing.
---

# fossil-hr-evidence-first-validation

Use `$fossil-hr-evidence-first-validation`.

## Truth hierarchy

1. Fresh real-watch result.
2. Fresh non-empty expected `.wapp`.
3. Successful app-specific build output.
4. Current source and local documentation.
5. Archived discussion.
6. Memory or hypothesis.

## Validation flow

- Inspect and classify the failure.
- Form one concrete hypothesis.
- Run the smallest environment or app check.
- Build only the affected app.
- Verify the exact output path, identifier, timestamp, and non-zero size.
- Install through Gadgetbridge.
- Ensure a Gadgetbridge-generated `customWatchFace` is active.
- Run focused button, exit, and return-to-watchface checks.
- Record reusable evidence.

## Prohibited claims

- Do not call a build green without the expected fresh `.wapp`.
- Do not claim installation without Gadgetbridge evidence.
- Do not claim watch behavior without a fresh user result.
- Do not commit or push while required validation is failing.

## References

- [Validation workflow](references/validation-workflow.md)
- [Failure classification](references/failure-classification.md)
