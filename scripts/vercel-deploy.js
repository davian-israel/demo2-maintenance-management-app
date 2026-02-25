const { spawnSync } = require("node:child_process");
const { evaluateVercelReadiness, loadReadinessContext } = require("./lib/vercel-readiness");

function parseTargetArg(argv) {
  const targetArg = argv.find((arg) => arg.startsWith("--target="));
  if (!targetArg) return "preview";

  const value = targetArg.slice("--target=".length).trim().toLowerCase();
  if (value === "production" || value === "prod") {
    return "production";
  }
  return "preview";
}

function printMessages(result) {
  if (result.warnings.length > 0) {
    console.log("Readiness warnings:");
    result.warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (result.errors.length > 0) {
    console.log("Readiness errors:");
    result.errors.forEach((error) => console.log(`- ${error}`));
  }
}

function extractDeploymentUrl(text) {
  const matches = text.match(/https:\/\/[^\s]+/g);
  if (!matches || matches.length === 0) return null;

  const vercelAppUrl = matches.filter((url) => url.includes(".vercel.app"));
  return vercelAppUrl[vercelAppUrl.length - 1] || matches[matches.length - 1];
}

function runDeploy(target) {
  const args = ["deploy", "-y"];
  if (target === "production") {
    args.push("--prod");
  }

  const result = spawnSync("vercel", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    process.exitCode = result.status || 1;
    return;
  }

  const deploymentUrl = extractDeploymentUrl(`${result.stdout}\n${result.stderr}`);
  if (deploymentUrl) {
    console.log(`Deployment URL: ${deploymentUrl}`);
  }
  console.log(`Deployment status: success (${target})`);
}

function main() {
  const target = parseTargetArg(process.argv.slice(2));
  const context = loadReadinessContext(process.cwd(), process.env, target);
  const readiness = evaluateVercelReadiness({
    target,
    ...context,
  });

  printMessages(readiness);
  if (!readiness.ok) {
    process.exitCode = 1;
    return;
  }

  runDeploy(target);
}

main();
