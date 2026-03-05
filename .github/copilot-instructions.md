# GitHub Copilot instructions (repo-specific)

These instructions apply to all contributions in this repository.

## Repository goal

Build an application that lets a user select an arrival airport and a day-of-week (or a date that derives the weekday) to see the chance a flight arrives **≥ 15 minutes late** based on the 2013 dataset in `data/flights.csv`.

## Product and documentation workflow

- Keep product intent implementation-agnostic.
- When adding a new user interaction, add a new use-case file in `use-cases/` (one file per use case).
- When changing a key definition or policy, add/update an ADR in `docs/adr/`.
- Keep the indexes up to date:
  - `docs/README.md`
  - `use-cases/README.md`

## Data and metric rules (do not silently change)

- **Delay label**: use the dataset’s `ArrDel15` indicator as the definition of “arrival delayed ≥ 15 minutes”.
- **Cancelled flights**: exclude rows where `Cancelled == 1` from any “arrival delay chance” metric.
- If you propose alternative definitions (e.g., `ArrDelay > 15` or “disruption” including cancellations), record it as a new ADR and keep the original behavior available.

## UI requirements

- UI framework: use **shadcn/ui** components (https://ui.shadcn.com/).
- **No full page refresh** for selection → result updates. Use client-side state and/or background requests.
- Keep the UI minimal and consistent with the existing design system; avoid introducing custom styling primitives unless required.

## Engineering guidelines

- Prefer small, focused changes.
- Do not add “nice-to-have” features unless explicitly requested.
- Do not hard-code domain constants (e.g., weekday names mapping) in multiple places; centralize them.
- When touching data parsing, be defensive about missing values and document assumptions.

## Version control workflow

- After completing each use case implementation, **git commit and push** the changes.
- Use a descriptive commit message referencing the use case (e.g., `feat: implement UC-006 nearby airport delay map`).

## What not to do

- Do not change the meaning of the metric without updating documentation.
- Do not add new pages, dashboards, or unrelated UX flows unless the spec requires it.
