import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, CalendarPlus, Calendar, MapPin, Users, Loader2, Settings2 } from "lucide-react";
import { AppPageHeader } from "./app";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/site/EmptyState";
import { listMyEvents, listRegistrationsForUser, listRegistrationsForEvent, getEventsByIds, type EventDoc, type RegistrationDoc } from "@/lib/events";
import { CATEGORY_MAP } from "@/lib/mock-data";
import { toast } from "sonner";


export const Route = createFileRoute("/app/my-events")({
  component: MyEvents,
});

type Tab = "hosted" | "registered" | "drafts";

function MyEvents() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("hosted");
  const [events, setEvents] = useState<EventDoc[] | null>(null);
  const [registered, setRegistered] = useState<EventDoc[] | null>(null);
  const [regsByEvent, setRegsByEvent] = useState<Record<string, RegistrationDoc[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      listMyEvents(user.id),
      listRegistrationsForUser(user.id).then((regs) => getEventsByIds(regs.map((r) => r.eventId))),
    ])
      .then(async ([mine, reg]) => {
        if (cancelled) return;
        setEvents(mine); setRegistered(reg);
        // Fetch registrations for each hosted event to compute per-event summary
        const entries = await Promise.all(mine.map(async (e) => [e.id, await listRegistrationsForEvent(e.id).catch(() => [])] as const));
        if (!cancelled) setRegsByEvent(Object.fromEntries(entries));
      })
      .catch((err) => {
        console.error("my-events load failed", err);
        toast.error("Couldn't load your events", { description: err?.message ?? "Firestore error" });
        if (!cancelled) { setEvents([]); setRegistered([]); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);


  if (!user) return null;

  const hosted = (events ?? []).filter((e) => e.status !== "draft");
  const drafts = (events ?? []).filter((e) => e.status === "draft");
  const registeredList = registered ?? [];
  const visible = tab === "hosted" ? hosted : tab === "drafts" ? drafts : registeredList;

  const empties: Record<Tab, { title: string; body: string; cta: string }> = {
    hosted: {
      title: "You haven't published an event yet.",
      body: "Create your first event on Sprint and start collecting registrations in minutes — no WhatsApp groups, no Google Forms.",
      cta: "Publish first event",
    },
    registered: {
      title: "No registrations yet.",
      body: "Events you register for will appear here with all the details, updates and reminders.",
      cta: "Explore events",
    },
    drafts: {
      title: "No drafts saved.",
      body: "Save an event as a draft while you finalize the poster, rules or fee — it stays private until you publish.",
      cta: "Start a draft",
    },
  };

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="My events"
        title="Manage your events"
        subtitle="Everything you've hosted and registered for on Sprint."
        action={{ label: "Create event", to: "/app/create", icon: Plus }}
      />

      <div className="inline-flex flex-wrap gap-1 rounded-full border border-border bg-surface-2 p-1 text-xs font-bold uppercase tracking-widest">
        {(["hosted", "registered", "drafts"] as Tab[]).map((t) => {
          const count = t === "hosted" ? hosted.length : t === "drafts" ? drafts.length : registeredList.length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-1.5",
                tab === t ? "bg-neon text-neon-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}{count > 0 ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>

      {loading && events === null ? (
        <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-16 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your events…
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title={empties[tab].title}
          body={empties[tab].body}
          primary={
            tab === "registered"
              ? { label: "Explore events", to: "/explore" }
              : { label: empties[tab].cta, to: "/app/create" }
          }
          secondary={tab === "hosted" ? { label: "Why Sprint", to: "/why" } : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((e) => <MyEventCard key={e.id} e={e} regs={tab === "hosted" || tab === "drafts" ? (regsByEvent[e.id] ?? []) : undefined} />)}
        </div>
      )}
    </div>
  );
}

function MyEventCard({ e, regs }: { e: EventDoc; regs?: RegistrationDoc[] }) {
  const cat = CATEGORY_MAP[e.category];
  const Icon = cat?.icon;
  const fill = e.maxParticipants ? Math.round((e.participants / e.maxParticipants) * 100) : 0;
  const pending = regs?.filter((r) => r.status === "pending").length ?? 0;
  const paid = regs?.filter((r) => r.paymentStatus === "Paid").length ?? 0;
  const revenue = paid * (e.fee || 0);
  const isHost = regs !== undefined;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition hover:-translate-y-1 hover:neon-glow">
      <Link to="/events/$id" params={{ id: e.id }} className="block">
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
              e.status === "published"
                ? "bg-neon text-neon-foreground"
                : e.status === "draft"
                ? "bg-surface-2 text-muted-foreground border border-dashed border-border"
                : "bg-surface-2 text-muted-foreground border border-border",
            )}>
              {e.status}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4">
            <div className="font-display text-2xl leading-tight text-white drop-shadow-lg line-clamp-2">{e.title}</div>
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neon">{e.hostName || e.collegeName}</div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-neon" />{e.city || e.district}</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-neon" />{e.date}</span>
        </div>

        {isHost && (
          <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
            {pending > 0 && <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-yellow-400">{pending} pending</span>}
            {e.fee > 0 && paid > 0 && <span className="rounded-full bg-neon/20 px-2 py-0.5 text-neon">₹{revenue.toLocaleString("en-IN")} collected</span>}
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-muted-foreground">{regs?.length ?? 0} regs</span>
          </div>
        )}

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
          {isHost && (
            <Link to="/app/events/$id" params={{ id: e.id }} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-neon px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-neon-foreground">
              <Settings2 className="h-3.5 w-3.5" /> Manage
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

