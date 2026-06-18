---
name: fossil-hr-project-guardrails
description: Use for Fossil Hybrid HR repository tasks involving Git workflow, scope control, repository boundaries, app identifiers, product direction, or feature handoff.
---

# fossil-hr-project-guardrails

Use `$fossil-hr-project-guardrails`.

## Use when

- Planning or reviewing a feature branch.
- Creating or modifying a watch application.
- Deciding whether a change belongs in this repo or an upstream reference.
- Checking if a task is too broad.

## Core rules

- Keep the diff minimal and focused.
- Preserve stable app identifiers.
- Work on one app or one infrastructure concern per task.
- Keep upstream repositories read-only.
- Do not mix app behavior, global tooling, knowledge curation, and skill changes unless requested.
- Do not add dependencies without explicit approval.
- Do not merge unless explicitly instructed.
- Use Hungarian for planning and short structured English for coding-agent prompts.

## References

- [Project boundaries](references/project-boundaries.md)
- [Recurring failures](references/recurring-failures.md)
- [Product decisions](references/product-decisions.md)

## Handoff

For builds, Gadgetbridge installation, or real-watch testing, also use `fossil-hr-evidence-first-validation`.

For undocumented behavior or archive research, also use `fossil-hr-local-research`.

## Candidate reusable lessons

Include candidate lessons only when new reusable evidence was found.

Each candidate must contain:

- evidence;
- confidence;
- proposed destination.

Never edit `AGENTS.md` or skills automatically.
