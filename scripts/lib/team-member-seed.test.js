const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");
const { BASELINE_TEAM_MEMBER_NAMES, buildBaselineTeamMembers } = require("./baseline-team-members");
const { seedBaselineTeamMembers } = require("./team-member-seed");
const { buildTeamMemberId } = require("./sabbath-import");

const ROOT_DIR = path.resolve(__dirname, "..", "..");

test("seedBaselineTeamMembers is idempotent and non-destructive", async () => {
  const dbFilePath = path.join("/tmp", `seed-team-members-${Date.now()}-${process.pid}.db`);
  const databaseUrl = `file:${dbFilePath}`;
  let prisma;

  try {
    execFileSync("node", ["scripts/sqlite-migrate.js", "--reset"], {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: "pipe",
    });

    prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl },
      },
    });

    const firstRun = await seedBaselineTeamMembers(prisma);
    assert.equal(firstRun.totalBaseline, BASELINE_TEAM_MEMBER_NAMES.length);
    assert.equal(firstRun.created, BASELINE_TEAM_MEMBER_NAMES.length);
    assert.equal(firstRun.updated, 0);

    const baselineMembers = buildBaselineTeamMembers();
    const rowsAfterFirst = await prisma.teamMember.findMany({
      orderBy: { name: "asc" },
    });
    assert.equal(rowsAfterFirst.length, baselineMembers.length);

    const nonBaselineMember = {
      teamMemberId: "tm-manual-member",
      name: "Manual Member",
    };
    await prisma.teamMember.create({
      data: nonBaselineMember,
    });

    await prisma.teamMember.update({
      where: { teamMemberId: buildTeamMemberId("Officer Nathan") },
      data: { name: "Outdated Name" },
    });

    const secondRun = await seedBaselineTeamMembers(prisma);
    assert.equal(secondRun.totalBaseline, BASELINE_TEAM_MEMBER_NAMES.length);
    assert.equal(secondRun.created, 0);
    assert.equal(secondRun.updated, BASELINE_TEAM_MEMBER_NAMES.length);

    const rowsAfterSecond = await prisma.teamMember.findMany({
      orderBy: { name: "asc" },
    });

    assert.equal(rowsAfterSecond.length, BASELINE_TEAM_MEMBER_NAMES.length + 1);
    assert.ok(rowsAfterSecond.some((row) => row.teamMemberId === nonBaselineMember.teamMemberId));

    const baselineNameSet = new Set(BASELINE_TEAM_MEMBER_NAMES);
    const seededNameSet = new Set(
      rowsAfterSecond
        .filter((row) => row.teamMemberId !== nonBaselineMember.teamMemberId)
        .map((row) => row.name),
    );

    assert.deepEqual([...seededNameSet].sort(), [...baselineNameSet].sort());
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (fs.existsSync(dbFilePath)) {
      fs.rmSync(dbFilePath, { force: true });
    }
  }
});
