## 1. CLI Deployment Workflow

- [ ] 1.1 Add npm script for preview deploy using `vercel deploy -y`
- [ ] 1.2 Add npm script for explicit production deploy using `vercel deploy --prod -y`
- [ ] 1.3 Ensure deploy scripts clearly output deployment URL and status

## 2. Deployment Readiness

- [ ] 2.1 Add predeploy readiness check for CLI availability and auth/link prerequisites
- [ ] 2.2 Add required env validation for Vercel runtime variables
- [ ] 2.3 Add database URL compatibility checks for deployment context with actionable errors

## 3. Documentation and Verification

- [ ] 3.1 Document Vercel CLI setup and deployment commands in README
- [ ] 3.2 Add tests for readiness-check behavior on pass/fail cases
- [ ] 3.3 Validate OpenSpec change in strict mode after artifacts and tasks are complete
