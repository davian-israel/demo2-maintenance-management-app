## Why

The maintenance checks directory table uses a plain HTML `<table>` instead of the `DataTableComponent` used by the jobs page, so it lacks sorting, pagination, responsive behaviour, and the DataTables visual treatment. The detail dialog also does not reliably center on all viewports.

## What Changes

- Replace the manual `<table>` in `MaintenanceChecksDirectory` with `DataTableComponent` using `DataTableColumn[]` definitions, matching the exact pattern and styles from `JobsDirectory`.
- Fix `.checks-detail-dialog` CSS so the dialog is horizontally and vertically centered on screen (via `margin: auto` which native `<dialog>` supports with `showModal()`).
- Wire a View action column through DataTables so the row-to-dialog interaction still works.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `maintenance-checks-directory`: Switch from plain table to `DataTableComponent` and fix dialog centering.

## Impact

- **UI**: `maintenance-checks-directory.tsx` refactored to use `DataTableComponent`; dialog CSS updated.
- **No API or domain changes.**
