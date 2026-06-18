# Decision log

## 2026-06-17 — Use a separate original-app repository

**Decision**

Original Fossil HR applications live in `szeptamas/fossil`.

**Reason**

Upstream SDK, Gadgetbridge, and reverse-engineering repositories must remain clean, updateable references.

**Consequence**

Build scripts mount upstream sources read-only and place generated packages in this repository's `dist\` directory.

---

## 2026-06-17 — Keep the raw knowledge archive outside Git

**Decision**

The complete `_knowledge-archive` remains at:

```text
C:\git\Fossil\_knowledge-archive
```

**Reason**

It is large, noisy, and contains downloaded attachments and machine-generated JSON.

**Consequence**

Only concise verified conclusions are promoted into `docs\` and `knowledge\`.

---

## 2026-06-17 — Use evidence-first development

**Decision**

Real-watch behavior is the final source of truth.

**Evidence hierarchy**

1. real watch result;
2. fresh non-empty `.wapp`;
3. current local source and SDK documentation;
4. archived issue/PR evidence;
5. memory or hypothesis.

---

## 2026-06-17 — Reuse the Battleships++ guardrail pattern

**Decision**

Use:

- stable `main`;
- feature branches;
- minimal diffs;
- explicit validation;
- project and validation skills;
- explicit candidate lessons rather than automatic rule edits.

---

## Open decisions

- License for original applications.
- Naming scheme after the first `lionHelloApp`.
- Whether applications share a small common library or remain fully independent.
- Whether release `.wapp` files should later be attached to GitHub Releases.
