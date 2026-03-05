# MVP plan

This plan is intentionally implementation-agnostic so the repo can evolve (web app, API, CLI, notebook) without rewriting the product intent.

## User journey (MVP)

1. User opens the application
2. User selects a day of the week
3. User selects an arrival airport
4. User submits
5. Application displays the chance of arrival delay ≥ 15 minutes

## MVP scope checklist

- Inputs
  - Day of week selector
  - Arrival airport selector
- Output
  - Probability of arrival delay ≥ 15 minutes for the selected slice
- Data handling
  - Uses historical 2013 data
  - Excludes cancelled flights from the calculation

## Functional requirements

- Provide consistent results for the same inputs
- Use airport display names that are human-readable
- If a combination has insufficient/no data, the UI must clearly communicate that

## Non-functional requirements

- Performance: results should appear quickly after selection
- Reliability: the app should avoid crashes due to missing values
- Clarity: terminology should match the dataset definition (≥ 15 minutes)

## Acceptance criteria

- User can select any weekday and an arrival airport from the dataset
- App shows a probability for the selected combination, or a clear “no data” message
- Probability is computed over non-cancelled flights

## Extensibility points (planned, not MVP)

- Add optional inputs (carrier, departure airport, time window)
- Add drill-down context (sample size, confidence interval)
- Add alternate thresholds (≥ 30 min, ≥ 60 min)
- Add “top risky airports for this weekday” (ranking view)
- Add trend analysis across months
