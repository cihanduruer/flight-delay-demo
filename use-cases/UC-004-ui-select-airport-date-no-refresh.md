# UC-004: UI to select arrival airport and date (no refresh)

## Goal

Provide an interactive UI where the user selects:

- Arrival airport
- Flight date

…and immediately sees the delay probability result without a full page refresh.

## Primary actor

- Traveler

## Preconditions

- The application has access to the 2013 flight dataset
- Cancelled flights are excluded from the probability calculation
- The “delayed” label uses the dataset’s arrival-delay indicator (≥ 15 minutes)

## Trigger

- User opens the application UI

## UI framework constraint

- The UI uses the shadcn/ui component library: https://ui.shadcn.com/

## Main success scenario

1. System displays an arrival airport selector
2. System displays a date selector
3. User selects an arrival airport
4. User selects a date
5. System derives the weekday from the selected date
6. System updates the displayed result without a full page refresh

## Success outcome

- User can select airport and date and see the computed chance of arrival delay ≥ 15 minutes

## “Required information” (MVP)

- The displayed result includes:
  - The derived weekday
  - The chance of arrival delay ≥ 15 minutes for that weekday and arrival airport

## Extensions / alternate flows

- A1: Selected date is outside dataset coverage
  - System informs the user that the dataset covers 2013 only

- A2: No data for the derived weekday + airport
  - System displays a clear “no data available for this selection” state

- A3: Invalid or incomplete selection
  - System prompts the user to select both airport and date

## Notes

- “No refresh” means avoid full page reloads; updates can be done via client-side state changes and/or background requests.
- Keep the UI implementation consistent with the established design system (avoid hard-coded new colors/styles).
