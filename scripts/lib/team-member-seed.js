const { buildBaselineTeamMembers } = require("./baseline-team-members");

async function seedBaselineTeamMembers(prisma) {
  const baselineMembers = buildBaselineTeamMembers();
  const memberIds = baselineMembers.map((member) => member.teamMemberId);

  const existingMembers = await prisma.teamMember.findMany({
    where: {
      teamMemberId: {
        in: memberIds,
      },
    },
    select: {
      teamMemberId: true,
    },
  });

  const existingIdSet = new Set(existingMembers.map((member) => member.teamMemberId));
  let created = 0;
  let updated = 0;

  for (const member of baselineMembers) {
    await prisma.teamMember.upsert({
      where: { teamMemberId: member.teamMemberId },
      update: { name: member.name },
      create: {
        teamMemberId: member.teamMemberId,
        name: member.name,
      },
    });

    if (existingIdSet.has(member.teamMemberId)) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  return {
    totalBaseline: baselineMembers.length,
    created,
    updated,
  };
}

module.exports = {
  seedBaselineTeamMembers,
};
