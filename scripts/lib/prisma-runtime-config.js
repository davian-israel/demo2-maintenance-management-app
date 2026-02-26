function normalizeValue(value) {
  return String(value ?? "").trim();
}

function normalizeLower(value) {
  return normalizeValue(value).toLowerCase();
}

function getDatasourceProtocol(databaseUrl) {
  const normalized = normalizeLower(databaseUrl);

  if (!normalized) return "none";
  if (normalized.startsWith("postgresql://") || normalized.startsWith("postgres://")) {
    return "postgresql";
  }
  if (normalized.startsWith("file:")) {
    return "sqlite";
  }
  return "unknown";
}

function isInMemoryRepoEnabled(useInMemoryRepo) {
  return normalizeLower(useInMemoryRepo) === "true";
}

function shouldUsePostgresPrismaClient({ databaseUrl, useInMemoryRepo }) {
  if (isInMemoryRepoEnabled(useInMemoryRepo)) {
    return false;
  }

  return getDatasourceProtocol(databaseUrl) === "postgresql";
}

function validateRuntimeDatabaseConfig({ nodeEnv, databaseUrl, useInMemoryRepo }) {
  const isProduction = normalizeLower(nodeEnv) === "production";
  const isVercel = normalizeLower(process.env.VERCEL) === "1";
  const isStrictProductionTarget =
    isProduction && (isVercel || normalizeLower(process.env.ENFORCE_PRODUCTION_DATABASE_URL) === "true");

  if (!isStrictProductionTarget || isInMemoryRepoEnabled(useInMemoryRepo)) {
    return { ok: true };
  }

  const protocol = getDatasourceProtocol(databaseUrl);
  if (protocol === "sqlite") {
    return {
      ok: false,
      message:
        "Production runtime cannot use SQLite file DATABASE_URL. Configure PostgreSQL DATABASE_URL and run `npm run prisma:generate`.",
    };
  }

  if (protocol === "none") {
    return {
      ok: false,
      message:
        "Production runtime requires DATABASE_URL (PostgreSQL) or USE_IN_MEMORY_REPO=true.",
    };
  }

  return { ok: true };
}

module.exports = {
  getDatasourceProtocol,
  isInMemoryRepoEnabled,
  shouldUsePostgresPrismaClient,
  validateRuntimeDatabaseConfig,
};
