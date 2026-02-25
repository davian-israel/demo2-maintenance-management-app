const test = require("node:test");
const assert = require("node:assert/strict");
const { BASELINE_TEAM_MEMBER_NAMES, buildBaselineTeamMembers } = require("./baseline-team-members");

test("buildBaselineTeamMembers returns deterministic unique members", () => {
  const members = buildBaselineTeamMembers();
  const ids = new Set(members.map((member) => member.teamMemberId));
  const names = members.map((member) => member.name);

  assert.equal(members.length, BASELINE_TEAM_MEMBER_NAMES.length);
  assert.equal(ids.size, members.length);
  assert.deepEqual(names, BASELINE_TEAM_MEMBER_NAMES);
  assert.ok(members.every((member) => member.teamMemberId.startsWith("tm-")));
});
