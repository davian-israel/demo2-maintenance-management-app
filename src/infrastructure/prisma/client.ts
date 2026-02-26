import { PrismaClient as SqlitePrismaClient } from "@prisma/client";
import { PrismaClient as PostgresPrismaClient } from "../../../generated/postgresql-client";
import {
  shouldUsePostgresPrismaClient,
  validateRuntimeDatabaseConfig,
} from "../../../scripts/lib/prisma-runtime-config";

const runtimeValidation = validateRuntimeDatabaseConfig({
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  useInMemoryRepo: process.env.USE_IN_MEMORY_REPO,
});

if (!runtimeValidation.ok) {
  throw new Error(runtimeValidation.message);
}

const shouldUsePostgresClient = shouldUsePostgresPrismaClient({
  databaseUrl: process.env.DATABASE_URL,
  useInMemoryRepo: process.env.USE_IN_MEMORY_REPO,
});

type PrismaClientCtor = new (options?: ConstructorParameters<typeof SqlitePrismaClient>[0]) => SqlitePrismaClient;

const PrismaClientCtor: PrismaClientCtor = (
  shouldUsePostgresClient ? PostgresPrismaClient : SqlitePrismaClient
) as unknown as PrismaClientCtor;

const globalForPrisma = globalThis as unknown as { prisma?: SqlitePrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientCtor({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
