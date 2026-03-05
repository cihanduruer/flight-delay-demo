# UC-001: View delay chance by weekday and arrival airport

## Goal

Allow a user to select a day of week and arrival airport and see the chance of arriving ≥ 15 minutes late.

## Primary actor

- Traveler (or anyone planning a flight)

## Preconditions

- The application has access to the 2013 flight dataset
- Cancelled flights are excluded from the probability calculation

## Trigger

- User opens the application

## Main success scenario

1. System displays a weekday selector
2. System displays an arrival airport selector
3. User selects a weekday
4. User selects an arrival airport
5. User submits the request
6. System displays the probability that arrival delay ≥ 15 minutes

## Success outcome

- User can see a single probability value corresponding to their selection

## Extensions / alternate flows

- A1: No data for the selected combination
  - System displays a clear “no data available for this selection” message

- A2: Invalid input (e.g., missing selection)
  - System prompts the user to select both inputs

## Notes

- “Arrival delay ≥ 15 minutes” is defined by the dataset’s arrival delay indicator.
