# Veryable Frontend Challenge

Single-page dashboard built with Next.js, React, and MUI. It pulls ops data from
the challenge API, shows required op/operator fields, and supports check in/out
with local persistence.

## Features

- Fetches ops/operators from `https://frontend-challenge.veryableops.com/`
- Required fields displayed: op title, public ID, operators needed, start/end
  time, plus operator name, ops completed, reliability %, endorsements
- Check In / Check Out per operator with state stored in `localStorage` for the
  current day (persists on refresh)
- Loading and error states (spinner/skeletons; retry on failure)
- Search filter (op title, public ID, operator name) and sorting (name, ops
  completed, reliability)

## Tech

- Next.js (React) + TypeScript
- MUI for layout/components

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Notes

- No server needed beyond the public API.
- Local-only storage; clearing browser storage resets check-ins.
