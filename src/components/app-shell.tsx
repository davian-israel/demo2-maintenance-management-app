"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

type AppShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Dashboard", testId: "sidebar-link-dashboard" },
  { href: "/maintenance/check", label: "Maintenance check", testId: "sidebar-link-maintenance-check" },
  { href: "/jobs", label: "Jobs", testId: "sidebar-link-jobs" },
  { href: "/jobs/new", label: "Add New Job", testId: "sidebar-link-add-job" },
  { href: "/skills", label: "Skill Catalog", testId: "sidebar-link-skills" },
  { href: "/team-members", label: "Team Members", testId: "sidebar-link-team-members" },
  { href: "/team-members/assign-skills", label: "Assign Skills", testId: "sidebar-link-assign-skills" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="layout-shell">
      <aside className="app-sidebar" data-testid="app-sidebar">
        <div>
          <p className="eyebrow">Navigation</p>
          <h2>Maintenance</h2>
        </div>
        <nav className="sidebar-nav" aria-label="Primary">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={`sidebar-link${active ? " sidebar-link-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </aside>
      <div className="layout-content">{children}</div>
    </div>
  );
}
