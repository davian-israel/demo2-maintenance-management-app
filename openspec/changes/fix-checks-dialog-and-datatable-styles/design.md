## Context

`JobsDirectory` uses `DataTableComponent` with `DataTableColumn[]` + render functions. The checks page currently renders a plain `<table>` with React-mapped rows. The dialog uses `position: fixed` / flexbox-less CSS that does not center vertically.

## Goals / Non-Goals

**Goals:**
- Exact same DataTables look and feel (sorting arrows, pagination, search, responsive) on the checks page as the jobs page.
- Dialog visually centered (horizontal + vertical) on all viewports.

**Non-Goals:**
- Changing dialog content or adding features.
- Adding row-click inside DataTables (use a View button column rendered by DataTables instead, since DataTables manages the DOM).

## Decisions

1. **DataTable integration** — Define `DataTableColumn[]` for inspector, inspected date, status badge, observation count, fail count. Add a non-sortable "Action" column that renders a View `<button>` via the `render` function. Attach a delegated click listener on the table for View buttons to open the dialog.
2. **Dialog centering** — Native `<dialog>` with `showModal()` already supports `margin: auto` for centering. Set `margin: auto`, `position: fixed`, `inset: 0` on `.checks-detail-dialog` to guarantee centering.

## Risks / Trade-offs

- DataTables manages its own DOM so React click handlers on `<tr>` won't work. Mitigated by delegated event listener on the table element for the View button.
