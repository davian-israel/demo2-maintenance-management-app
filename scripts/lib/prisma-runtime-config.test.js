const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getDatasourceProtocol,
  shouldUsePostgresPrismaClient,
  validateRuntimeDatabaseConfig,
} = require("./prisma-runtime-config");

function restoreEnvVar(key, previousValue) {
  if (previousValue === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = previousValue;
}

test("getDatasourceProtocol detects postgres/sqlite/none", () => {
  assert.equal(getDatasourceProtocol("postgresql://db"), "postgresql");
  assert.equal(getDatasourceProtocol("postgres://db"), "postgresql");
  assert.equal(getDatasourceProtocol("file:./dev.db"), "sqlite");
  assert.equal(getDatasourceProtocol(""), "none");
});

test("shouldUsePostgresPrismaClient is false for in-memory mode", () => {
  assert.equal(
    shouldUsePostgresPrismaClient({
      databaseUrl: "postgresql://db",
      useInMemoryRepo: "true",
    }),
    false,
  );
});

test("shouldUsePostgresPrismaClient is true for postgres datasource", () => {
  assert.equal(
    shouldUsePostgresPrismaClient({
      databaseUrl: "postgresql://db",
      useInMemoryRepo: "false",
    }),
    true,
  );
});

test("validateRuntimeDatabaseConfig rejects sqlite in production", () => {
  const previousVercel = process.env.VERCEL;
  process.env.VERCEL = "1";
  const result = validateRuntimeDatabaseConfig({
    nodeEnv: "production",
    databaseUrl: "file:./dev.db",
    useInMemoryRepo: "false",
  });
  restoreEnvVar("VERCEL", previousVercel);
  assert.equal(result.ok, false);
  assert.match(result.message, /cannot use SQLite file DATABASE_URL/);
});

test("validateRuntimeDatabaseConfig allows postgres in production", () => {
  const previousVercel = process.env.VERCEL;
  process.env.VERCEL = "1";
  const result = validateRuntimeDatabaseConfig({
    nodeEnv: "production",
    databaseUrl: "postgresql://db",
    useInMemoryRepo: "false",
  });
  restoreEnvVar("VERCEL", previousVercel);
  assert.equal(result.ok, true);
});
