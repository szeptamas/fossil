# Fossil Hybrid HR guardrails

- `main` is stable; never implement directly on `main`.
- Use a feature branch for every implementation, tooling, research, or documentation task.
- The coding agent may commit and push the feature branch.
- Do not merge unless explicitly instructed.
- Keep diffs minimal and avoid unrelated refactors.
- Work on one watch app or one infrastructure concern per task.
- Do not rename app identifiers or public interfaces unless explicitly required.
- Do not add dependencies unless explicitly requested.
- Treat all upstream repositories under `C:\git\Fossil` as read-only references.
- Do not commit copied upstream repositories, the raw `_knowledge-archive`, generated build directories, APKs, or `.wapp` outputs.
- Preserve compatibility with the known working Fossil Hybrid HR toolchain unless the task explicitly changes it.
- Plan and explain in Hungarian; final coding-agent prompts must be short, structured English.
- Every coding prompt must define: Goal, Allowed files, Forbidden changes, Implementation notes, Acceptance criteria, Manual tests, and Response style.
- Search local evidence before guessing: distilled docs, relevant app, SDK docs/examples, `_knowledge-archive`, Gadgetbridge, then archived issues/PRs.
- Classify failures before changing production code or tests.
- A successful Docker command proves a build only when the expected fresh `.wapp` exists and is non-empty.
- Do not claim installation or watch behavior passed without a fresh real-device result from the user.
- Do not commit or push while required validation is failing.
- After two failed attempts with the same hypothesis, stop and change the hypothesis.
- New reusable lessons are candidates only; do not silently rewrite `AGENTS.md` or skills.
- Skill updates require an explicit task.

## Required context

Read these before substantial work:

1. `docs/PROJECT-STATE.md`
2. `docs/BUILD-RUNBOOK.md`
3. The relevant app under `apps/`
4. The matching skill under `.agents/skills/`
5. `docs/KNOWLEDGE-BASE.md` for research-heavy tasks

## Simulator tasks

For PC simulator runtime, layout rendering, fixtures, or simulator validation, use:

```text
$fossil-hr-simulator-development
```

Keep simulator claims explicitly separated from firmware and real-watch evidence.
