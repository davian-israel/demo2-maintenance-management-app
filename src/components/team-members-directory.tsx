"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { DataTableComponent, type DataTableColumn } from "@/components/data-table";

type TeamMemberSkill = {
  skillId: string;
  name: string;
  skillPercentage: number;
};

type TeamMember = {
  teamMemberId: string;
  name: string;
  skills: TeamMemberSkill[];
};

function renderSkills(data: unknown): string {
  const skills = data as TeamMemberSkill[];
  if (!skills || skills.length === 0) {
    return "No skills assigned";
  }
  return skills.map((s) => `${s.name} (${s.skillPercentage}%)`).join(", ");
}

const columns: DataTableColumn[] = [
  { title: "Name", data: "name", className: "font-medium" },
  { title: "ID", data: "teamMemberId" },
  { title: "Skills", data: "skills", render: renderSkills },
];

export function TeamMembersDirectory() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamMemberName, setTeamMemberName] = useState("");
  const [teamMemberId, setTeamMemberId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTeamMembers = useCallback(async () => {
    const response = await fetch("/api/team-members", { cache: "no-store" });
    const payload = (await response.json()) as { teamMembers?: TeamMember[]; message?: string };

    if (!response.ok) {
      throw new Error(payload.message ?? "Failed to load team members.");
    }

    setTeamMembers(payload.teamMembers ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        await loadTeamMembers();
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Failed to load team members.");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadTeamMembers]);

  async function createTeamMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamMemberName,
          teamMemberId: teamMemberId || undefined,
          skills: [],
        }),
      });
      const payload = (await response.json()) as {
        teamMember?: TeamMember;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to create team member.");
      }

      setTeamMemberName("");
      setTeamMemberId("");
      setShowCreateForm(false);
      setMessage(`Team member '${payload.teamMember?.name ?? "new member"}' created.`);
      await loadTeamMembers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to create team member.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Workforce Directory</p>
          <h1>Team Members</h1>
          <p className="subtle">Skill profiles with percentage proficiency by team member.</p>
        </div>
        <div className="actions">
          <Link href="/team-members/assign-skills" className="btn-secondary" data-testid="open-assign-skills-page">
            Assign Skills
          </Link>
          <button
            type="button"
            className="btn-primary"
            data-testid="open-add-team-member-button"
            onClick={() => {
              setShowCreateForm((value) => !value);
              setError(null);
              setMessage(null);
            }}
          >
            Add New Team Member
          </button>
        </div>
      </section>

      {error ? <section className="error-banner">{error}</section> : null}
      {message ? <section className="card">{message}</section> : null}

      <section className="card">
        {showCreateForm ? (
          <form className="stack" onSubmit={createTeamMember} data-testid="add-team-member-form">
            <h2>Add Team Member</h2>
            <input
              data-testid="add-team-member-name-input"
              placeholder="Full Name"
              value={teamMemberName}
              onChange={(event) => setTeamMemberName(event.target.value)}
              required
            />
            <input
              data-testid="add-team-member-id-input"
              placeholder="Team Member ID (optional)"
              value={teamMemberId}
              onChange={(event) => setTeamMemberId(event.target.value)}
            />
            <div className="actions">
              <button type="submit" className="btn-primary" data-testid="submit-add-team-member-button" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Team Member"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <h2>Team Members</h2>
        {teamMembers.length > 0 ? (
          <DataTableComponent columns={columns} data={teamMembers} />
        ) : (
          <p>No team members yet.</p>
        )}
      </section>
    </main>
  );
}
