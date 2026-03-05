# UC-002: Handle no-data combinations

## Goal

Ensure the application behaves predictably when a weekday/arrival airport combination has no eligible flights.

## Primary actor

- Traveler

## Preconditions

- Dataset is loaded
- Cancelled flights are excluded

## Trigger

- User submits a selection

## Main success scenario

1. User selects weekday and arrival airport
2. User submits
3. System determines there are zero eligible rows for the selection
4. System displays a clear “no data” state

## Success outcome

- User is informed that the dataset does not support that slice

## Notes

- “No data” should be distinct from “0% chance”.
