# Product overview

## Problem statement

The dataset contains dates, times, and carriers for US flights that took place in 2013.
The goal is to build an application that allows a user to:

- Select a day of the week
- Select an arrival airport
- See the chance that their flight will be delayed by **at least 15 minutes** on arrival

## In-scope

- Probability based on historical data (2013 dataset)
- Two inputs: weekday and arrival airport
- One primary output: probability of arrival delay ≥ 15 minutes

## Out-of-scope (for the first release)

- Predicting exact delay minutes
- Using additional inputs (carrier, departure airport, time of day, seasonality)
- Multi-year data, real-time feeds, or operational integration
- Personalization, user accounts, saved routes

## Definitions

- **Arrival delay ≥ 15 minutes**: the event represented by the dataset’s arrival-delay indicator.
- **Chance / probability**: historical frequency in the dataset for the selected slice.

## Non-goals

- The application is not intended to be a guaranteed forecast.
- The application is not a decision-support system for safety-critical choices.
