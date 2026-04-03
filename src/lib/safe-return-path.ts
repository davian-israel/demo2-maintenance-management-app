/**
 * Returns a safe same-origin relative path for post-submit redirects, or null if disallowed.
 * Rejects protocol-relative URLs, other origins, and non-path values.
 */
export function getSafeReturnPath(returnTo: string | null | undefined): string | null {
  if (returnTo == null || returnTo === "") {
    return null;
  }

  const trimmed = returnTo.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  if (trimmed.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, "http://local.invalid");
    if (parsed.origin !== "http://local.invalid") {
      return null;
    }
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (!path.startsWith("/")) {
      return null;
    }
    return path;
  } catch {
    return null;
  }
}
