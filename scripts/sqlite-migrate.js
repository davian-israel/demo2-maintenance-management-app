const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const PRISMA_DIR = path.join(ROOT_DIR, "prisma");
const MIGRATIONS_DIR = path.join(PRISMA_DIR, "migrations");

function resolveDatabasePath(databaseUrl) {
  if (!databaseUrl || !databaseUrl.startsWith("file:")) {
    throw new Error("DATABASE_URL must use a SQLite file: URL, e.g. file:./dev.db");
  }

  const filePath = databaseUrl.slice("file:".length);
  if (!filePath) {
    throw new Error("DATABASE_URL file path is empty.");
  }

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  return path.resolve(PRISMA_DIR, filePath);
}

function listMigrationSqlFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  const dirs = fs
    .readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  return dirs
    .map((dirName) => path.join(MIGRATIONS_DIR, dirName, "migration.sql"))
    .filter((filePath) => fs.existsSync(filePath));
}

function applyMigration(dbPath, migrationFilePath) {
  const sql = fs.readFileSync(migrationFilePath, "utf8");
  execFileSync("sqlite3", [dbPath], {
    input: sql,
    stdio: ["pipe", "inherit", "inherit"],
  });
}

function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const dbPath = resolveDatabasePath(databaseUrl);
  const shouldReset = process.argv.includes("--reset");

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (shouldReset && fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { force: true });
  }

  const migrations = listMigrationSqlFiles();
  if (migrations.length === 0) {
    console.log("No SQLite migration files found.");
    return;
  }

  for (const migrationFile of migrations) {
    applyMigration(dbPath, migrationFile);
  }

  console.log(`SQLite migrations applied to ${dbPath}`);
}

try {
  main();
} catch (error) {
  console.error("SQLite migration failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
