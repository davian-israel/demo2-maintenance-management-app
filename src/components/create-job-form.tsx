"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Skill = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type Job = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | Date;
  status: string;
  priority: string;
  location: string | null;
  subLocation: string | null;
  assignedTo: string | null;
  doneBy: string | null;
  checkedBy: string | null;
  requiredSkills: string[];
};

function toLocalDateTimeValue(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function CreateJobForm() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobDueDate, setJobDueDate] = useState("");
  const [jobAssignee, setJobAssignee] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSubLocation, setJobSubLocation] = useState("");
  const [jobDoneBy, setJobDoneBy] = useState("");
  const [jobCheckedBy, setJobCheckedBy] = useState("");
  const [jobPriority, setJobPriority] = useState("Medium");
  const [jobRequiredSkills, setJobRequiredSkills] = useState<string[]>([]);

  const loadSkills = useCallback(async () => {
    try {
      const response = await fetch("/api/skills", { cache: "no-store" });
      const payload = (await response.json()) as { skills?: Skill[]; message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to load skills.");
      }

      setSkills(payload.skills ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills.");
    }
  }, []);

  useEffect(() => {
    loadSkills();
    setJobDueDate(toLocalDateTimeValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
  }, [loadSkills]);

  function toggleSkillSelection(skillId: string) {
    setJobRequiredSkills((current) =>
      current.includes(skillId)
        ? current.filter((selected) => selected !== skillId)
        : [...current, skillId],
    );
  }

  async function createJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          description: jobDescription || null,
          dueDate: new Date(jobDueDate).toISOString(),
          assignedTo: jobAssignee || null,
          location: jobLocation || null,
          subLocation: jobSubLocation || null,
          doneBy: jobDoneBy || null,
          checkedBy: jobCheckedBy || null,
          priority: jobPriority,
          requiredSkills: jobRequiredSkills,
        }),
      });
      const payload = (await response.json()) as { job?: Job; message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to create job.");
      }

      setMessage(`Job '${payload.job?.title ?? "new job"}' created successfully.`);
      setJobTitle("");
      setJobDescription("");
      setJobDueDate(toLocalDateTimeValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
      setJobAssignee("");
      setJobLocation("");
      setJobSubLocation("");
      setJobDoneBy("");
      setJobCheckedBy("");
      setJobPriority("Medium");
      setJobRequiredSkills([]);

      setTimeout(() => {
        router.push("/jobs");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create job");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Jobs</p>
          <h1>Create New Job</h1>
          <p className="subtle">Create a new maintenance job with all required details.</p>
        </div>
      </section>

      {error ? <section className="error-banner">{error}</section> : null}
      {message ? <section className="card">{message}</section> : null}

      <section className="card">
        <form className="stack" onSubmit={createJob}>
          <div>
            <label>
              Title
              <input
                data-testid="job-title-input"
                placeholder="Replace filter on Pump #3"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                required
              />
            </label>
          </div>

          <div>
            <label>
              Description
              <textarea
                placeholder="Description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={3}
              />
            </label>
          </div>

          <div className="field-row">
            <label>
              Due Date
              <input
                data-testid="job-due-date-input"
                type="datetime-local"
                value={jobDueDate}
                onChange={(event) => setJobDueDate(event.target.value)}
                required
              />
            </label>
            <label>
              Priority
              <select value={jobPriority} onChange={(event) => setJobPriority(event.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>
          </div>

          <div>
            <label>
              Assignee
              <input
                placeholder="Assignee"
                value={jobAssignee}
                onChange={(event) => setJobAssignee(event.target.value)}
              />
            </label>
          </div>

          <div className="field-row">
            <label>
              Location
              <input
                data-testid="job-location-input"
                placeholder="Location"
                value={jobLocation}
                onChange={(event) => setJobLocation(event.target.value)}
              />
            </label>
            <label>
              Sub-location
              <input
                data-testid="job-sublocation-input"
                placeholder="Sub-location"
                value={jobSubLocation}
                onChange={(event) => setJobSubLocation(event.target.value)}
              />
            </label>
          </div>

          <div className="field-row">
            <label>
              Done by
              <input
                data-testid="job-done-by-input"
                placeholder="Done by"
                value={jobDoneBy}
                onChange={(event) => setJobDoneBy(event.target.value)}
              />
            </label>
            <label>
              Checked by
              <input
                data-testid="job-checked-by-input"
                placeholder="Checked by"
                value={jobCheckedBy}
                onChange={(event) => setJobCheckedBy(event.target.value)}
              />
            </label>
          </div>

          <div>
            <p className="label">Required Skills</p>
            <div className="checkbox-grid">
              {skills.map((skill) => (
                <label key={skill.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={jobRequiredSkills.includes(skill.id)}
                    onChange={() => toggleSkillSelection(skill.id)}
                  />
                  {skill.name}
                </label>
              ))}
              {skills.length === 0 ? <p className="subtle">No skills available.</p> : null}
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="btn-primary" data-testid="create-job-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
