# Agent Guidelines for demo2

This is a Next.js 16 application with TypeScript, Prisma, and Playwright.

## Commands

### Development
```bash
npm run dev          # Start dev server (requires DATABASE_URL or uses file:./dev.db)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
# E2E tests with Playwright
npm run test:e2e

# Unit/integration tests (Node.js built-in test runner)
npm run test:import          # Run scripts/lib/sabbath-import.test.js
npm run test:seed            # Run seed-related tests
npm run test:deploy          # Run deploy verification tests

# Run a single test file
node --test scripts/lib/sabbath-import.test.js
node --test path/to/your.test.ts
```

### Database
```bash
npm run prisma:generate   # Generate Prisma clients
npm run prisma:migrate    # Run migrations
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
│   ├── api/            # API endpoints
│   └── */page.tsx      # Route pages
├── components/         # React components
├── domain/             # Domain entities and value objects
├── application/        # Application services, contracts, repositories interfaces
└── infrastructure/     # Repository implementations, external services
```

## Code Style

### TypeScript
- Strict mode enabled in tsconfig.json
- Always use explicit return types for API routes and service methods
- Use `type` for props and interfaces, `interface` for objects that may be extended

### Imports
- Use path aliases: `@/application/...`, `@/domain/...`, `@/infrastructure/...`, `@/components/...`
- Use `import type { ... }` for type-only imports
- Group imports: external libs, then relative paths, then alias paths

### Naming Conventions
- **Files**: kebab-case (e.g., `team-member-service.ts`)
- **Classes/PascalCase**: `TeamMemberService`, `TeamMember`
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types**: PascalCase with `Props` suffix for entity data (e.g., `TeamMemberProps`)

### Validation
- Use Zod for all input validation in API routes and service layers
- Define schemas in `application/*/contracts.ts` files
- Use `.parse()` for sync validation, `.parseAsync()` for async

### Error Handling
- Create domain-specific error classes (e.g., `TeamMemberDomainError`)
- API routes use `fail(error, status)` helper from `@/infrastructure/http`
- Services throw errors with descriptive messages
- Use `structuredClone()` for cloning domain objects

### React Components
- Use `"use client"` directive for client-side components
- Use function components with explicit prop types
- Prefer composition over inheritance
- Use Tailwind CSS classes for styling

### Testing
- E2E tests: Playwright in `tests/` directory
- Unit tests: Node.js built-in test runner (`*.test.js` or `*.test.ts`)
- Use descriptive test names following `test-description.test.ts` pattern

### Database
- Prisma with SQLite for development
- Use repository pattern: interface in `application/`, implementation in `infrastructure/repositories/`
- Domain entities use `create()` factory and `rehydrate()` for persistence

## Additional Notes

- No Cursor or Copilot rules found in this repository
- ESLint uses `eslint-config-next` with TypeScript support
- Tailwind CSS v4 is configured
- Feature flags in `@/infrastructure/feature-flags.ts`
