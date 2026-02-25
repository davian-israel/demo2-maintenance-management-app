## ADDED Requirements

### Requirement: Workflow SHALL validate local git state before committing
The system SHALL verify current branch, working-tree status, and staged/untracked scope before creating a batch commit.

#### Scenario: Run commit workflow on dirty repository
- **WHEN** the commit workflow starts
- **THEN** it reports current branch and pending file changes before commit is executed

### Requirement: Workflow SHALL create one commit for the approved batch
The workflow SHALL stage all approved changes and create a single commit representing the current batch.

#### Scenario: Commit approved changes
- **WHEN** user confirms the full staged set
- **THEN** one new commit is created containing all staged files

### Requirement: Workflow SHALL confirm commit result
After committing, the workflow SHALL return commit metadata for verification.

#### Scenario: Commit created successfully
- **WHEN** commit command succeeds
- **THEN** workflow outputs commit hash and commit message for the new commit
