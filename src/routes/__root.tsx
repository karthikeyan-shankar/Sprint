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
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Logo } from "../components/Logo";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <Logo size="md" className="mx-auto" />
        <h1 className="mt-8 font-display text-8xl text-neon">404</h1>
        <h2 className="mt-2 text-lg font-semibold uppercase tracking-widest">Off the pitch</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for isn't in the fixture list.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-neon px-6 py-3 text-sm font-bold uppercase tracking-wide text-neon-foreground"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl uppercase">Match paused</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went sideways. Try again or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-neon px-5 py-2 text-sm font-bold uppercase text-neon-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-border px-5 py-2 text-sm font-semibold uppercase">
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
      { title: "Sprint — Where College Sports Begin" },
      {
        name: "description",
        content:
          "Sprint is the all-in-one platform for inter-college sports tournaments. Discover, register, and manage fixtures, teams, and results in one place.",
      },
      { name: "theme-color", content: "#D4FF3A" },
      { property: "og:title", content: "Sprint — Where College Sports Begin" },
      { property: "og:description", content: "One arena for every college tournament — fixtures, teams, live scores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}

