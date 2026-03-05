# Dataset notes

Source file: `data/flights.csv`

## High-level shape

- Contains flights in the US during 2013
- Includes:
  - Date fields (Year, Month, DayOfMonth, DayOfWeek)
  - Scheduled times (CRSDepTime, CRSArrTime)
  - Airports (origin and destination, both IDs and names)
  - Delay measurements (DepDelay, ArrDelay)
  - Delay indicators (DepDel15, ArrDel15)
  - Cancel flag (Cancelled)

## Primary fields for the MVP use case

- **Day of week**: DayOfWeek
- **Arrival airport**:
  - Preferred display: DestAirportName (human friendly)
  - Stable key for grouping: DestAirportID
- **Label (delayed ≥ 15 minutes)**: ArrDel15

## Known data quality considerations

- Missing values exist in some indicator fields.
- Cancelled flights exist and can make arrival-delay labels ambiguous if included.

## MVP handling guidance

- Exclude cancelled flights from the arrival-delay probability calculation.
- Treat the label as the dataset’s arrival-delay indicator (ArrDel15), aligned with “≥ 15 minutes”.

## Open questions for later

- How to disambiguate airports with identical names (if any):
  - Option A: append city/state to the display name
  - Option B: display city/state as a secondary label
- Whether to support an alternate threshold (e.g., ≥ 30 minutes) as a parameter.
