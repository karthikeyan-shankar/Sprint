import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listPublishedEventsByOrganizer, type EventDoc } from "@/lib/events";
import { Loader2, MapPin, Calendar, QrCode, X, Share } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export const Route = createFileRoute("/org/$orgId")({
  component: OrgPage,
});

function OrgPage() {
  const { orgId } = Route.useParams();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    listPublishedEventsByOrganizer(orgId)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-center">
        <div>
          <h1 className="font-display text-4xl uppercase text-muted-foreground mb-4">No events found</h1>
          <p className="text-muted-foreground">This organizer hasn't published any events yet.</p>
        </div>
      </div>
    );
  }

  // Derive organizer info from their first event
  const orgName = events[0].organizerName || events[0].hostName || "Organizer";
  const collegeName = events[0].collegeName || "";
  const displayName = collegeName || orgName;
  const pageUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Exclusive Header */}
      {/* Exclusive Header - Brutalist Design */}
      <header className="relative overflow-hidden bg-ink px-4 py-16 sm:px-8 sm:py-20 lg:py-24">
        {/* Background giant text */}
        <div className="pointer-events-none absolute -left-10 -top-10 select-none opacity-[0.03]">
          <h2 className="font-display text-[15rem] leading-none tracking-tighter text-foreground whitespace-nowrap">
            {displayName.toUpperCase()}
          </h2>
        </div>
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-neon/20 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          {/* Eyebrow */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-6 items-center bg-neon px-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-foreground">
                Official Portal
              </span>
            </div>
            <div className="hidden h-px flex-1 bg-border md:block" />
          </div>

          {/* Headline */}
          <div className="max-w-4xl space-y-6">
            <h1 className="font-display text-6xl uppercase leading-[0.85] tracking-tighter text-foreground sm:text-7xl lg:text-8xl">
              <span className="inline-block origin-bottom-left -rotate-1 transform-gpu text-neon">
                {displayName}
              </span>
              <br />
              Exclusive Portal
            </h1>
            <p className="max-w-lg border-l-2 border-neon pl-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Official registration desk. Access all upcoming events, symposiums, and hackathons exclusively on this portal.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <button
              onClick={() => setShowQr(true)}
              className="group relative bg-neon px-10 py-5 font-display text-2xl uppercase text-neon-foreground transition-all hover:brightness-110"
            >
              Get QR Code
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

      {/* Events Grid */}
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 font-display text-3xl uppercase">Upcoming Events</h2>
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
                <h3 className="font-display text-2xl uppercase">{evt.title}</h3>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neon" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neon" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
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
            <h3 className="mb-2 font-display text-2xl uppercase">{displayName}</h3>
            <p className="mb-8 text-sm text-muted-foreground">Scan to view all events</p>
            
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
