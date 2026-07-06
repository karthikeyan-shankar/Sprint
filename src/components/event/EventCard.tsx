import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck } from "lucide-react";
import { CATEGORY_MAP, collegeById, formatShort, type CollegeEvent } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const statusStyle: Record<CollegeEvent["status"], string> = {
  "Upcoming":              "bg-surface-2 text-muted-foreground border border-border",
  "Registration Open":     "bg-neon text-neon-foreground",
  "Registration Closed":   "bg-surface-2 text-muted-foreground border border-border",
  "Live":                  "bg-red-500 text-white animate-pulse",
  "Completed":             "bg-surface-2 text-muted-foreground",
  "Draft":                 "bg-surface-2 text-muted-foreground border border-dashed border-border",
};

export function EventCard({ e, compact = false }: { e: CollegeEvent; compact?: boolean }) {
  const cat = CATEGORY_MAP[e.category];
  const college = collegeById(e.collegeId);
  const fill = Math.round((e.participants / e.maxParticipants) * 100);
  const Icon = cat.icon;
  const { user, toggleBookmark } = useAuth();
  const bookmarked = !!user?.bookmarkedEventIds.includes(e.id);

  return (
    <Link
      to="/events/$id"
      params={{ id: e.id }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition",
        "hover:-translate-y-1 hover:neon-glow",
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ background: e.banner }}>
        <div className="grid-court absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur"
            style={{ color: cat.accent }}
          >
            <Icon className="h-3 w-3" /> {cat.label}
          </span>
          <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest", statusStyle[e.status])}>
            {e.status === "Live" && "● "}{e.status}
          </span>
        </div>
        {user && (
          <button
            onClick={(ev) => { ev.preventDefault(); toggleBookmark(e.id); }}
            className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-neon hover:text-neon-foreground"
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 pr-14">
          <div className="font-display text-2xl leading-tight text-white drop-shadow-lg">{e.title}</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neon">
          {college?.short} · {e.organizer}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-neon" />{e.city}</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-neon" />{formatShort(e.date)}{e.endDate ? ` – ${formatShort(e.endDate)}` : ""}</span>
        </div>

        {!compact && <p className="line-clamp-2 text-sm text-muted-foreground">{e.description}</p>}

        <div className="mt-auto space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {e.participants}/{e.maxParticipants}
            </span>
            <span className="font-bold text-foreground">
              {e.fee === 0 ? "FREE" : `₹${e.fee.toLocaleString("en-IN")}`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-neon transition-all" style={{ width: `${fill}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
