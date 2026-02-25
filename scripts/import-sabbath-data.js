const path = require("node:path");
const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");
const { buildTeamMemberId, normalizeKey, parseJobDescriptionSheet, parseSkillsSheet } = require("./lib/sabbath-import");

const DEFAULT_WORKBOOK_PATH =
  "/Users/davian/Desktop/projects/maintenance-israel/WIP - Maintenance Sabbath Check.xlsx";

function ensureAllowedWorkbookPath(resolvedPath) {
  const allowedPath = path.resolve(DEFAULT_WORKBOOK_PATH);
  if (resolvedPath !== allowedPath) {
    throw new Error(
      `Workbook path must be '${DEFAULT_WORKBOOK_PATH}'. Received '${resolvedPath}'.`,
    );
  }
}

function safeFutureDueDate(inputDate) {
  if (!inputDate || Number.isNaN(inputDate.getTime())) {
    return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  }

  const minimum = new Date(Date.now() + 60 * 60 * 1000);
  return inputDate < minimum ? minimum : inputDate;
}

async function upsertSkills(prisma, skillNames) {
  const normalizedToSkill = new Map();
  const created = [];
  const updated = [];
  const existingSkills = await prisma.skill.findMany();
  const existingSkillMap = new Map();
  existingSkills.forEach((skill) => {
    const key = normalizeKey(skill.name);
    if (key) {
      existingSkillMap.set(key, skill);
      normalizedToSkill.set(key, { id: skill.id, name: skill.name });
    }
  });

  for (const skillName of skillNames) {
    const key = normalizeKey(skillName);
    if (!key) continue;
    const skill = existingSkillMap.get(key);

    if (skill) {
      if (skill.name !== skillName) {
        const updatedSkill = await prisma.skill.update({
          where: { id: skill.id },
          data: { name: skillName },
        });
        existingSkillMap.set(key, updatedSkill);
        normalizedToSkill.set(key, { id: updatedSkill.id, name: updatedSkill.name });
      } else {
        normalizedToSkill.set(key, { id: skill.id, name: skill.name });
      }
      updated.push(skillName);
      continue;
    }

    const createdSkill = await prisma.skill.create({
      data: {
        name: skillName,
        description: "Imported from WIP - Maintenance Sabbath Check.xlsx",
        isActive: true,
      },
    });
    existingSkillMap.set(key, createdSkill);
    normalizedToSkill.set(key, { id: createdSkill.id, name: createdSkill.name });
    created.push(createdSkill.name);
  }

  return { normalizedToSkill, created, updated };
}

async function upsertTeamMembersAndAssignments(prisma, teamMemberNames, assignmentMap, skillByKey) {
  const upsertedMembers = [];
  let assignmentRows = 0;

  for (const teamMemberName of teamMemberNames) {
    const teamMemberId = buildTeamMemberId(teamMemberName);
    const member = await prisma.teamMember.upsert({
      where: { teamMemberId },
      update: { name: teamMemberName },
      create: { teamMemberId, name: teamMemberName },
    });
    upsertedMembers.push(member.name);

    await prisma.teamMemberSkill.deleteMany({ where: { teamMemberId } });

    const assignments = assignmentMap.get(teamMemberName) ?? [];
    if (assignments.length === 0) {
      continue;
    }

    const rows = assignments
      .map((assignment) => {
        const skillRecord = skillByKey.get(normalizeKey(assignment.skillName));
        if (!skillRecord) return null;
        return {
          teamMemberId,
          skillId: skillRecord.id,
          name: skillRecord.name,
          skillPercentage: assignment.skillPercentage,
        };
      })
      .filter(Boolean);

    if (rows.length > 0) {
      await prisma.teamMemberSkill.createMany({ data: rows });
      assignmentRows += rows.length;
    }
  }

  return { upsertedMembers, assignmentRows };
}

async function upsertJobs(prisma, jobs) {
  let created = 0;
  let updated = 0;

  for (const job of jobs) {
    const existing = await prisma.job.findFirst({
      where: {
        title: job.title,
        description: job.description,
        location: job.location ?? null,
        subLocation: job.subLocation ?? null,
      },
    });

    const data = {
      title: job.title,
      description: job.description,
      location: job.location ?? null,
      subLocation: job.subLocation ?? null,
      locationRef: job.location ?? null,
      dueDate: safeFutureDueDate(job.dueDate),
      assignedTo: job.doneBy ?? null,
      doneBy: job.doneBy ?? null,
      checkedBy: job.checkedBy ?? null,
      priority: "Medium",
      status: "Scheduled",
    };

    if (existing) {
      await prisma.job.update({
        where: { id: existing.id },
        data,
      });
      updated += 1;
      continue;
    }

    await prisma.job.create({
      data: {
        ...data,
      },
    });
    created += 1;
  }

  return { created, updated };
}

async function main() {
  const workbookPath = process.env.SABBATH_WORKBOOK_PATH ?? DEFAULT_WORKBOOK_PATH;
  const resolvedWorkbookPath = path.resolve(workbookPath);
  ensureAllowedWorkbookPath(resolvedWorkbookPath);

  const workbook = XLSX.readFile(resolvedWorkbookPath, { cellDates: true });
  const skillsSheet = workbook.Sheets["Skills"];
  const jobDescriptionSheet = workbook.Sheets["Job description"];

  if (!skillsSheet) {
    throw new Error("Workbook does not include required 'Skills' sheet.");
  }

  if (!jobDescriptionSheet) {
    throw new Error("Workbook does not include required 'Job description' sheet.");
  }

  const skillsRows = XLSX.utils.sheet_to_json(skillsSheet, { header: 1, defval: null, blankrows: false });
  const jobsRows = XLSX.utils.sheet_to_json(jobDescriptionSheet, { header: 1, defval: null, blankrows: false });

  const parsedSkills = parseSkillsSheet(skillsRows);
  const parsedJobs = parseJobDescriptionSheet(jobsRows);
  const warnings = [...parsedSkills.warnings, ...parsedJobs.warnings];

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();

    const { normalizedToSkill, created: createdSkills, updated: updatedSkills } = await upsertSkills(
      prisma,
      parsedSkills.skills,
    );

    const { upsertedMembers, assignmentRows } = await upsertTeamMembersAndAssignments(
      prisma,
      parsedSkills.teamMemberNames,
      parsedSkills.assignmentMap,
      normalizedToSkill,
    );

    const { created: createdJobs, updated: updatedJobs } = await upsertJobs(
      prisma,
      parsedJobs.jobs,
    );

    console.log("Workbook import completed.");
    console.log(`- Source workbook: ${resolvedWorkbookPath}`);
    console.log(`- Skills upserted: ${createdSkills.length + updatedSkills.length}`);
    console.log(`  - created: ${createdSkills.length}`);
    console.log(`  - updated: ${updatedSkills.length}`);
    console.log(`- Team members upserted: ${upsertedMembers.length}`);
    console.log(`- Team member skill assignments replaced: ${assignmentRows}`);
    console.log(`- Jobs upserted: ${createdJobs + updatedJobs}`);
    console.log(`  - created: ${createdJobs}`);
    console.log(`  - updated: ${updatedJobs}`);

    if (warnings.length > 0) {
      console.log(`- Warnings (${warnings.length}):`);
      warnings.slice(0, 40).forEach((warning) => console.log(`  - ${warning}`));
      if (warnings.length > 40) {
        console.log(`  - ... ${warnings.length - 40} additional warnings omitted`);
      }
    }

    if (process.env.IMPORT_STRICT === "true" && warnings.length > 0) {
      throw new Error(`IMPORT_STRICT enabled: import produced ${warnings.length} warnings.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Failed to import workbook data.");
  console.error(error);
  process.exitCode = 1;
});
