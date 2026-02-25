"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

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

type Skill = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export function TeamMemberSkillAssignmentPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [teamMemberResponse, skillsResponse] = await Promise.all([
          fetch("/api/team-members", { cache: "no-store" }),
          fetch("/api/skills", { cache: "no-store" }),
        ]);

        const teamMemberPayload = (await teamMemberResponse.json()) as {
          teamMembers?: TeamMember[];
          message?: string;
        };
        const skillsPayload = (await skillsResponse.json()) as {
          skills?: Skill[];
          message?: string;
        };

        if (!teamMemberResponse.ok) {
          throw new Error(teamMemberPayload.message ?? "Failed to load team members.");
        }

        if (!skillsResponse.ok) {
          throw new Error(skillsPayload.message ?? "Failed to load skills.");
        }

        if (!mounted) return;

        const loadedMembers = teamMemberPayload.teamMembers ?? [];
        const loadedSkills = (skillsPayload.skills ?? []).filter((skill) => skill.isActive);
        setTeamMembers(loadedMembers);
        setSkills(loadedSkills);

        if (loadedMembers.length > 0) {
          const initialMemberId = loadedMembers[0].teamMemberId;
          setSelectedTeamMemberId(initialMemberId);
          const initialMember = loadedMembers[0];
          const initialSelection: Record<string, number> = {};
          initialMember.skills.forEach((skill) => {
            initialSelection[skill.skillId] = skill.skillPercentage;
          });
          setSelectedSkills(initialSelection);
        }
      } catch (cause) {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Failed to load assignment data.");
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedMember = useMemo(
    () => teamMembers.find((member) => member.teamMemberId === selectedTeamMemberId) ?? null,
    [selectedTeamMemberId, teamMembers],
  );

  function onTeamMemberChange(teamMemberId: string) {
    setSelectedTeamMemberId(teamMemberId);
    setMessage(null);
    setError(null);
    const member = teamMembers.find((item) => item.teamMemberId === teamMemberId);
    const mapped: Record<string, number> = {};
    member?.skills.forEach((skill) => {
      mapped[skill.skillId] = skill.skillPercentage;
    });
    setSelectedSkills(mapped);
  }

  function toggleSkill(skillId: string) {
    setSelectedSkills((current) => {
      if (Object.prototype.hasOwnProperty.call(current, skillId)) {
        const next = { ...current };
        delete next[skillId];
        return next;
      }
      return { ...current, [skillId]: 100 };
    });
  }

  function setSkillPercentage(skillId: string, value: string) {
    const parsed = Number.parseInt(value, 10);
    setSelectedSkills((current) => ({
      ...current,
      [skillId]: Number.isNaN(parsed) ? 0 : parsed,
    }));
  }

  async function saveAssignments(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedTeamMemberId) {
      setError("Select a team member before saving assignments.");
      return;
    }

    const payloadSkills = Object.entries(selectedSkills).map(([skillId, skillPercentage]) => ({
      skillId,
      skillPercentage,
    }));

    setIsSaving(true);
    try {
      const response = await fetch(`/api/team-members/${selectedTeamMemberId}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: payloadSkills }),
      });
      const payload = (await response.json()) as { message?: string; teamMember?: TeamMember };

      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to save assignments.");
      }

      const updatedMember = payload.teamMember ?? null;
      if (updatedMember) {
        setTeamMembers((current) =>
          current.map((member) =>
            member.teamMemberId === updatedMember.teamMemberId ? updatedMember : member,
          ),
        );
      }

      setMessage("Skill assignments updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save assignments.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Workforce Directory</p>
          <h1>Assign Skills</h1>
          <p className="subtle">Select a team member and assign existing skills.</p>
        </div>
        <div className="actions">
          <Link href="/team-members" className="btn-secondary" data-testid="back-to-team-members">
            Back To Team Members
          </Link>
        </div>
      </section>

      {error ? <section className="error-banner" data-testid="assignment-error">{error}</section> : null}
      {message ? <section className="card">{message}</section> : null}

      <section className="card">
        <form className="stack" onSubmit={saveAssignments} data-testid="assign-skills-form">
          <h2>Assign Existing Skills</h2>
          <label>
            Team Member
            <select
              value={selectedTeamMemberId}
              onChange={(event) => onTeamMemberChange(event.target.value)}
              data-testid="assign-team-member-select"
            >
              <option value="">
                {teamMembers.length === 0 ? "No team members available" : "Select team member"}
              </option>
              {teamMembers.map((teamMember) => (
                <option key={teamMember.teamMemberId} value={teamMember.teamMemberId}>
                  {teamMember.name} ({teamMember.teamMemberId})
                </option>
              ))}
            </select>
          </label>

          {skills.length === 0 ? (
            <p className="subtle" data-testid="no-existing-skills-message">
              No existing skills available. Create skills first.
            </p>
          ) : (
            <div className="stack" data-testid="existing-skills-list">
              {skills.map((skill) => {
                const selected = Object.prototype.hasOwnProperty.call(selectedSkills, skill.id);
                return (
                  <div key={skill.id} className="checklist-row">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSkill(skill.id)}
                        data-testid={`assign-skill-checkbox-${skill.id}`}
                      />
                      {skill.name}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={!selected}
                      value={selected ? selectedSkills[skill.id] : 0}
                      onChange={(event) => setSkillPercentage(skill.id, event.target.value)}
                      data-testid={`skill-percentage-${skill.id}`}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {selectedMember ? (
            <p className="subtle">
              Current member: {selectedMember.name} ({selectedMember.teamMemberId})
            </p>
          ) : null}

          <button type="submit" className="btn-primary" data-testid="submit-assign-skills-button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Assignments"}
          </button>
        </form>
      </section>
    </main>
  );
}
