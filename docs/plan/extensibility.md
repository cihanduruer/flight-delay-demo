# Extensibility roadmap

This document identifies seams where future requirements can be added with minimal rework.

## Dimension expansion (inputs)

Potential additional selectors:

- Carrier
- Departure airport
- Time of day bucket (e.g., morning/afternoon/evening)
- Month/season

Guidance:

- Prefer adding one dimension at a time and validating UX complexity.
- Ensure any new dimension has a stable key, and a separate display label.

## Metric expansion (outputs)

Potential additional outputs:

- Sample size (N)
- Confidence intervals (or a simple “low data” warning)
- Median/mean arrival delay minutes
- Cancellation rate for the same slice

## Data expansion

- Add additional years
- Replace CSV with a queryable store (SQLite/Parquet) when scale requires

## Architecture evolution (conceptual)

- Separate concerns:
  - Data ingestion/validation
  - Metric computation
  - Presentation/UI

- Keep a single “source of truth” for:
  - Label definition (what counts as delayed)
  - Exclusion criteria (cancelled flights)

## Backwards compatibility principles

- Default behavior should remain stable even as new filters are added.
- Introduce new optional parameters in a way that does not change existing results unless explicitly selected by the user.
