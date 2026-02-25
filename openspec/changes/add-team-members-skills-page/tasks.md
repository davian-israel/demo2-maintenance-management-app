## 1. Domain and Persistence

- [x] 1.1 Add TeamMember and Skill domain models with `teamMemberId`, `name`, `skillId`, and `skillPercentage`
- [x] 1.2 Add domain rules for team-member-to-skills relationship and percentage validation
- [x] 1.3 Update Prisma schema and migration for TeamMember and team-member skill persistence
- [x] 1.4 Implement repository mappings (memory + Prisma) for team members with nested skills

## 2. API and Validation

- [x] 2.1 Add Zod contracts for creating/listing team members with skills
- [x] 2.2 Add application service methods for team-member create/list operations
- [x] 2.3 Add API routes returning team members with skill lists

## 3. UI and Navigation

- [x] 3.1 Add a new `/team-members` page listing all team members
- [x] 3.2 Render skill name and percentage for each member plus fallback when no skills
- [x] 3.3 Add Team Members link to sidebar navigation and active-state styling

## 4. Verification

- [x] 4.1 Add/adjust tests for TeamMember-Skill API shape and validation
- [x] 4.2 Add Playwright test for Team Members sidebar navigation
- [x] 4.3 Add Playwright assertions for team-member skills rendering on the page
