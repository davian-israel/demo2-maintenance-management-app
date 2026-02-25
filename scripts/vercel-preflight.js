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

function printReadinessResult(target, result) {
  console.log(`Vercel readiness check (${target})`);
  if (result.warnings.length > 0) {
    console.log("- Warnings:");
    result.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  if (result.errors.length > 0) {
    console.log("- Errors:");
    result.errors.forEach((error) => console.log(`  - ${error}`));
    return;
  }

  console.log("- Ready to deploy.");
}

function main() {
  const target = parseTargetArg(process.argv.slice(2));
  const context = loadReadinessContext(process.cwd(), process.env, target);
  const result = evaluateVercelReadiness({
    target,
    ...context,
  });

  printReadinessResult(target, result);
  if (!result.ok) {
    process.exitCode = 1;
  }
}

main();
