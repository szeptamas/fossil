# Local knowledge base

## Purpose

The local archive preserves rare Fossil Hybrid HR reverse-engineering material for future AI-assisted development.

Raw archive:

```text
C:\git\Fossil\_knowledge-archive
```

AI entry point:

```text
C:\git\Fossil\_knowledge-archive\INDEX.md
```

Verified setup note:

```text
C:\git\Fossil\_knowledge-archive\KNOWN-WORKING-SETUP.md
```

## Search order

Use the smallest reliable source first:

1. `knowledge/VERIFIED-FACTS.md`
2. `docs/PROJECT-STATE.md`
3. `docs/BUILD-RUNBOOK.md`
4. relevant source under `apps\`
5. SDK `DOCUMENTATION.md`
6. SDK working examples
7. `_knowledge-archive\INDEX.md`
8. Gadgetbridge and `fossil-hr-gbapps` source
9. archived issues, PRs, reviews, releases, and attachments
10. internet research only when local material is insufficient

## Evidence standard

For every non-trivial reverse-engineering conclusion record:

- question;
- source path;
- symbol, file, issue, or PR number;
- observed evidence;
- conclusion;
- confidence;
- real-watch verification status.

Use `knowledge/EVIDENCE-NOTE-TEMPLATE.md`.

## Confidence levels

- **Verified:** reproduced on the real watch or in a fresh successful build.
- **Strong:** directly supported by current source and multiple references.
- **Probable:** supported by one credible source but not reproduced.
- **Hypothesis:** plausible explanation requiring a focused test.

Never promote a hypothesis directly to a guardrail.

## Raw versus distilled knowledge

Do not copy the whole raw archive into Git. It is too large and noisy.

Promote a fact into this repository only when it is:

- repeatedly useful;
- evidence-backed;
- concise;
- stable enough to guide future development.

## Local index refresh

```powershell
.\scripts\refresh-knowledge-index.ps1
```

This writes a machine-local searchable file under `.local\`, which is ignored by Git.
