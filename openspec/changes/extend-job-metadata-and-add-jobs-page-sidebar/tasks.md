## 1. Job Metadata Model

- [x] 1.1 Extend domain job types and aggregate snapshot to include `location`, `subLocation`, `doneBy`, `checkedBy`
- [x] 1.2 Update Prisma schema and migration to persist new job metadata fields
- [x] 1.3 Update repository mappings (memory + Prisma) to read/write metadata fields

## 2. API and Validation

- [x] 2.1 Extend job Zod contracts for create/update payloads with new metadata fields
- [x] 2.2 Update job service and API routes to accept and return metadata fields consistently
- [x] 2.3 Verify list/get responses include metadata with null-safe defaults

## 3. Navigation and Jobs Page

- [x] 3.1 Add shared sidebar layout shell with navigation entries
- [x] 3.2 Add a new `/jobs` page that renders all jobs in a dedicated list/table
- [x] 3.3 Add Jobs link to sidebar and ensure active/selected state is visible

## 4. UI Integration

- [x] 4.1 Update job creation form to capture location, sub-location, done by, and checked by
- [x] 4.2 Display metadata on both dashboard job cards and new jobs page rows
- [x] 4.3 Add fallback labels for missing metadata values

## 5. Verification

- [x] 5.1 Add/adjust tests for metadata persistence and API shape
- [x] 5.2 Add Playwright test for sidebar navigation to Jobs page
- [x] 5.3 Add Playwright assertion for metadata visibility on jobs page
