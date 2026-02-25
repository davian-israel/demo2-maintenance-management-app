## 1. CLI Deployment Workflow

- [x] 1.1 Add npm script for preview deploy using `vercel deploy -y`
- [x] 1.2 Add npm script for explicit production deploy using `vercel deploy --prod -y`
- [x] 1.3 Ensure deploy scripts clearly output deployment URL and status

## 2. Deployment Readiness

- [x] 2.1 Add predeploy readiness check for CLI availability and auth/link prerequisites
- [x] 2.2 Add required env validation for Vercel runtime variables
- [x] 2.3 Add database URL compatibility checks for deployment context with actionable errors

## 3. Documentation and Verification

- [x] 3.1 Document Vercel CLI setup and deployment commands in README
- [x] 3.2 Add tests for readiness-check behavior on pass/fail cases
- [x] 3.3 Validate OpenSpec change in strict mode after artifacts and tasks are complete
