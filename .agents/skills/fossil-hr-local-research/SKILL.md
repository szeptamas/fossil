---
name: fossil-hr-local-research
description: Use for Fossil Hybrid HR SDK, WAPP format, runtime API, Gadgetbridge, custom watchface, button event, persistence, or protocol questions that require evidence from the local archive.
---

# fossil-hr-local-research

Use `$fossil-hr-local-research`.

## Use when

- An API or event is undocumented.
- The SDK example and Gadgetbridge behavior appear inconsistent.
- A feature requires reverse-engineering evidence.
- Archived issues or PRs may contain the missing explanation.

## Search order

1. `knowledge/VERIFIED-FACTS.md`
2. `docs/`
3. relevant original app
4. SDK documentation and examples
5. `_knowledge-archive\INDEX.md`
6. Gadgetbridge and `fossil-hr-gbapps`
7. archived issues, PRs, releases, and attachments
8. internet only when local evidence is insufficient

## Output contract

Return:

- exact research question;
- evidence table with paths and symbols;
- facts;
- inferences;
- hypotheses;
- unknowns;
- confidence;
- smallest real-watch experiment;
- candidate reusable lesson and destination.

## Restrictions

- Default to read-only research.
- Do not modify code unless the task explicitly asks for implementation.
- Do not treat old archived discussion as verified runtime truth.
- Do not silently update skills or guardrails.

## References

- [Search map](references/search-map.md)
- [Evidence quality](references/evidence-quality.md)
