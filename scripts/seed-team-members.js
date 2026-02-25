const { PrismaClient } = require("@prisma/client");
const { seedBaselineTeamMembers } = require("./lib/team-member-seed");

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const summary = await seedBaselineTeamMembers(prisma);

    console.log("Baseline team members seeded.");
    console.log(`- Baseline members processed: ${summary.totalBaseline}`);
    console.log(`- Created: ${summary.created}`);
    console.log(`- Updated: ${summary.updated}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to seed baseline team members.");
  console.error(error);
  process.exitCode = 1;
});
