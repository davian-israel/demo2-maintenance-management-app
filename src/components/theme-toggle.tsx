"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      data-testid="theme-toggle"
      className="btn-secondary"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      Toggle Theme
    </button>
  );
}
