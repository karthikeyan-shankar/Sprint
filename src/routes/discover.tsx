import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navbar, Footer } from "@/components/site/Navbar";
import { EmptyState } from "@/components/site/EmptyState";
import { listPublishedEvents, type EventDoc } from "@/lib/events";
import { Link } from "@tanstack/react-router";
import { CATEGORY_MAP } from "@/lib/mock-data";

export const Route = createFileRoute("/discover")({
  component: Discover,
  head: () => ({
    meta: [
      { title: "Discover — Sprint" },
      { name: "description", content: "Trending, this week, and nearby college events on Sprint." },
    ],
  }),
});

function Discover() {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listPublishedEvents()
      .then((rows) => { if (!cancelled) setEvents(rows); })
      .catch((err) => console.error("discover fetch failed", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const trending = [...events].sort((a, b) => b.participants - a.participants).slice(0, 6);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 pt-12">
        <div className="text-xs font-bold uppercase tracking-widest text-neon">Discover</div>
        <h1 className="mt-2 font-display text-5xl uppercase leading-none md:text-7xl">
          Trending across <span className="text-neon">Sprint.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Live events across every campus, ranked by registrations.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-16 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            eyebrow="Early Access"
            title="Nothing trending yet."
            body="Discover fills up once organizers start publishing events. Be the first — your event will lead the feed for every student on Sprint."
            primary={{ label: "Publish first event", to: "/app/create" }}
            secondary={{ label: "Why Sprint", to: "/why" }}
          />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neon">
              <span className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" /> Trending now · {trending.length}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trending.map((e) => <DiscoverCard key={e.id} e={e} />)}
            </div>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}

function DiscoverCard({ e }: { e: EventDoc }) {
  const cat = CATEGORY_MAP[e.category];
  return (
    <Link to="/events/$id" params={{ id: e.id }} className="group overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:neon-glow">
      <div className="relative aspect-[16/9] bg-surface-2">
        {e.poster ? <img src={e.poster} alt={e.title} className="h-full w-full object-cover" /> : <div className="grid-court h-full w-full opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
        {cat && <span className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur" style={{ color: cat.accent }}>{cat.label}</span>}
        <div className="absolute inset-x-0 bottom-0 p-4 font-display text-2xl text-white line-clamp-2">{e.title}</div>
      </div>
      <div className="flex items-center justify-between p-5 text-xs text-muted-foreground">
        <span>{e.city || e.district} · {e.date}</span>
        <span className="font-bold text-neon">{e.participants} registered</span>
      </div>
    </Link>
  );
}
