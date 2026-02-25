# OpenSpec: Maintenance Management App (DDD)

## Ubiquitous Language
- Job: maintenance work item.
- Job Status: `Draft -> Scheduled -> InProgress -> Completed` with optional `Cancelled`, `OnHold`.
- Due Date: target completion date.
- Overdue: due date in the past while not completed/cancelled.
- Job Run: one execution session for a job.
- Run Log Entry: operational notes + outcome for one run.
- Skill: maintenance capability category.
- Required Skills: skills needed by a job.
- Assignee: responsible user.
- Report/Statistics: read-only projections and trends.

## Subdomains
- Core: Job lifecycle and execution logging.
- Supporting: Skill catalog and job-skill requirement mapping.
- Generic: Identity/access, notifications, audit (not fully implemented here).

## Bounded Contexts
- Job Management BC: Job aggregate, assignment, due dates, transitions.
- Execution & Logging BC: run logs modeled inside the Job aggregate.
- Skill Catalog BC: Skill aggregate and unique naming.
- Reporting BC: read model projections (`summary`, overdue, monthly counts).

## Aggregates and Invariants
- Job aggregate root:
  - Cannot log runs if status is `Completed` or `Cancelled`.
  - Run end must be >= start.
  - At most one active run (`endedAt = null`) at a time.
  - Completion requires at least one run and no active run.
  - Due date cannot be before creation.
- Skill aggregate root:
  - Name is mandatory and unique.

## Domain Events (planned contract)
- Job: `JobCreated`, `JobAssigned`, `JobDueDateChanged`, `JobStatusChanged`, `JobCompleted`, `JobCancelled`
- Execution: `JobRunLogged`
- Skills: `SkillCreated`, `SkillRenamed`, `SkillRetired`

## Use Cases (Application Layer)
- Jobs: create, list, start, log run, complete, cancel.
- Skills: create, list.
- Reporting: summary projection (`overdueCount`, `monthly created/completed`).

## Repository Contracts
- `JobRepository`: `create/save/getById/list`
- `SkillRepository`: `create/list/findByName`
- `ReportingReadModel`: `getSummary(year)`

## Adapters
- Prisma adapters for Neon/Postgres.
- In-memory adapters for local/e2e test reliability.
- Runtime selection via `USE_IN_MEMORY_REPO` or missing `DATABASE_URL`.
