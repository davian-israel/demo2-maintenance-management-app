## Context

The application now has a `TeamMember` model but baseline team-member availability is not guaranteed across environments unless data is manually created/imported. The requested change requires a fixed roster seed that can be re-run any time without creating duplicates.

## Goals / Non-Goals

**Goals:**
- Add a canonical baseline roster containing the requested team-member names.
- Provide a seed command that inserts missing baseline members and updates existing baseline members.
- Keep repeated executions idempotent and operationally safe.

**Non-Goals:**
- Seeding team-member skill assignments in this change.
- Deleting non-baseline team members.
- Replacing workbook import workflows.

## Decisions

1. **Use a static seed roster file in the repo**
- Decision: Store requested names in a dedicated seed source under `scripts/` so the list is versioned and explicit.
- Rationale: Keeps seed behavior deterministic and auditable.
- Alternative considered: Pull roster from external spreadsheet/API. Rejected for repeatability and offline portability.

2. **Use deterministic `teamMemberId` generation from name**
- Decision: Build/normalize IDs from names using the existing team-member ID normalization approach.
- Rationale: Enables stable upsert keys across repeated runs.
- Alternative considered: random IDs at seed time. Rejected because reruns would duplicate rows.

3. **Make seed flow non-destructive**
- Decision: Upsert baseline records only; do not delete records not in baseline roster.
- Rationale: Safe to run in active environments that may contain user-created members.
- Alternative considered: full replace/truncate. Rejected due to accidental data loss risk.

4. **Expose a dedicated runnable command**
- Decision: Add an npm script (for example `seed:team-members`) invoking the seed flow directly.
- Rationale: Makes operation discoverable and repeatable.
- Alternative considered: embedding seed inside app startup. Rejected to avoid hidden side effects.

## Risks / Trade-offs

- **[Risk] Name typos in baseline list create wrong members** -> **Mitigation:** keep baseline list explicit in code and add verification test for exact roster.
- **[Risk] ID normalization collisions for similar names** -> **Mitigation:** assert uniqueness during seed execution and fail fast on collisions.
- **[Risk] Seed command behavior misunderstood as destructive reset** -> **Mitigation:** document command as non-destructive upsert-only behavior in README/script description.

## Migration Plan

1. Add baseline roster seed file and seed runner script.
2. Add npm command to execute the seed runner.
3. Add tests validating idempotency and exact roster upsert.
4. Run lint/test checks and update docs.

Rollback: stop using the seed command; no schema rollback is required.

## Open Questions

- Confirm canonical spelling for `Officer Ree-al` as provided in source image.
