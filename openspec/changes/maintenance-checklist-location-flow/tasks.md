## 1. Routing and shell

- [x] 1.1 Add a dedicated maintenance checklist route (for example `/maintenance/check`) with layout consistent with the app shell
- [x] 1.2 Link to the new route from the dashboard or navigation so users can start an inspection

## 2. Location and sub-location UX

- [x] 2.1 Load catalog/sectors from existing checklist APIs and render location selection
- [x] 2.2 Implement sub-location selection and wire scoped checklist items to the chosen scope
- [x] 2.3 Create or reuse inspection session persistence so progress survives refresh and return navigation

## 3. Job handoff and return

- [x] 3.1 Add “Log corrective job” (or equivalent) action on the maintenance checklist with navigation to `/jobs/new` including query params for prefill and `returnTo`
- [x] 3.2 Update `CreateJobForm` (or page wrapper) to read prefill params and set initial state for location and sub-location
- [x] 3.3 Implement same-origin validation for `returnTo` and redirect there on successful create; otherwise keep existing `/jobs` redirect
- [x] 3.4 Ensure return URL includes enough state (for example `sessionId` and step) to restore the checklist

## 4. Polish and tests

- [x] 4.1 Add loading/empty/error states for catalog and session restore
- [x] 4.2 Add Playwright coverage: select location → sub-location → open add job → submit → land back on checklist with progress intact
- [x] 4.3 Add unit tests for return URL validation helper if extracted
