const { buildTeamMemberId } = require("./sabbath-import");

const BASELINE_TEAM_MEMBER_NAMES = [
  "Officer Nathan",
  "Officer Aaron",
  "Officer Ree-al",
  "Officer Joshua",
  "Officer Reuben",
  "Officer Joel",
  "Soldier Benjah",
  "Soldier Benjamin",
  "Soldier Mushi",
  "Soldier Zuriel",
  "Soldier Naboth",
  "Soldier Arthur",
  "Soldier Shemuel",
  "Brother Isaiah",
  "Brother Kassi",
  "Brother Beresford",
  "Soldier Micah",
  "Soldier Yeamiah",
];

function buildBaselineTeamMembers() {
  const seenNames = new Set();
  const seenIds = new Set();
  const members = [];

  for (const rawName of BASELINE_TEAM_MEMBER_NAMES) {
    const name = String(rawName ?? "").replace(/\s+/g, " ").trim();
    if (!name) {
      throw new Error("Baseline team member name cannot be empty.");
    }

    const normalizedName = name.toLowerCase();
    if (seenNames.has(normalizedName)) {
      throw new Error(`Duplicate baseline team member name detected: '${name}'.`);
    }
    seenNames.add(normalizedName);

    const teamMemberId = buildTeamMemberId(name);
    if (seenIds.has(teamMemberId)) {
      throw new Error(`Baseline team member ID collision detected: '${teamMemberId}'.`);
    }
    seenIds.add(teamMemberId);

    members.push({
      teamMemberId,
      name,
    });
  }

  return members;
}

module.exports = {
  BASELINE_TEAM_MEMBER_NAMES,
  buildBaselineTeamMembers,
};
