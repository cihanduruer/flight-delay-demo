# UC-003: Airport selection and labeling

## Goal

Allow users to select an arrival airport using a human-readable label while keeping a stable key for computation.

## Primary actor

- Traveler

## Preconditions

- Dataset includes destination airport name, city/state, and a stable airport identifier

## Trigger

- User opens the airport selector

## Main success scenario

1. System displays a list of destination airports
2. Each option uses a human-readable label (airport name)
3. Internally, the system uses a stable destination airport identifier for grouping/lookup

## Success outcome

- User can find airports easily
- Calculations remain stable even if labels change slightly

## Extensions / alternate flows

- A1: Duplicate airport names
  - System disambiguates by appending city/state to the label

## Notes

- Keep the UI label separate from the computational key.
