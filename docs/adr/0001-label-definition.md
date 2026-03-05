# ADR 0001: Label definition for “delayed by more than 15 minutes”

## Status

Accepted

## Context

The product requirement is to show the chance that a flight will be delayed by around 15 minutes on arrival.
The dataset provides both a numeric arrival delay (`ArrDelay`) and an indicator (`ArrDel15`).

The dataset’s indicator aligns with a threshold of **≥ 15 minutes**.

## Decision

Use `ArrDel15` as the label for “arrival delayed ≥ 15 minutes”.

## Consequences

- Pros:
  - Consistent with the dataset’s intended definition
  - Avoids off-by-one ambiguity with integer minute values
- Cons:
  - If `ArrDel15` is missing for some rows, those rows must be excluded or imputed

## Notes

If a future requirement truly needs “strictly greater than 15 minutes”, define a new label derived from `ArrDelay > 15` and record that as a separate ADR.
