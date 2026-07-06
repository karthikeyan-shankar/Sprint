import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Calendar, Plus, Bookmark, Bell, User as UserIcon, LogOut, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

const nav = [
  { to: "/app",               label: "Overview",     icon: LayoutDashboard, exact: true },
  { to: "/app/my-events",     label: "My events",    icon: Calendar },
  { to: "/app/create",        label: "Create",       icon: Plus },
  { to: "/app/bookmarks",     label: "Bookmarks",    icon: Bookmark },
  { to: "/app/notifications", label: "Notifications",icon: Bell },
  { to: "/app/profile",       label: "Profile",      icon: UserIcon },
  { to: "/app/settings",      label: "Settings",     icon: Settings },
];


function AppShell() {
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        <aside className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-3xl p-4 lg:flex">
          <Link to="/" className="mb-6 flex items-center gap-2 px-2 pt-2"><Logo size="sm" /></Link>
          <div className="mb-4 rounded-2xl bg-surface-2 p-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-neon text-xs font-bold text-neon-foreground">
                {user.name.split(" ").map(n => n[0]).slice(0,2).join("")}
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-sm">{user.name}</div>
                <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">My Sprint</div>
              </div>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map(n => {
              const active = n.exact ? (pathname === n.to || pathname === n.to + "/") : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-neon text-neon-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                )}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
            <div className="mt-auto border-t border-border pt-3">
              <button onClick={() => { signOut(); navigate({ to: "/" }); }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-16">
          <div className="glass mb-6 flex items-center justify-between rounded-2xl p-3 lg:hidden">
            <Link to="/"><Logo size="sm" /></Link>
            <Link to="/app/create" className="rounded-full bg-neon px-3 py-1.5 text-xs font-bold uppercase text-neon-foreground">+ Create</Link>
          </div>
          <Outlet />

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
            <div className="mx-auto grid max-w-md grid-cols-5 items-center px-2 py-2">
              {nav.filter(n => n.label !== "Profile").map(n => {
                const active = n.exact ? (pathname === n.to || pathname === n.to + "/") : pathname.startsWith(n.to);
                return (
                  <Link key={n.to} to={n.to}
                    className={cn("flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest",
                      active ? "text-neon" : "text-muted-foreground")}>
                    <n.icon className="h-5 w-5" />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppPageHeader({ eyebrow, title, subtitle, action }: {
  eyebrow: string; title: string; subtitle?: string;
  action?: { label: string; to?: string; onClick?: () => void; icon?: any };
}) {
  const Icon = action?.icon;
  const btn = "inline-flex shrink-0 items-center gap-2 rounded-full bg-neon px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neon-foreground";
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-widest text-neon">{eyebrow}</div>
        <h1 className="mt-1 truncate font-display text-4xl uppercase leading-none md:text-5xl">{title}</h1>
        {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
      </div>
      {action && (
        action.to
          ? <Link to={action.to} className={btn}>{Icon && <Icon className="h-4 w-4" />} <span className="hidden sm:inline">{action.label}</span></Link>
          : <button onClick={action.onClick} className={btn}>{Icon && <Icon className="h-4 w-4" />} <span className="hidden sm:inline">{action.label}</span></button>
      )}
    </div>
  );
}

export function AppPanel({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-border bg-card p-6", className)}>
      {title && <div className="mb-4 font-display text-xl uppercase">{title}</div>}
      {children}
    </div>
  );
}

