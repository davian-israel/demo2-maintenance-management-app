const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildTeamMemberId,
  parseDueDate,
  parseJobDescriptionSheet,
  parseSkillsSheet,
} = require("./sabbath-import");

test("parseSkillsSheet extracts team members, skills, and assignments", () => {
  const rows = [
    [null, null, "Name", "Name"],
    [null, "Percentage", "Officer Nathan", "Officer Aaron"],
    ["Painter", "🖌", true, false],
    ["Electrician", "⚡", false, true],
  ];

  const parsed = parseSkillsSheet(rows);

  assert.deepEqual(parsed.teamMemberNames, ["Officer Nathan", "Officer Aaron"]);
  assert.deepEqual(parsed.skills, ["Painter", "Electrician"]);
  assert.equal(parsed.assignmentMap.get("Officer Nathan").length, 1);
  assert.equal(parsed.assignmentMap.get("Officer Nathan")[0].skillName, "Painter");
  assert.equal(parsed.assignmentMap.get("Officer Nathan")[0].skillPercentage, 100);
  assert.equal(parsed.assignmentMap.get("Officer Aaron").length, 1);
  assert.equal(parsed.assignmentMap.get("Officer Aaron")[0].skillName, "Electrician");
});

test("parseJobDescriptionSheet maps sectioned rows to jobs", () => {
  const rows = [
    [null, "Job Description", "Comments", "Date Due", "Days remaining", "Done by", "Check by"],
    ["MainHall", null, null, null, null, null, null],
    ["Walls", "Paint touch-up", "North corner", 45878, -71, "Officer Nathan", "Officer Aaron"],
  ];

  const parsed = parseJobDescriptionSheet(rows);

  assert.equal(parsed.jobs.length, 1);
  assert.equal(parsed.jobs[0].title, "MainHall - Walls");
  assert.equal(parsed.jobs[0].location, "MainHall");
  assert.equal(parsed.jobs[0].subLocation, "Walls");
  assert.equal(parsed.jobs[0].doneBy, "Officer Nathan");
  assert.equal(parsed.jobs[0].checkedBy, "Officer Aaron");
  assert.ok(parsed.jobs[0].dueDate instanceof Date);
});

test("parseDueDate converts excel serial and rejects invalid inputs", () => {
  const fromSerial = parseDueDate(45878);
  assert.ok(fromSerial instanceof Date);

  const invalid = parseDueDate("not-a-date");
  assert.equal(invalid, null);
});

test("buildTeamMemberId normalizes team member names", () => {
  assert.equal(buildTeamMemberId("Officer Aaron "), "tm-officer-aaron");
  assert.equal(buildTeamMemberId("Brother Beresford"), "tm-brother-beresford");
});
