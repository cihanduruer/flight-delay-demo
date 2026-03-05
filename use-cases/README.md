# Use cases index

This folder contains one file per use case so the application can grow without mixing concerns.

## Implementation tracking

| Use Case | Title | Status | Notes |
|---|---|---|---|
| UC-001 | View delay chance by weekday and arrival airport | ✅ Implemented | Auto-triggers on selection; excludes cancelled flights; uses `ArrDel15` |
| UC-002 | Handle no-data combinations | ✅ Implemented | `null` vs `0%` properly distinguished; clear "no data" card |
| UC-003 | Airport selection and labeling | ✅ Implemented | Labels show name + city/state; stable numeric ID used internally |
| UC-004 | UI to select airport and date (no refresh) | ✅ Implemented | shadcn/ui components; client-side state; derives weekday from date; 2013-only note shown |
| UC-005 | Jupyter notebook for predictive modeling | ✅ Implemented | 3 notebooks + model artifact in `models/` |
| UC-006 | View nearby airport delays on interactive D3 map | ✅ Implemented | D3 zoom/pan/drag; top-10 nearby; color-coded; tooltips |

### Key source files

- `src/app/page.tsx` — main UI orchestration
- `src/lib/data.ts` — CSV parsing, delay calculation, nearby airport logic
- `src/lib/constants.ts` — centralized weekday mapping, busiest airports
- `src/app/api/delay/route.ts` — delay stats API
- `src/app/api/airports/route.ts` — airport list API
- `src/app/api/nearby/route.ts` — nearby airports API
- `src/components/airport-combobox.tsx` — airport selector
- `src/components/date-picker.tsx` — date picker
- `src/components/delay-map.tsx` — D3 map visualization
- `data/airport-coordinates.json` — lat/lon coordinates
- `notebooks/` — predictive modeling notebooks
- `models/` — trained model artifacts

## Adding a new use case

- Create a new file `UC-XXX-<short-name>.md`
- Keep it implementation-agnostic (no code)
- Link any product decisions to the relevant ADR in `docs/adr/`
- Update the tracking table above when implementation is complete
