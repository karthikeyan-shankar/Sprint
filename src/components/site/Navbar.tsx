import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Menu, X, Bookmark, Plus, User as UserIcon, LogOut, LayoutGrid, Bell, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/explore", label: "Explore" },
  { to: "/why", label: "Why Sprint" },
  { to: "/colleges", label: "Colleges" },
  { to: "/discover", label: "Discover" },
];


export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAuthed, ready } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <Link to="/" className="text-foreground"><Logo size="sm" /></Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const active = pathname === n.to || pathname.startsWith(n.to + "/");
              return (
                <Link key={n.to} to={n.to}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium tracking-wide uppercase transition",
                    active ? "bg-neon text-neon-foreground" : "text-muted-foreground hover:text-foreground",
                  )}>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {ready && !isAuthed && (
              <>
                <Link to="/login" className="rounded-full border border-border px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-surface-2">Sign in</Link>
                <Link to="/app/create" className="rounded-full bg-neon px-4 py-2 text-sm font-bold uppercase tracking-wide text-neon-foreground hover:brightness-110">Publish event</Link>
              </>
            )}
            {ready && isAuthed && <UserMenu />}
          </div>

          <button onClick={() => setOpen((v) => !v)} className="rounded-full border border-border p-2 md:hidden" aria-label="Toggle menu">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <div className="glass mt-2 rounded-2xl p-3 md:hidden">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium uppercase tracking-wide hover:bg-surface-2">
                {n.label}
              </Link>
            ))}
            {isAuthed ? (
              <>
                <Link to="/app" onClick={() => setOpen(false)} className="mt-1 block rounded-xl px-4 py-3 text-sm font-medium uppercase hover:bg-surface-2">My Sprint</Link>
                <Link to="/app/create" onClick={() => setOpen(false)} className="mt-1 block rounded-xl bg-neon px-4 py-3 text-center text-sm font-bold uppercase text-neon-foreground">Create event</Link>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="mt-2 block rounded-xl bg-neon px-4 py-3 text-center text-sm font-bold uppercase text-neon-foreground">Sign in</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) return null;
  const initials = user.name.split(" ").map(n => n[0]).slice(0, 2).join("");

  return (
    <div className="relative" ref={ref}>
      <Link to="/app/create" className="mr-1 inline-flex items-center gap-1.5 rounded-full bg-neon px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-neon-foreground">
        <Plus className="h-3.5 w-3.5" /> Create
      </Link>
      <button onClick={() => setOpen(v => !v)} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 py-1 pl-1 pr-3 text-sm hover:bg-surface-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-neon text-xs font-bold text-neon-foreground">{initials}</span>
        <span className="hidden font-semibold sm:inline">{user.name.split(" ")[0]}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="glass absolute right-0 mt-2 w-64 rounded-2xl p-2 text-sm">
          <div className="px-3 py-2">
            <div className="font-semibold">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
          <div className="my-1 h-px bg-border" />
          <MenuLink to="/app" icon={LayoutGrid} label="My Sprint" onClick={() => setOpen(false)} />
          <MenuLink to="/app/my-events" icon={LayoutGrid} label="My events" onClick={() => setOpen(false)} />
          <MenuLink to="/app/bookmarks" icon={Bookmark} label="Bookmarks" onClick={() => setOpen(false)} />
          <MenuLink to="/app/notifications" icon={Bell} label="Notifications" onClick={() => setOpen(false)} />
          <MenuLink to="/app/profile" icon={UserIcon} label="Profile" onClick={() => setOpen(false)} />
          <div className="my-1 h-px bg-border" />
          <button
            onClick={() => { signOut(); setOpen(false); navigate({ to: "/" }); }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2 rounded-xl px-3 py-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground">
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo size="md" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            One platform. Every college event. Sprint is the digital home for
            symposiums, hackathons, sports, culturals, and everything in
            between.
          </p>
        </div>
        <FooterCol title="Platform" links={[
          { label: "Explore", href: "/explore" },
          { label: "Discover", href: "/discover" },
          { label: "Colleges", href: "/colleges" },
          { label: "Search", href: "/search" },
        ]} />
        <FooterCol title="For you" links={[
          { label: "Create event", href: "/app/create" },
          { label: "My Sprint", href: "/app" },
          { label: "Sign in", href: "/login" },
        ]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Sprint. One Platform. Every College Event.</span>
          <span className="uppercase tracking-widest">Built for campus.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-neon">{title}</div>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}><Link to={l.href} className="text-muted-foreground hover:text-foreground">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
