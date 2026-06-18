# Codex task template

```text
Goal
<one narrowly scoped result>

Context
- Repository: C:\git\Fossil\fossil
- Read AGENTS.md.
- Read docs/PROJECT-STATE.md and docs/BUILD-RUNBOOK.md.
- Use the relevant skill.

Allowed files to inspect
- <exact files/directories>
- C:\git\Fossil\Fossil-HR-SDK\<narrow reference path>
- C:\git\Fossil\_knowledge-archive\<narrow reference path, only if needed>

Allowed files to modify
- <exact files>

Forbidden changes
- Do not modify upstream repositories.
- Do not touch unrelated apps.
- Do not rename app identifiers or public interfaces.
- Do not add dependencies.
- Do not edit AGENTS.md or skills.
- Do not perform unrelated refactors.
- Do not merge.

Implementation notes
- Keep the diff minimal.
- Reuse the known working Fossil HR patterns.
- Preserve JerryScript v2.1.0 compatibility.

Acceptance criteria
- <objective source/build criteria>
- The expected .wapp exists and is non-empty.

Manual tests
1. <Gadgetbridge step>
2. <watch step>
3. <button/exit behavior>

Validation
- Run the smallest affected build/check.
- Do not claim real-watch success; report manual steps for the user.

Git
- Create/use a feature branch.
- Commit and push only when required validation passes.
- Do not merge.

Response style
- Be concise.
- Report branch, commit, changed files, validation, artifact path, and manual tests.
- No long explanation.
```
