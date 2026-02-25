"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Skill = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export function SkillsDirectory() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillName, setSkillName] = useState("");
  const [skillDescription, setSkillDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSkills = useCallback(async () => {
    const response = await fetch("/api/skills", { cache: "no-store" });
    const payload = (await response.json()) as { skills?: Skill[]; message?: string };

    if (!response.ok) {
      throw new Error(payload.message ?? "Failed to load skills.");
    }

    setSkills(payload.skills ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        await loadSkills();
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Failed to load skills.");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadSkills]);

  async function createSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: skillName,
          description: skillDescription || null,
        }),
      });
      const payload = (await response.json()) as {
        skill?: Skill;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to create skill.");
      }

      setSkillName("");
      setSkillDescription("");
      setMessage(`Skill '${payload.skill?.name ?? "new skill"}' created.`);
      await loadSkills();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to create skill.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Skills</p>
          <h1>Skill Catalog</h1>
          <p className="subtle">Create and review maintenance skills used across the app.</p>
        </div>
      </section>

      {error ? <section className="error-banner">{error}</section> : null}
      {message ? <section className="card">{message}</section> : null}

      <section className="card" data-testid="skills-directory-card">
        <h2>Skill Catalog</h2>
        <form className="stack" onSubmit={createSkill}>
          <input
            data-testid="skill-name-input"
            placeholder="Electrical"
            value={skillName}
            onChange={(event) => setSkillName(event.target.value)}
            required
          />
          <input
            placeholder="Description"
            value={skillDescription}
            onChange={(event) => setSkillDescription(event.target.value)}
          />
          <button type="submit" className="btn-primary" data-testid="create-skill-button" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Create Skill"}
          </button>
        </form>

        <ul className="chip-list" data-testid="skill-list">
          {skills.map((skill) => (
            <li key={skill.id}>{skill.name}</li>
          ))}
          {skills.length === 0 ? <li>No skills yet.</li> : null}
        </ul>
      </section>
    </main>
  );
}
