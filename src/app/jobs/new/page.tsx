import { Suspense } from "react";
import { CreateJobForm } from "@/components/create-job-form";

export default function CreateJobPage() {
  return (
    <Suspense
      fallback={
        <main className="app-shell">
          <p className="subtle">Loading form…</p>
        </main>
      }
    >
      <CreateJobForm />
    </Suspense>
  );
}
