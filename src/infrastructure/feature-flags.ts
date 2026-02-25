export const featureFlags = {
  checklistEnabled: process.env.FEATURE_CHECKLIST_ENABLED !== "false",
};

export function assertChecklistEnabled() {
  if (!featureFlags.checklistEnabled) {
    throw new Error("Checklist feature is disabled by FEATURE_CHECKLIST_ENABLED flag.");
  }
}
