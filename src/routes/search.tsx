import { createFileRoute, Link } from "@tanstack/react-router";
import { Search as SearchIcon, Loader2, Calendar, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navbar, Footer } from "@/components/site/Navbar";
import { EmptyState } from "@/components/site/EmptyState";
import { listPublishedEvents, type EventDoc } from "@/lib/events";
import { CATEGORY_MAP } from "@/lib/mock-data";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search — Sprint" }, { name: "description", content: "Search events on Sprint." }] }),
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listPublishedEvents()
      .then((rows) => { if (!cancelled) setEvents(rows); })
      .catch((err) => console.error("search index failed", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return events.filter((e) =>
      e.title.toLowerCase().includes(s)
      || (e.hostName || "").toLowerCase().includes(s)
      || (e.collegeName || "").toLowerCase().includes(s)
      || (e.city || "").toLowerCase().includes(s)
      || (e.description || "").toLowerCase().includes(s)
    );
  }, [q, events]);

  const platformEmpty = !loading && events.length === 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 pt-16">
        <div className="text-xs font-bold uppercase tracking-widest text-neon">Search</div>
        <h1 className="mt-2 font-display text-5xl uppercase leading-none md:text-7xl">Find <span className="text-neon">anything.</span></h1>
        <div className="glass mt-8 flex items-center gap-2 rounded-2xl p-2">
          <SearchIcon className="ml-3 h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events, colleges, organizers"
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-16 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Indexing…
          </div>
        ) : platformEmpty ? (
          <EmptyState
            icon={SearchIcon}
            eyebrow="Early Access"
            title="Nothing to search yet."
            body="Publish your first event and become the first organizer on Sprint."
            primary={{ label: "Publish first event", to: "/app/create" }}
            secondary={{ label: "Why Sprint", to: "/why" }}
          />
        ) : q.trim().length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Start typing to search across every event on Sprint.
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title={`No results for "${q}"`}
            body="Try a different keyword — an event name, a college, or a city."
          />
        ) : (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-neon">{results.length} result{results.length === 1 ? "" : "s"}</div>
            {results.map((e) => <ResultRow key={e.id} e={e} />)}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

function ResultRow({ e }: { e: EventDoc }) {
  const cat = CATEGORY_MAP[e.category];
  return (
    <Link to="/events/$id" params={{ id: e.id }} className="flex gap-4 rounded-2xl border border-border bg-card p-4 hover:border-neon">
      <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-surface-2">
        {e.poster ? <img src={e.poster} alt={e.title} className="h-full w-full object-cover" /> : <div className="grid-court h-full w-full opacity-40" />}
      </div>
      <div className="min-w-0 flex-1">
        {cat && <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cat.accent }}>{cat.label}</div>}
        <div className="font-display text-xl uppercase line-clamp-1">{e.title}</div>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-neon" />{e.date}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-neon" />{e.city || e.district}</span>
          <span>{e.hostName || e.collegeName}</span>
        </div>
      </div>
    </Link>
  );
}
