import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div style={{ display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", padding: "0 1rem" }}>
      <div style={{ maxWidth: "28rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: 700 }}>404</h1>
        <h2 style={{ marginTop: "1rem", fontSize: "1.25rem", fontWeight: 600 }}>Page not found</h2>
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", opacity: 0.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", fontSize: "0.875rem", fontWeight: 500 }}>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    // Log error for debugging; no third-party reporting in this build.
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div style={{ display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", padding: "0 1rem" }}>
      <div style={{ maxWidth: "28rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", opacity: 0.6 }}>
          An unexpected error occurred. You can try refreshing or head back home.
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", borderRadius: "0.375rem", fontSize: "0.875rem", fontWeight: 500 }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atomity — Intelligence Membrane" },
      { name: "description", content: "A unified cloud intelligence layer that watches workloads across AWS, Azure, GCP, and on-premise in real time." },
      { name: "author", content: "Harshil" },
      { property: "og:title", content: "Atomity — Intelligence Membrane" },
      { property: "og:description", content: "Cross-cloud infrastructure observability powered by a living intelligence layer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Child routes render here. */}
      <Outlet />
    </QueryClientProvider>
  );
}
