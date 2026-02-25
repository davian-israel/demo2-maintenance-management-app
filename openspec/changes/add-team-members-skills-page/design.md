## Context

The current architecture has domain-first modeling for jobs, skills, and checklist operations, but no workforce profile context. The requested change introduces a new read/write slice for team-member skill profiles and a navigable listing page in the existing sidebar layout.

## Goals / Non-Goals

**Goals:**
- Add a TeamMember model with `teamMemberId` and `name`.
- Add a Skill model for team-member capability entries with `skillId`, `name`, and `skillPercentage`.
- Enforce relationship rules so each TeamMember can own a list of Skill entries.
- Provide a `/team-members` page and sidebar link for easy access.

**Non-Goals:**
- Replacing existing job-skill requirement behavior.
- Adding advanced workforce planning features (capacity, scheduling, shift management).
- Implementing role-based access controls for team-member edits.

## Decisions

1. **Model TeamMember as aggregate root with owned Skill entries**
- Decision: `TeamMember` is the aggregate root and owns a collection of Skill entities (`skillId`, `name`, `skillPercentage`).
- Rationale: Keeps ownership clear and aligns with request that a team member can have a list of skills.
- Alternative considered: independent global Skill catalog with only join references. Rejected for this change because percentage is member-specific.

2. **Store proficiency percentage as bounded integer**
- Decision: Validate `skillPercentage` as an integer in range `0..100`.
- Rationale: predictable UI display and simpler validation semantics.
- Alternative considered: decimal/rating scale. Rejected to avoid ambiguous conversions.

3. **Persist relationship with normalized tables**
- Decision: Add `TeamMember` table and `TeamMemberSkill` table keyed by `(teamMemberId, skillId)`.
- Rationale: supports one-to-many list while preventing duplicate skill IDs per member.
- Alternative considered: JSON column for skills list. Rejected due to queryability and integrity concerns.

4. **Expose dedicated team-members list route and sidebar entry**
- Decision: Add `/team-members` page and a `Team Members` link in app sidebar with active state.
- Rationale: follows current IA pattern (`Dashboard`, `Jobs`) and keeps member-skill browsing discoverable.
- Alternative considered: embedding section into dashboard only. Rejected due to dashboard clutter.

## Risks / Trade-offs

- **[Risk] Naming conflict with existing job skill concept** -> **Mitigation:** keep team-member skill models in a dedicated module/context and explicit naming in DTOs.
- **[Risk] Data quality issues from free-form skill names** -> **Mitigation:** add Zod constraints and normalize whitespace/casing at write time.
- **[Risk] Navigation regressions** -> **Mitigation:** Playwright coverage for sidebar visibility, link routing, and active state.

## Migration Plan

1. Add Prisma schema models and migration for `TeamMember` and `TeamMemberSkill`.
2. Regenerate Prisma client and implement repositories/services.
3. Introduce API contracts/routes and seed-compatible defaults.
4. Add `/team-members` UI page and sidebar entry.
5. Run lint/build/e2e before apply completion.

## Open Questions

- Should `skillId` be user-provided or generated server-side for create flows?
- Should duplicate skill names with different `skillId` values be allowed per team member?
