import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Mail, Phone, ArrowLeft, Clock, Wallet, Bookmark, BookmarkCheck, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar, Footer } from "@/components/site/Navbar";
import { EVENTS, CATEGORY_MAP, collegeById, formatDate, type CollegeEvent } from "@/lib/mock-data";
import { getEvent, type EventDoc } from "@/lib/events";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

// Unified shape the page renders. Both mock CollegeEvent and Firestore EventDoc
// get normalized to this so we don't fork the UI.
type ViewEvent = {
  id: string;
  title: string;
  description: string;
  category: CollegeEvent["category"];
  status: string;
  organizer: string;
  department?: string;
  contactEmail: string;
  contactPhone: string;
  venue: string;
  city: string;
  district: string;
  date: string;
  endDate?: string;
  time: string;
  registrationDeadline: string;
  fee: number;
  participants: number;
  maxParticipants: number;
  rules: string[];
  banner: string;
  collegeId?: string;
};

function fromMock(e: CollegeEvent): ViewEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category,
    status: e.status,
    organizer: e.organizer,
    department: e.department,
    contactEmail: e.contactEmail,
    contactPhone: e.contactPhone,
    venue: e.venue,
    city: e.city,
    district: e.district,
    date: e.date,
    endDate: e.endDate,
    time: e.time,
    registrationDeadline: e.registrationDeadline,
    fee: e.fee,
    participants: e.participants,
    maxParticipants: e.maxParticipants,
    rules: e.rules,
    banner: e.banner,
    collegeId: e.collegeId,
  };
}

function fromDoc(e: EventDoc): ViewEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category,
    status: e.status === "published" ? "Registration Open" : e.status === "draft" ? "Draft" : "Registration Closed",
    organizer: e.organizerName || e.hostName || e.collegeName,
    department: e.department,
    contactEmail: e.contactEmail,
    contactPhone: e.contactPhone,
    venue: e.venue,
    city: e.city,
    district: e.district,
    date: e.date,
    time: e.time,
    registrationDeadline: e.registrationDeadline,
    fee: e.fee,
    participants: e.participants,
    maxParticipants: e.maxParticipants,
    rules: e.rules ?? [],
    banner: e.poster
      ? `url(${e.poster}) center/cover no-repeat`
      : "linear-gradient(135deg, oklch(0.94 0.22 118 / 0.35), oklch(0.35 0.10 118 / 0.6))",
  };
}

export const Route = createFileRoute("/events/$id")({
  component: EventDetail,
  head: () => ({
    meta: [
      { title: "Event — Sprint" },
      { name: "description", content: "Event details on Sprint." },
    ],
  }),
});

function EventDetail() {
  const { id } = Route.useParams();
  const [event, setEvent] = useState<ViewEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    // 1) mock first (instant)
    const mock = EVENTS.find((x) => x.id === id);
    if (mock) {
      setEvent(fromMock(mock));
      setLoading(false);
      return;
    }

    // 2) Firestore fallback
    getEvent(id)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) { setNotFound(true); setEvent(null); }
        else setEvent(fromDoc(doc));
      })
      .catch((err) => {
        console.error("getEvent failed", err);
        if (!cancelled) { setNotFound(true); toast.error("Couldn't load event", { description: err?.message }); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading event…
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="font-display text-6xl uppercase">Event not found</div>
            <Link to="/explore" className="mt-6 inline-flex rounded-full bg-neon px-5 py-2.5 text-sm font-bold uppercase text-neon-foreground">Back to Explore</Link>
          </div>
        </div>
      </div>
    );
  }

  return <EventBody e={event} />;
}

function EventBody({ e }: { e: ViewEvent }) {
  const cat = CATEGORY_MAP[e.category];
  const Icon = cat?.icon;
  const college = e.collegeId ? collegeById(e.collegeId) : undefined;
  const { user, isAuthed, toggleBookmark } = useAuth();
  const navigate = useNavigate();
  const registered = !!user?.joinedEventIds.includes(e.id);
  const bookmarked = !!user?.bookmarkedEventIds.includes(e.id);

  const handleRegister = () => {
    if (!isAuthed) { toast.info("Sign in to register for this event."); navigate({ to: "/login" }); return; }
    navigate({ to: "/events/$id/register", params: { id: e.id } });
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      (navigator as any).share({ title: e.title, url: window.location.href }).catch(() => {});
    } else {
      window.navigator.clipboard?.writeText(window.location.href);
      toast.success("Link copied");
    }
  };

  const fill = e.maxParticipants ? Math.round((e.participants / e.maxParticipants) * 100) : 0;

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: e.banner }} />
        <div className="grid-court absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="relative mx-auto max-w-7xl px-6 pt-10 pb-20 sm:pt-16 sm:pb-32">
          <Link to="/explore" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-neon">
            <ArrowLeft className="h-3 w-3" /> Back to Explore
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {cat && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur" style={{ color: cat.accent }}>
                {Icon && <Icon className="h-3 w-3" />} {cat.label}
              </span>
            )}
            <StatusPill status={e.status} />
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-5xl uppercase leading-none text-white drop-shadow-xl md:text-8xl">{e.title}</h1>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/90">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-neon" />{e.venue}, {e.city}</span>
            <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-neon" />{formatDate(e.date)}{e.endDate ? ` – ${formatDate(e.endDate)}` : ""}</span>
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-neon" />{e.time}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-16 max-w-7xl px-6">
        <div className="glass grid gap-4 rounded-3xl p-6 md:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          <Stat label="Entry" value={!e.fee ? "FREE" : `₹${e.fee.toLocaleString("en-IN")}`} icon={Wallet} />
          <Stat label="Registered" value={`${e.participants}/${e.maxParticipants || "∞"}`} icon={Users} />
          <Stat label="Deadline" value={formatDate(e.registrationDeadline)} icon={Clock} />
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button onClick={() => isAuthed ? toggleBookmark(e.id) : toast.info("Sign in to bookmark events.")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-surface">
              {bookmarked ? <BookmarkCheck className="h-4 w-4 text-neon" /> : <Bookmark className="h-4 w-4" />}
              {bookmarked ? "Saved" : "Save"}
            </button>
            <button onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-surface">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button onClick={handleRegister} disabled={registered}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest transition",
                registered ? "bg-surface-2 text-muted-foreground" : "bg-neon text-neon-foreground neon-glow hover:brightness-110"
              )}>
              {registered ? "Registered ✓" : "Register now"}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Panel title="About this event">
            <p className="whitespace-pre-line text-muted-foreground">{e.description}</p>
          </Panel>

          {e.rules.length > 0 && (
            <Panel title="Rules & regulations">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {e.rules.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
            </Panel>
          )}

          <Panel title="Location">
            <div className="rounded-2xl border border-border bg-surface-2 p-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Venue</div>
              <div className="mt-1 font-display text-2xl uppercase">{e.venue}</div>
              <div className="mt-1 text-sm text-muted-foreground">{e.city}, {e.district}</div>
              <div className="mt-4 flex aspect-[16/8] items-center justify-center rounded-xl bg-[radial-gradient(ellipse_at_center,oklch(0.94_0.22_118/0.15),transparent_70%)] border border-dashed border-border text-xs uppercase tracking-widest text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4 text-neon" /> Map preview
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Organizer">
            {college && (
              <Link to="/colleges/$id" params={{ id: college.id }} className="mb-4 flex items-center gap-3 rounded-2xl bg-surface-2 p-3 hover:bg-surface">
                <div className="grid h-10 w-10 place-items-center rounded-xl font-display text-sm text-neon-foreground" style={{ background: college.logoColor }}>{college.short.slice(0,3)}</div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{college.name}</div>
                  <div className="text-xs text-muted-foreground">{college.city}</div>
                </div>
              </Link>
            )}
            <div className="font-display text-xl uppercase">{e.organizer}</div>
            {e.department && <div className="text-sm text-muted-foreground">Dept: {e.department}</div>}
            <div className="mt-4 space-y-2 text-sm">
              {e.contactEmail && <div className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-neon" />{e.contactEmail}</div>}
              {e.contactPhone && <div className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-neon" />{e.contactPhone}</div>}
            </div>
          </Panel>

          <Panel title="Key dates">
            <ul className="space-y-3 text-sm">
              <DateRow label="Registration closes" value={formatDate(e.registrationDeadline)} />
              <DateRow label="Event starts" value={formatDate(e.date)} />
              {e.endDate && <DateRow label="Event ends" value={formatDate(e.endDate)} />}
            </ul>
          </Panel>

          <Panel title="Participants">
            <div className="font-display text-5xl text-neon">{e.participants}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">of {e.maxParticipants || "∞"} registered</div>
            {e.maxParticipants > 0 && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-neon" style={{ width: `${fill}%` }} />
              </div>
            )}
          </Panel>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="mb-4 font-display text-xl uppercase">{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div>
      <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3 w-3 text-neon" /> {label}
      </div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  );
}

function DateRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </li>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn(
      "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
      status === "Registration Open" && "bg-neon text-neon-foreground",
      status === "Live" && "bg-red-500 text-white animate-pulse",
      (status === "Registration Closed" || status === "Completed" || status === "Upcoming") && "bg-black/40 text-white/80 backdrop-blur",
      status === "Draft" && "bg-black/40 text-white/80 backdrop-blur",
    )}>
      {status === "Live" && "● "}{status}
    </span>
  );
}
