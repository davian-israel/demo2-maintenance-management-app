import { test, expect } from "@playwright/test";

function futureLocalDateTime(hoursAhead = 6) {
  const date = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function futureIsoDate(hoursAhead = 6) {
  return new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString();
}

test("theme toggle works", async ({ page }) => {
  await page.goto("/");
  const root = page.locator("html");
  const toggle = page.getByTestId("theme-toggle");

  await toggle.click();
  await expect(root).toHaveClass(/dark/);

  await toggle.click();
  await expect(root).not.toHaveClass(/dark/);
});

test("can create skill, create job, log run, and complete", async ({ page }) => {
  await page.goto("/");
  const runId = Date.now();
  const skillName = `Electrical-${runId}`;
  const jobTitle = `Replace filter on Pump #3 (${runId})`;

  await page.getByTestId("skill-name-input").fill(skillName);
  await page.getByTestId("create-skill-button").click();
  await expect(page.getByTestId("skill-list")).toContainText(skillName);

  await page.getByTestId("job-title-input").fill(jobTitle);
  await page.getByTestId("job-due-date-input").fill(futureLocalDateTime());
  await page.getByTestId("job-location-input").fill("Main Facility");
  await page.getByTestId("job-sublocation-input").fill("Pump Bay 3");
  await page.getByTestId("job-done-by-input").fill("tech.operator");
  await page.getByTestId("job-checked-by-input").fill("qa.supervisor");
  await page.getByTestId("create-job-button").click();

  await expect(page.getByTestId("job-list")).toContainText(jobTitle);
  await expect(page.getByTestId("job-list")).toContainText("Location: Main Facility");
  await expect(page.getByTestId("job-list")).toContainText("Sub-location: Pump Bay 3");
  await expect(page.getByTestId("job-list")).toContainText("Done by: tech.operator");
  await expect(page.getByTestId("job-list")).toContainText("Checked by: qa.supervisor");

  const jobItem = page.locator("li.job-item", { hasText: jobTitle });
  await jobItem.getByRole("button", { name: "Start" }).click();
  await expect(jobItem).toContainText("InProgress");

  await jobItem.getByRole("button", { name: "Log Run" }).click();
  await expect(jobItem).toContainText("Runs: 1");

  await jobItem.getByRole("button", { name: "Complete" }).click();
  await expect(jobItem).toContainText("Completed");

  await page.getByTestId("sidebar-link-jobs").click();
  await expect(page).toHaveURL(/\/jobs$/);
  await expect(page.getByTestId("jobs-directory-list")).toContainText(jobTitle);
  await expect(page.getByTestId("jobs-directory-list")).toContainText("Location: Main Facility");
  await expect(page.getByTestId("jobs-directory-list")).toContainText("Sub-location: Pump Bay 3");
  await expect(page.getByTestId("jobs-directory-list")).toContainText("Done by: tech.operator");
  await expect(page.getByTestId("jobs-directory-list")).toContainText("Checked by: qa.supervisor");
});

test("jobs API includes metadata fields with null-safe defaults", async ({ request }) => {
  const runId = Date.now();
  const explicitTitle = `API Metadata Job (${runId})`;
  const fallbackTitle = `API Null Metadata Job (${runId})`;

  const explicitResponse = await request.post("/api/jobs", {
    data: {
      title: explicitTitle,
      dueDate: futureIsoDate(),
      location: "Kitchen",
      subLocation: "Counter",
      doneBy: "tech.api",
      checkedBy: "qa.api",
    },
  });

  expect(explicitResponse.status()).toBe(201);
  const explicitPayload = await explicitResponse.json();
  expect(explicitPayload.job.location).toBe("Kitchen");
  expect(explicitPayload.job.subLocation).toBe("Counter");
  expect(explicitPayload.job.doneBy).toBe("tech.api");
  expect(explicitPayload.job.checkedBy).toBe("qa.api");

  const fallbackResponse = await request.post("/api/jobs", {
    data: {
      title: fallbackTitle,
      dueDate: futureIsoDate(8),
    },
  });

  expect(fallbackResponse.status()).toBe(201);
  const fallbackPayload = await fallbackResponse.json();
  expect(fallbackPayload.job.location).toBeNull();
  expect(fallbackPayload.job.subLocation).toBeNull();
  expect(fallbackPayload.job.doneBy).toBeNull();
  expect(fallbackPayload.job.checkedBy).toBeNull();

  const listResponse = await request.get("/api/jobs");
  expect(listResponse.status()).toBe(200);
  const listPayload = await listResponse.json();

  const explicitJob = listPayload.jobs.find((job: { title: string }) => job.title === explicitTitle);
  expect(explicitJob).toBeTruthy();
  expect(explicitJob.location).toBe("Kitchen");
  expect(explicitJob.subLocation).toBe("Counter");
  expect(explicitJob.doneBy).toBe("tech.api");
  expect(explicitJob.checkedBy).toBe("qa.api");

  const fallbackJob = listPayload.jobs.find((job: { title: string }) => job.title === fallbackTitle);
  expect(fallbackJob).toBeTruthy();
  expect(fallbackJob.location).toBeNull();
  expect(fallbackJob.subLocation).toBeNull();
  expect(fallbackJob.doneBy).toBeNull();
  expect(fallbackJob.checkedBy).toBeNull();
});

test("jobs page shows fallback metadata labels when values are missing", async ({ page }) => {
  await page.goto("/");
  const runId = Date.now();
  const jobTitle = `Fallback Metadata Job (${runId})`;

  await page.getByTestId("job-title-input").fill(jobTitle);
  await page.getByTestId("job-due-date-input").fill(futureLocalDateTime(9));
  await page.getByTestId("create-job-button").click();

  await page.getByTestId("sidebar-link-jobs").click();
  await expect(page).toHaveURL(/\/jobs$/);

  const jobRow = page.locator("li.job-item", { hasText: jobTitle });
  await expect(jobRow).toContainText("Location: Not set");
  await expect(jobRow).toContainText("Sub-location: Not set");
  await expect(jobRow).toContainText("Done by: Not set");
  await expect(jobRow).toContainText("Checked by: Not set");
});

test("team-members API enforces percentage validation and returns nested skills", async ({ request }) => {
  const runId = Date.now();

  const createResponse = await request.post("/api/team-members", {
    data: {
      teamMemberId: `tm-${runId}`,
      name: `Alex Rivera ${runId}`,
      skills: [
        {
          skillId: `hvac-${runId}`,
          name: "HVAC",
          skillPercentage: 88,
        },
      ],
    },
  });

  expect(createResponse.status()).toBe(201);
  const createPayload = (await createResponse.json()) as {
    teamMember: {
      teamMemberId: string;
      name: string;
      skills: Array<{ skillId: string; name: string; skillPercentage: number }>;
    };
  };
  expect(createPayload.teamMember.teamMemberId).toBe(`tm-${runId}`);
  expect(createPayload.teamMember.name).toBe(`Alex Rivera ${runId}`);
  expect(createPayload.teamMember.skills).toHaveLength(1);
  expect(createPayload.teamMember.skills[0].skillId).toBe(`hvac-${runId}`);
  expect(createPayload.teamMember.skills[0].name).toBe("HVAC");
  expect(createPayload.teamMember.skills[0].skillPercentage).toBe(88);

  const invalidResponse = await request.post("/api/team-members", {
    data: {
      teamMemberId: `tm-invalid-${runId}`,
      name: `Invalid Percent ${runId}`,
      skills: [
        {
          skillId: `invalid-skill-${runId}`,
          name: "Electrical",
          skillPercentage: 120,
        },
      ],
    },
  });
  expect(invalidResponse.status()).toBe(400);

  const listResponse = await request.get("/api/team-members");
  expect(listResponse.status()).toBe(200);
  const listPayload = (await listResponse.json()) as {
    teamMembers: Array<{
      teamMemberId: string;
      name: string;
      skills: Array<{ skillId: string; name: string; skillPercentage: number }>;
    }>;
  };

  const seededMember = listPayload.teamMembers.find(
    (teamMember) => teamMember.teamMemberId === `tm-${runId}`,
  );
  expect(seededMember).toBeTruthy();
  expect(seededMember?.skills[0].name).toBe("HVAC");
  expect(seededMember?.skills[0].skillPercentage).toBe(88);
});

test("team-members page is reachable from sidebar and renders skills/fallback", async ({
  page,
  request,
}) => {
  const runId = Date.now();
  const skilledMemberId = `tm-skilled-${runId}`;
  const unskilledMemberId = `tm-unskilled-${runId}`;
  const skilledMemberName = `Jordan Skilled ${runId}`;
  const unskilledMemberName = `Taylor Unskilled ${runId}`;

  await request.post("/api/team-members", {
    data: {
      teamMemberId: skilledMemberId,
      name: skilledMemberName,
      skills: [
        {
          skillId: `skill-elec-${runId}`,
          name: "Electrical",
          skillPercentage: 95,
        },
        {
          skillId: `skill-plumb-${runId}`,
          name: "Plumbing",
          skillPercentage: 72,
        },
      ],
    },
  });

  await request.post("/api/team-members", {
    data: {
      teamMemberId: unskilledMemberId,
      name: unskilledMemberName,
      skills: [],
    },
  });

  await page.goto("/");
  await page.getByTestId("sidebar-link-team-members").click();
  await expect(page).toHaveURL(/\/team-members$/);

  const teamMembersLink = page.getByTestId("sidebar-link-team-members");
  await expect(teamMembersLink).toHaveAttribute("aria-current", "page");

  const directory = page.getByTestId("team-members-directory-list");
  await expect(directory).toContainText(skilledMemberName);
  await expect(directory).toContainText(`ID: ${skilledMemberId}`);
  await expect(directory).toContainText("Electrical (95%)");
  await expect(directory).toContainText("Plumbing (72%)");
  await expect(directory).toContainText(unskilledMemberName);
  await expect(directory).toContainText(`ID: ${unskilledMemberId}`);

  const unskilledRow = page.locator("li.job-item", { hasText: unskilledMemberName });
  await expect(unskilledRow).toContainText("No skills assigned.");
});

test("add new team member button opens form and creates a team member", async ({ page }) => {
  const runId = Date.now();
  const teamMemberName = `Morgan Builder ${runId}`;
  const teamMemberId = `tm-form-${runId}`;

  await page.goto("/team-members");
  await page.getByTestId("open-add-team-member-button").click();
  await expect(page.getByTestId("add-team-member-form")).toBeVisible();

  await page.getByTestId("add-team-member-name-input").fill(teamMemberName);
  await page.getByTestId("add-team-member-id-input").fill(teamMemberId);
  await page.getByTestId("submit-add-team-member-button").click();

  const directory = page.getByTestId("team-members-directory-list");
  await expect(directory).toContainText(teamMemberName);
  await expect(directory).toContainText(`ID: ${teamMemberId}`);
});

test("assign skills page validates team member selection", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("sidebar-link-assign-skills").click();
  await expect(page).toHaveURL(/\/team-members\/assign-skills$/);

  await page.getByTestId("assign-team-member-select").selectOption("");
  await page.getByTestId("submit-assign-skills-button").click();
  await expect(page.getByTestId("assignment-error")).toContainText(
    "Select a team member before saving assignments.",
  );
});

test("assign skills page assigns existing skills and updates team member view", async ({
  page,
  request,
}) => {
  const runId = Date.now();
  const teamMemberName = `Casey Assign ${runId}`;
  const teamMemberId = `tm-assign-${runId}`;

  const electricalResponse = await request.post("/api/skills", {
    data: {
      name: `Electrical Assign ${runId}`,
      description: "Skill used for assignment test",
    },
  });
  expect(electricalResponse.status()).toBe(201);
  const electricalPayload = (await electricalResponse.json()) as {
    skill: { id: string; name: string };
  };

  const hvacResponse = await request.post("/api/skills", {
    data: {
      name: `HVAC Assign ${runId}`,
      description: "Skill used for assignment test",
    },
  });
  expect(hvacResponse.status()).toBe(201);
  const hvacPayload = (await hvacResponse.json()) as {
    skill: { id: string; name: string };
  };

  const teamMemberResponse = await request.post("/api/team-members", {
    data: {
      teamMemberId,
      name: teamMemberName,
      skills: [],
    },
  });
  expect(teamMemberResponse.status()).toBe(201);

  await page.goto("/team-members/assign-skills");
  await page.getByTestId("assign-team-member-select").selectOption(teamMemberId);

  await page.getByTestId(`assign-skill-checkbox-${electricalPayload.skill.id}`).check();
  await page.getByTestId(`assign-skill-checkbox-${hvacPayload.skill.id}`).check();

  await page
    .getByTestId(`skill-percentage-${electricalPayload.skill.id}`)
    .fill("87");
  await page
    .getByTestId(`skill-percentage-${hvacPayload.skill.id}`)
    .fill("64");

  await page.getByTestId("submit-assign-skills-button").click();
  await expect(page.getByText("Skill assignments updated.")).toBeVisible();

  await page.getByTestId("back-to-team-members").click();
  await expect(page).toHaveURL(/\/team-members$/);

  const row = page.locator("li.job-item", { hasText: teamMemberName });
  await expect(row).toContainText(`${electricalPayload.skill.name} (87%)`);
  await expect(row).toContainText(`${hvacPayload.skill.name} (64%)`);
});

test("rejects unknown checklist sector/component payload", async ({ request }) => {
  await request.post("/api/checklist/seed");

  const response = await request.post("/api/checklist/sessions", {
    data: {
      inspector: "qa.engineer",
      inspectedAt: new Date().toISOString(),
      observations: [
        {
          sectorName: "Unknown Zone",
          componentName: "Ghost Component",
          status: "Fail",
          comments: "invalid payload",
        },
      ],
    },
  });

  expect(response.status()).toBe(400);
});

test("checklist failure creates corrective job and resolves after completion", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("seed-catalog-button").click();
  await expect(page.getByTestId("sector-checklist-grid")).toContainText("Main Hall");

  const firstStatusSelect = page.locator(".checklist-row select").first();
  await firstStatusSelect.selectOption("Fail");

  const firstCommentInput = page
    .locator(".checklist-row")
    .first()
    .locator("input[placeholder='Comments']");
  await firstCommentInput.fill("Paint damage observed");

  await page.getByTestId("submit-checklist-button").click();

  await expect(page.getByTestId("unresolved-findings-section")).toContainText("Scheduled");
  await expect(page.getByTestId("job-list")).toContainText("Corrective:");

  const correctiveJob = page.locator("li.job-item", { hasText: "Corrective:" }).first();
  await correctiveJob.getByRole("button", { name: "Start" }).click();
  await correctiveJob.getByRole("button", { name: "Log Run" }).click();
  await correctiveJob.getByRole("button", { name: "Complete" }).click();

  await expect(correctiveJob).toContainText("Completed");
  await expect(page.getByTestId("unresolved-findings-section")).toContainText(
    "No unresolved failed observations.",
  );
});
