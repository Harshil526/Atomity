/**
 * Generic error capture utility used by the root error boundary.
 * Logs to the console in development; wire up a real error tracker
 * (Sentry, Datadog, etc.) here before shipping to production.
 */
export function reportError(
  error: unknown,
  context: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  console.error("[ErrorBoundary]", { error, ...context });
}
