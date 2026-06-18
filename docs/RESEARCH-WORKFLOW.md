# Research workflow

Use this workflow for undocumented APIs, runtime behavior, Gadgetbridge integration, and package-format questions.

## 1. State one question

Bad:

> Understand Fossil apps.

Good:

> Which event is emitted when the bottom button is held, and what evidence supports it?

## 2. Search in order

1. distilled repo docs;
2. relevant working example;
3. SDK documentation;
4. local knowledge archive;
5. Gadgetbridge and `fossil-hr-gbapps` source;
6. archived issue/PR discussions;
7. internet only after local evidence is exhausted.

## 3. Keep an evidence table

| Source | Exact location | Observation | Confidence |
|---|---|---|---|

## 4. Separate facts from inference

Use explicit labels:

- Fact
- Inference
- Hypothesis
- Unknown

## 5. Design the smallest watch experiment

Prefer a diagnostic app or one-line visible change over broad implementation.

## 6. Record the result

Create an evidence note from:

```text
knowledge\EVIDENCE-NOTE-TEMPLATE.md
```

Promote only stable reusable conclusions into `VERIFIED-FACTS.md`, `API-CATALOG.md`, or `TROUBLESHOOTING.md`.
