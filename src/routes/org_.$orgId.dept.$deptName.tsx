import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { listPublishedEventsByOrganizer, type EventDoc } from "@/lib/events";
import { Loader2, MapPin, Calendar, X, Share, ArrowLeft, ChevronRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export const Route = createFileRoute("/org_/$orgId/dept/$deptName")({
  component: DeptPage,
});

function DeptPage() {
  const { orgId, deptName } = Route.useParams();
  let dept = deptName;
  try {
    dept = decodeURIComponent(deptName);
  } catch (e) {
    console.error("Failed to decode deptName", e);
  }
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    let mounted = true;
    listPublishedEventsByOrganizer(orgId)
      .then((all) => {
        if (!mounted) return;
        const valid = Array.isArray(all) ? all : [];
        const filtered = valid.filter((e) => {
          if (!e) return false;
          const rawDept = typeof e.department === "string" ? e.department.trim() : "";
          const d = rawDept || "General";
          return d === dept;
        });
        setEvents(filtered);
      })
      .catch((err) => {
        console.error("Failed to load department events", err);
        if (mounted) setEvents([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [orgId, dept]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  const collegeName = events[0]?.collegeName || "";
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Department Header */}
      <header className="relative overflow-hidden bg-ink px-4 py-14 sm:px-8 sm:py-18 lg:py-20">
        {/* Background giant text */}
        <div className="pointer-events-none absolute -left-10 -top-10 select-none opacity-[0.03]">
          <h2 className="font-display text-[15rem] leading-none tracking-tighter text-foreground whitespace-nowrap">
            {dept.toUpperCase()}
          </h2>
        </div>
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-neon/20 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Back link */}
          <Link
            to="/org/$orgId"
            params={{ orgId }}
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-neon transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to all departments
          </Link>

          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-6 items-center bg-neon px-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-foreground">
                Department Portal
              </span>
            </div>
            <div className="hidden h-px flex-1 bg-border md:block" />
          </div>

          {/* Headline */}
          <div className="max-w-4xl space-y-4">
            <h1 className="font-display text-5xl uppercase leading-[0.85] tracking-tighter text-foreground sm:text-6xl lg:text-7xl">
              <span className="inline-block origin-bottom-left -rotate-1 transform-gpu text-neon">
                {dept}
              </span>
            </h1>
            {collegeName && (
              <p className="max-w-lg border-l-2 border-neon pl-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {collegeName} — {dept} department exclusive events and registrations.
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap gap-6">
            <div className="rounded-2xl border border-border bg-surface/30 px-6 py-4 backdrop-blur">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Events</div>
              <div className="mt-1 font-display text-3xl text-neon">{events.length}</div>
            </div>
            <div className="rounded-2xl border border-border bg-surface/30 px-6 py-4 backdrop-blur">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Registrations</div>
              <div className="mt-1 font-display text-3xl text-neon">{events.reduce((s, e) => s + (e.participants || 0), 0)}</div>
            </div>
            <button
              onClick={() => setShowQr(true)}
              className="group relative bg-neon px-8 py-4 font-display text-xl uppercase text-neon-foreground transition-all hover:brightness-110"
            >
              QR Code
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-2">→</span>
              <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-foreground" />
            </button>
          </div>
        </div>

        {/* bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex h-1.5 w-full">
          <div className="flex-1 bg-neon" />
          <div className="flex-1 bg-neon/60" />
          <div className="flex-1 bg-neon/30" />
          <div className="flex-1 bg-neon/10" />
        </div>
      </header>

      {/* Events */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {events.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="font-display text-3xl uppercase text-muted-foreground">No events yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">This department hasn't published any events yet.</p>
            <Link
              to="/org/$orgId"
              params={{ orgId }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-neon px-6 py-3 text-sm font-bold uppercase tracking-widest text-neon-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Browse other departments
            </Link>
          </div>
        ) : (
          <>
            <h2 className="mb-8 font-display text-2xl uppercase">
              {events.length} Event{events.length !== 1 ? "s" : ""} in {dept}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((evt) => (
                <Link
                  key={evt.id}
                  to="/events/$id"
                  params={{ id: evt.id }}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-surface/50 p-1 transition-all hover:border-neon/50 hover:bg-surface"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-2">
                    {evt.poster ? (
                      <img
                        src={evt.poster}
                        alt={evt.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center p-6 text-center">
                        <span className="font-display text-2xl uppercase opacity-20">{evt.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {evt.category && (
                      <span className="mb-2 inline-block rounded-full bg-neon/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neon">
                        {evt.category}
                      </span>
                    )}
                    <h3 className="font-display text-2xl uppercase">{evt.title}</h3>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {evt.date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-neon" />
                          <span>{evt.date}{evt.time ? ` • ${evt.time}` : ""}</span>
                        </div>
                      )}
                      {evt.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-neon" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-neon opacity-0 transition-opacity group-hover:opacity-100">
                      View Details <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-8 text-center relative shadow-2xl">
            <button
              onClick={() => setShowQr(false)}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-surface transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-2 font-display text-2xl uppercase">{dept}</h3>
            <p className="mb-8 text-sm text-muted-foreground">Scan to view {dept} events</p>

            <div className="mx-auto inline-block rounded-2xl bg-white p-4 shadow-xl">
              <QRCodeSVG
                value={pageUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(pageUrl);
                alert("Link copied!");
              }}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold uppercase tracking-widest hover:bg-surface-2 transition-colors"
            >
              <Share className="h-4 w-4" /> Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
