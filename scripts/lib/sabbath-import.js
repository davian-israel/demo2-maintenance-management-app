const EXCEL_EPOCH_OFFSET = 25569;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function normalizeText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
}

function normalizeKey(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized.toLowerCase() : null;
}

function asBooleanMarker(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  const normalized = normalizeKey(value);
  if (!normalized) return false;
  return ["true", "yes", "y", "1", "x", "✓"].includes(normalized);
}

function hasMeaningfulDescription(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "boolean") return value;
  const normalized = normalizeKey(value);
  return Boolean(normalized && normalized !== "0");
}

function excelSerialToDate(serial) {
  if (typeof serial !== "number" || !Number.isFinite(serial) || serial <= 0) {
    return null;
  }
  return new Date(Math.round((serial - EXCEL_EPOCH_OFFSET) * MS_PER_DAY));
}

function parseDueDate(rawValue) {
  if (rawValue instanceof Date && !Number.isNaN(rawValue.getTime())) {
    return rawValue;
  }

  if (typeof rawValue === "number") {
    const asDate = excelSerialToDate(rawValue);
    return asDate;
  }

  const normalized = normalizeText(rawValue);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function buildTeamMemberId(name) {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `tm-${cleaned.slice(0, 36) || "member"}`;
}

function parseSkillsSheet(rows) {
  const warnings = [];
  const headerRow = rows[1] ?? [];
  const teamMemberNames = headerRow
    .slice(2)
    .map((value) => normalizeText(value))
    .filter((value) => Boolean(value));

  const assignmentMap = new Map();
  const seenSkillKeys = new Set();
  const skills = [];

  teamMemberNames.forEach((name) => {
    assignmentMap.set(name, []);
  });

  rows.slice(2).forEach((row, index) => {
    const rowNumber = index + 3;
    const skillName = normalizeText(row[0]);
    if (!skillName) {
      return;
    }

    const skillKey = normalizeKey(skillName);
    if (!skillKey) return;
    if (!seenSkillKeys.has(skillKey)) {
      seenSkillKeys.add(skillKey);
      skills.push(skillName);
    }

    teamMemberNames.forEach((teamMemberName, teamMemberIndex) => {
      const value = row[teamMemberIndex + 2];
      if (!asBooleanMarker(value)) return;
      assignmentMap.get(teamMemberName).push({
        skillName,
        skillPercentage: 100,
      });
    });

    if (skillName.length < 2) {
      warnings.push(`Skills row ${rowNumber}: short skill name '${skillName}'.`);
    }
  });

  return {
    teamMemberNames,
    skills,
    assignmentMap,
    warnings,
  };
}

function parseJobDescriptionSheet(rows) {
  const jobs = [];
  const warnings = [];
  let currentSection = null;

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const label = normalizeText(row[0]);
    const descriptionValue = row[1];

    if (!label && !hasMeaningfulDescription(descriptionValue)) {
      return;
    }

    if (label && !hasMeaningfulDescription(descriptionValue)) {
      currentSection = label;
      return;
    }

    if (!label) {
      warnings.push(`Job description row ${rowNumber}: missing item label.`);
      return;
    }

    const description = normalizeText(descriptionValue);
    if (!description || description === "0") {
      warnings.push(`Job description row ${rowNumber}: skipped due to empty description.`);
      return;
    }

    const comments = normalizeText(row[2]);
    const dueDate = parseDueDate(row[3]);
    const doneBy = normalizeText(row[5]);
    const checkedBy = normalizeText(row[6]);
    const sectionPrefix = currentSection && currentSection !== label ? `${currentSection} - ` : "";

    jobs.push({
      title: `${sectionPrefix}${label}`,
      description: comments ? `${description}\n${comments}` : description,
      location: currentSection,
      subLocation: label,
      dueDate,
      doneBy,
      checkedBy,
    });
  });

  return { jobs, warnings };
}

module.exports = {
  buildTeamMemberId,
  parseSkillsSheet,
  parseJobDescriptionSheet,
  parseDueDate,
  normalizeText,
  normalizeKey,
};
