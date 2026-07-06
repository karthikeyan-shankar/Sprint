import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarPlus, Search, Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { Navbar, Footer } from "@/components/site/Navbar";
import { CATEGORY_MAP, type CategoryKey } from "@/lib/mock-data";
import { EmptyState } from "@/components/site/EmptyState";
import { listPublishedEvents, type EventDoc } from "@/lib/events";
import { cn } from "@/lib/utils";

type SearchParams = { category?: CategoryKey; district?: string; college?: string };

export const Route = createFileRoute("/explore")({
  component: Explore,
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    category: s.category as CategoryKey | undefined,
    district: typeof s.district === "string" ? s.district : undefined,
    college: typeof s.college === "string" ? s.college : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore Events — Sprint" },
      { name: "description", content: "Discover college events on Sprint. Search and filter by category, city and college." },
    ],
  }),
});

function Explore() {
  const [liveEvents, setLiveEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listPublishedEvents()
      .then((rows) => { if (!cancelled) setLiveEvents(rows); })
      .catch((err) => console.error("listPublishedEvents failed", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const totalCount = liveEvents.length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 pt-12">
        <div className="text-xs font-bold uppercase tracking-widest text-neon">Explore</div>
        <h1 className="mt-2 font-display text-5xl uppercase leading-none md:text-7xl">
          Every campus event, <span className="text-neon">one search.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Sprint is in Early Access. As colleges onboard and publish events, they'll appear here — searchable by category, city, college and date.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading && totalCount === 0 ? (
          <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-16 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading events…
          </div>
        ) : totalCount === 0 ? (
          <EmptyState
            icon={Search}
            eyebrow="Early Access"
            title="No events have been published yet."
            body="Be the first college, club or organizer to publish an event on Sprint. Your event goes live instantly and becomes discoverable across the platform."
            primary={{ label: "Publish first event", to: "/app/create" }}
            secondary={{ label: "Why Sprint", to: "/why" }}
          >
            <div className="grid gap-3 text-left sm:grid-cols-3">
              {[
                { icon: CalendarPlus, k: "1 minute", v: "to publish an event" },
                { icon: Search,        k: "One place", v: "for every category" },
                { icon: CalendarPlus,  k: "Zero setup", v: "no forms, no Excel" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-border bg-surface/40 p-4 text-center">
                  <s.icon className="mx-auto h-4 w-4 text-neon" />
                  <div className="mt-2 font-display text-lg uppercase">{s.k}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </EmptyState>
        ) : (
          <div className="space-y-10">
            {liveEvents.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neon">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
                  Live on Sprint · {liveEvents.length}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {liveEvents.map((e) => <LiveEventCard key={e.id} e={e} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

function LiveEventCard({ e }: { e: EventDoc }) {
  const cat = CATEGORY_MAP[e.category];
  const Icon = cat?.icon;
  const fill = e.maxParticipants ? Math.round((e.participants / e.maxParticipants) * 100) : 0;
  return (
    <Link
      to="/events/$id"
      params={{ id: e.id }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:neon-glow"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
        {e.poster ? (
          <img src={e.poster} alt={e.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid-court h-full w-full opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          {cat && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur"
              style={{ color: cat.accent }}
            >
              {Icon && <Icon className="h-3 w-3" />} {cat.label}
            </span>
          )}
          <span className={cn(
            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
            "bg-neon text-neon-foreground",
          )}>
            Registration Open
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="font-display text-2xl leading-tight text-white drop-shadow-lg line-clamp-2">{e.title}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neon">{e.hostName || e.collegeName}</div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-neon" />{e.city || e.district}</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-neon" />{e.date}</span>
        </div>
        <div className="mt-auto space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {e.participants}/{e.maxParticipants || "∞"}
            </span>
            <span className="font-bold text-foreground">
              {!e.fee ? "FREE" : `₹${e.fee.toLocaleString("en-IN")}`}
            </span>
          </div>
          {e.maxParticipants > 0 && (
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-neon transition-all" style={{ width: `${fill}%` }} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
