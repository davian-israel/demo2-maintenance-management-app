import { MaintenanceDashboard } from "@/components/maintenance-dashboard";
import { featureFlags } from "@/infrastructure/feature-flags";
import { services } from "@/infrastructure/services";

export default async function HomePage() {
  const [skills, jobs, summary] = await Promise.all([
    services.skills.listSkills(),
    services.jobs.listJobs(),
    services.reporting.getSummary(),
  ]);

  const [sectors, findings, trends] = featureFlags.checklistEnabled
    ? await Promise.all([
        services.checklist.listCatalog(),
        services.checklist.listUnresolvedFindings(),
        services.checklist.listFailureTrends({}),
      ])
    : [[], [], []];

  return (
    <MaintenanceDashboard
      initialSkills={skills}
      initialJobs={jobs}
      initialSummary={summary}
      initialSectors={sectors}
      initialFindings={findings}
      initialTrends={trends}
    />
  );
}
