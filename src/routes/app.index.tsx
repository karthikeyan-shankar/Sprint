import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, CalendarPlus, Rocket, Sparkles, Loader2 } from "lucide-react";
import { AppPageHeader } from "./app";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/site/EmptyState";
import { listMyEvents, listRegistrationsForUser } from "@/lib/events";

export const Route = createFileRoute("/app/")({
  component: Overview,
});

function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ hosted: 0, registrations: 0, bookmarks: 0, colleges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([listMyEvents(user.id), listRegistrationsForUser(user.id)])
      .then(([hosted, regs]) => {
        if (cancelled) return;
        setStats({
          hosted: hosted.length,
          registrations: regs.length,
          bookmarks: user.bookmarkedEventIds.length,
          colleges: user.followedCollegeIds.length,
        });
      })
      .catch((err) => console.error("overview stats failed", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;
  const first = user.name?.split(" ")[0] || "there";

  const cards = [
    { label: "Events hosted", value: stats.hosted },
    { label: "Registrations", value: stats.registrations },
    { label: "Bookmarks", value: stats.bookmarks },
    { label: "Colleges followed", value: stats.colleges },
  ];
  const anyData = cards.some((c) => c.value > 0);

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="Overview"
        title={`Hey, ${first}.`}
        subtitle="Sprint is in Early Access. Publish your first event to get started."
        action={{ label: "Create event", to: "/app/create", icon: Plus }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s, i) => (
          <div key={s.label} className={"rounded-3xl border p-5 " + (i === 0 ? "border-neon bg-neon/5" : "border-border bg-card")}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-5xl text-neon">
              {loading ? <Loader2 className="h-9 w-9 animate-spin" /> : s.value}
            </div>
          </div>
        ))}
      </div>

      {anyData ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/app/my-events" className="rounded-3xl border border-border bg-card p-5 hover:border-neon">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neon">Manage</div>
            <div className="mt-2 font-display text-2xl uppercase">Your hosted events</div>
            <div className="mt-1 text-sm text-muted-foreground">Approvals, exports, announcements.</div>
          </Link>
          <Link to="/app/bookmarks" className="rounded-3xl border border-border bg-card p-5 hover:border-neon">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neon">Saved</div>
            <div className="mt-2 font-display text-2xl uppercase">Your bookmarks</div>
            <div className="mt-1 text-sm text-muted-foreground">Everything you've saved for later.</div>
          </Link>
        </div>
      ) : (
        <EmptyState
          icon={Rocket}
          eyebrow="Early Access"
          title="Publish your first event on Sprint."
          body="Sprint helps you replace WhatsApp groups, Google Forms and Excel sheets with one clean workflow. Your first event goes live in minutes."
          primary={{ label: "Publish first event", to: "/app/create" }}
          secondary={{ label: "Explore Sprint", to: "/explore" }}
        >
          <div className="grid gap-3 text-left sm:grid-cols-3">
            {[
              { icon: CalendarPlus, k: "Create", v: "Poster, rules, fee, deadline" },
              { icon: Sparkles,     k: "Publish", v: "Live and searchable instantly" },
              { icon: Rocket,       k: "Manage", v: "Registrations, payments, exports" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-border bg-surface/40 p-4 text-center">
                <s.icon className="mx-auto h-4 w-4 text-neon" />
                <div className="mt-2 font-display text-lg uppercase">{s.k}</div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </EmptyState>
      )}
    </div>
  );
}
