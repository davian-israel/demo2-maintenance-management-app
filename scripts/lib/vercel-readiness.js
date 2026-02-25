const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function parseDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = {};
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    if (!key) {
      continue;
    }

    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function loadEnvForTarget(cwd, target, processEnv) {
  const fileNames = [".env", ".env.local"];
  if (target === "production") {
    fileNames.push(".env.production", ".env.production.local");
  }

  const fileEnv = {};
  for (const fileName of fileNames) {
    Object.assign(fileEnv, parseDotEnvFile(path.join(cwd, fileName)));
  }

  return {
    ...fileEnv,
    ...processEnv,
  };
}

function isPostgresUrl(value) {
  return /^postgres(?:ql)?:\/\//i.test(value);
}

function commandExists(command) {
  const result = spawnSync("sh", ["-lc", `command -v ${command}`], {
    encoding: "utf8",
  });
  return result.status === 0;
}

function readGitOrigin(cwd) {
  const result = spawnSync("git", ["remote", "get-url", "origin"], {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return null;
  }
  return result.stdout.trim() || null;
}

function hasVercelProjectLink(cwd) {
  return fs.existsSync(path.join(cwd, ".vercel", "project.json"));
}

function isVercelAuthenticated(cwd) {
  const result = spawnSync("vercel", ["whoami"], {
    cwd,
    encoding: "utf8",
  });
  return result.status === 0;
}

function evaluateVercelReadiness(input) {
  const {
    target,
    env,
    vercelInstalled,
    vercelAuthenticated,
    originUrl,
    vercelLinked,
  } = input;

  const errors = [];
  const warnings = [];
  const databaseUrl = (env.DATABASE_URL || "").trim();
  const useInMemoryRepo = String(env.USE_IN_MEMORY_REPO || "").toLowerCase() === "true";

  if (!vercelInstalled) {
    errors.push("Vercel CLI is not installed. Install it with `npm i -g vercel`.");
  }

  if (!vercelAuthenticated) {
    errors.push("Vercel CLI is not authenticated. Run `vercel login`.");
  }

  if (!originUrl) {
    errors.push("Git remote `origin` is not configured. Add a GitHub origin before deployment.");
  } else if (!/github\.com[:/]/i.test(originUrl)) {
    errors.push(`Git remote origin must point to GitHub. Current origin: '${originUrl}'.`);
  }

  if (!vercelLinked) {
    errors.push(
      "Vercel project is not linked in this directory. Run `vercel link` before deployment.",
    );
  }

  if (!databaseUrl && !useInMemoryRepo) {
    errors.push(
      "Set either DATABASE_URL (recommended hosted DB) or USE_IN_MEMORY_REPO=true for deployment.",
    );
  }

  if (databaseUrl) {
    if (databaseUrl.startsWith("file:")) {
      if (target === "production") {
        errors.push(
          "Production deploy cannot use local SQLite DATABASE_URL (file:*). Configure PostgreSQL DATABASE_URL.",
        );
      } else {
        warnings.push(
          "Preview deploy is using local SQLite DATABASE_URL (file:*). On Vercel this is ephemeral and not persistent.",
        );
      }
    } else if (target === "production" && !isPostgresUrl(databaseUrl)) {
      errors.push(
        "Production DATABASE_URL must use PostgreSQL protocol (postgresql:// or postgres://).",
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

function loadReadinessContext(cwd, env, target = "preview") {
  const mergedEnv = loadEnvForTarget(cwd, target, env);
  const vercelInstalled = commandExists("vercel");
  const vercelAuthenticated = vercelInstalled ? isVercelAuthenticated(cwd) : false;

  return {
    env: mergedEnv,
    vercelInstalled,
    vercelAuthenticated,
    originUrl: readGitOrigin(cwd),
    vercelLinked: hasVercelProjectLink(cwd),
  };
}

module.exports = {
  evaluateVercelReadiness,
  loadReadinessContext,
};
