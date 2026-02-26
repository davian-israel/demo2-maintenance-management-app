const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluateVercelReadiness } = require("./vercel-readiness");

const baseContext = {
  env: {
    DATABASE_URL: "postgresql://example",
    USE_IN_MEMORY_REPO: "false",
  },
  vercelInstalled: true,
  vercelAuthenticated: true,
  originUrl: "https://github.com/example/repo.git",
  vercelLinked: true,
  postgresPrismaClientGenerated: true,
};

test("readiness passes for preview with valid context", () => {
  const result = evaluateVercelReadiness({
    target: "preview",
    ...baseContext,
  });
  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
});

test("readiness fails when vercel CLI is missing", () => {
  const result = evaluateVercelReadiness({
    target: "preview",
    ...baseContext,
    vercelInstalled: false,
    vercelAuthenticated: false,
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("Vercel CLI is not installed")));
});

test("readiness fails when origin is not GitHub", () => {
  const result = evaluateVercelReadiness({
    target: "preview",
    ...baseContext,
    originUrl: "https://gitlab.com/example/repo.git",
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("must point to GitHub")));
});

test("readiness fails for production with local sqlite database URL", () => {
  const result = evaluateVercelReadiness({
    target: "production",
    ...baseContext,
    env: {
      DATABASE_URL: "file:./dev.db",
      USE_IN_MEMORY_REPO: "false",
    },
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("Production deploy cannot use local SQLite")));
});

test("readiness fails for production with non-postgresql URL", () => {
  const result = evaluateVercelReadiness({
    target: "production",
    ...baseContext,
    env: {
      DATABASE_URL: "mysql://example",
      USE_IN_MEMORY_REPO: "false",
    },
  });
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some((error) => error.includes("must use PostgreSQL protocol")),
  );
});

test("readiness fails for production when postgres prisma client is not generated", () => {
  const result = evaluateVercelReadiness({
    target: "production",
    ...baseContext,
    postgresPrismaClientGenerated: false,
  });
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.some((error) => error.includes("PostgreSQL Prisma client is not generated")),
  );
});

test("preview readiness warns when using local sqlite URL", () => {
  const result = evaluateVercelReadiness({
    target: "preview",
    ...baseContext,
    env: {
      DATABASE_URL: "file:./dev.db",
      USE_IN_MEMORY_REPO: "false",
    },
  });
  assert.equal(result.ok, true);
  assert.ok(
    result.warnings.some((warning) => warning.includes("Preview deploy is using local SQLite")),
  );
});

test("readiness allows production when in-memory mode is explicit", () => {
  const result = evaluateVercelReadiness({
    target: "production",
    ...baseContext,
    env: {
      DATABASE_URL: "",
      USE_IN_MEMORY_REPO: "true",
    },
  });
  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
});
