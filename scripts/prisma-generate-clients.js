const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const SQLITE_SCHEMA_PATH = path.join(ROOT_DIR, "prisma", "schema.prisma");
const POSTGRES_SCHEMA_PATH = path.join(ROOT_DIR, "prisma", "schema.postgresql.generated.prisma");
const POSTGRES_CLIENT_OUTPUT = "../generated/postgresql-client";

function buildPostgresSchema(sqliteSchema) {
  const withProviderSwap = sqliteSchema.replace(
    /provider\s*=\s*"sqlite"/,
    'provider = "postgresql"',
  );

  return withProviderSwap.replace(
    /generator client \{([\s\S]*?)\n\}/m,
    (match, blockBody) => {
      const lines = blockBody
        .split("\n")
        .filter((line) => !line.trim().startsWith("output"));

      lines.push(`  output   = "${POSTGRES_CLIENT_OUTPUT}"`);
      return `generator client {${lines.join("\n")}\n}`;
    },
  );
}

function runPrismaGenerate(schemaPath) {
  execFileSync("npx", ["prisma", "generate", "--schema", schemaPath], {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });
}

function main() {
  const sqliteSchema = fs.readFileSync(SQLITE_SCHEMA_PATH, "utf8");
  const postgresSchema = buildPostgresSchema(sqliteSchema);

  fs.mkdirSync(path.join(ROOT_DIR, "generated"), { recursive: true });
  fs.writeFileSync(POSTGRES_SCHEMA_PATH, postgresSchema, "utf8");

  try {
    runPrismaGenerate(SQLITE_SCHEMA_PATH);
    runPrismaGenerate(POSTGRES_SCHEMA_PATH);
  } finally {
    fs.rmSync(POSTGRES_SCHEMA_PATH, { force: true });
  }
}

main();
