import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Loader2, Calendar, MapPin, Users } from "lucide-react";
import { AppPageHeader } from "./app";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/site/EmptyState";
import { getEventsByIds, type EventDoc } from "@/lib/events";
import { CATEGORY_MAP } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/bookmarks")({
  component: Bookmarks,
});

function Bookmarks() {
  const { user, toggleBookmark } = useAuth();
  const [events, setEvents] = useState<EventDoc[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    getEventsByIds(user.bookmarkedEventIds)
      .then((rows) => { if (!cancelled) setEvents(rows); })
      .catch((err) => { console.error("bookmarks fetch failed", err); if (!cancelled) setEvents([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <AppPageHeader eyebrow="Bookmarks" title="Saved for later" subtitle="Tap the bookmark icon on any event to save it here." />

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading bookmarks…
        </div>
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet."
          body="When you find an event you don't want to lose, tap the bookmark icon to save it here."
          primary={{ label: "Explore events", to: "/explore" }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((e) => (
            <BookmarkCard key={e.id} e={e} onRemove={() => toggleBookmark(e.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkCard({ e, onRemove }: { e: EventDoc; onRemove: () => void }) {
  const cat = CATEGORY_MAP[e.category];
  const Icon = cat?.icon;
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card">
      <Link to="/events/$id" params={{ id: e.id }} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
          {e.poster ? <img src={e.poster} alt={e.title} className="h-full w-full object-cover" /> : <div className="grid-court h-full w-full opacity-40" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
          {cat && (
            <span className={cn("absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur")} style={{ color: cat.accent }}>
              {Icon && <Icon className="h-3 w-3" />} {cat.label}
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="font-display text-2xl leading-tight text-white drop-shadow-lg line-clamp-2">{e.title}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 p-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-neon" />{e.date}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-neon" />{e.city || e.district}</span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{e.participants}/{e.maxParticipants || "∞"}</span>
        </div>
      </Link>
      <button onClick={onRemove} className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon backdrop-blur hover:bg-black/80">
        Remove
      </button>
    </div>
  );
}
