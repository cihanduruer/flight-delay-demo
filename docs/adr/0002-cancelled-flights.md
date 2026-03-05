# ADR 0002: Handling cancelled flights in delay probability

## Status

Accepted

## Context

Cancelled flights do not have a well-defined arrival delay.
In the dataset, cancelled rows can appear to have inconsistent arrival delay fields and delay indicators, which can distort a probability calculation.

## Decision

Exclude flights where `Cancelled == 1` from the probability calculation for arrival delay ≥ 15 minutes.

## Consequences

- Pros:
  - Keeps the metric meaning clear (probability of late arrival among flights that arrived)
  - Avoids label ambiguity
- Cons:
  - Does not capture the “risk of disruption” including cancellations

## Future option

If the product later wants “chance of disruption”, define a separate metric that includes:

- `Cancelled == 1` OR arrival delay ≥ 15 minutes

Record that as a new ADR and add a separate UI output.
