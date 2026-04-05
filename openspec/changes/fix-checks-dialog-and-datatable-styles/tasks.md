## 1. DataTable integration

- [x] 1.1 Replace plain table in `MaintenanceChecksDirectory` with `DataTableComponent` and `DataTableColumn[]` definitions matching the jobs page pattern
- [x] 1.2 Add a non-sortable View action column rendered by DataTables with a delegated click handler to open the detail dialog

## 2. Dialog centering

- [x] 2.1 Update `.checks-detail-dialog` CSS to center the dialog vertically and horizontally using `margin: auto` / `inset: 0`

## 3. Verify

- [x] 3.1 Confirm build passes and existing Playwright test still works
