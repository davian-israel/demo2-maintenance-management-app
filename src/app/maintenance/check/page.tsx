import { Suspense } from "react";
import { MaintenanceChecklist } from "@/components/maintenance-checklist";

export default function MaintenanceCheckPage() {
  return (
    <Suspense
      fallback={
        <main className="app-shell">
          <p className="subtle">Loading maintenance checklist…</p>
        </main>
      }
    >
      <MaintenanceChecklist />
    </Suspense>
  );
}
