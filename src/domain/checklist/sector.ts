import { randomUUID } from "node:crypto";
import type { Sector, SectorChecklistItem } from "@/domain/checklist/types";

class ChecklistDomainError extends Error {}

export class SectorTemplate {
  private readonly data: Sector;

  private constructor(data: Sector) {
    this.data = data;
  }

  static create(name: string, items: Array<{ componentName: string; required: boolean; displayOrder: number }>) {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new ChecklistDomainError("Sector name is required.");
    }

    const seen = new Set<string>();
    const normalizedItems: SectorChecklistItem[] = items.map((item) => {
      const normalizedComponent = item.componentName.trim();
      if (!normalizedComponent) {
        throw new ChecklistDomainError("Checklist component name is required.");
      }
      const key = normalizedComponent.toLowerCase();
      if (seen.has(key)) {
        throw new ChecklistDomainError(`Duplicate component '${normalizedComponent}' in sector '${normalizedName}'.`);
      }
      seen.add(key);
      return {
        id: randomUUID(),
        componentId: randomUUID(),
        componentName: normalizedComponent,
        required: item.required,
        displayOrder: item.displayOrder,
      };
    });

    return new SectorTemplate({
      id: randomUUID(),
      name: normalizedName,
      items: normalizedItems,
    });
  }

  static rehydrate(sector: Sector) {
    return new SectorTemplate(sector);
  }

  get snapshot() {
    return structuredClone(this.data);
  }
}

export function isChecklistDomainError(error: unknown): error is Error {
  return error instanceof Error && error.name === "Error";
}
