# UC-006 – View Nearby Airport Delays on Map

## Goal

After selecting an arrival airport and a date, the user sees a D3-powered US map showing the **top 10 surrounding airports** with their delay probabilities for the same weekday. The map zooms to the selected region and applies **color coding** from green (low delay) to red (high delay).

## Actors

- End-user

## Preconditions

- The user has selected an arrival airport and a date in the main UI.

## Main Flow

1. System computes the weekday from the selected date.
2. System finds the 10 closest airports (by geographic distance) to the selected arrival airport that have data for the chosen weekday.
3. System renders a US map using D3 with the selected airport prominently marked.
4. The 10 nearby airports are plotted as circles, color-coded:
   - **Green** → lowest delay probability in the set
   - **Yellow** → medium delay probability
   - **Red** → highest delay probability
5. The map zooms to the bounding box of the selected airport and its 10 neighbours (D3 zoom-to-bounding-box pattern).
6. User can hover over a circle to see a tooltip with: airport name, delay probability, and flight count.

## Alternate Flows

- **No nearby data**: If fewer than 10 airports have data for the given weekday, show all available.
- **No data at all**: Show the map centered on the selected airport with a note that no nearby delay data is available.

## Post-conditions

- The map updates without a full-page refresh.

## Dependencies

- D3.js, TopoJSON (US Atlas)
- Airport latitude/longitude coordinates dataset
