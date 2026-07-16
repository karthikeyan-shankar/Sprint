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
  const pageUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Exclusive Header */}
      <header className="border-b border-border bg-surface/50 py-16 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neon">
            Official Portal
          </div>
          <h1 className="mb-4 font-display text-5xl uppercase sm:text-7xl">
            {orgName}
          </h1>
          {collegeName && (
            <p className="text-lg text-muted-foreground uppercase tracking-widest">
              {collegeName}
            </p>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowQr(true)}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-gray-200 transition-colors"
            >
              <QrCode className="h-4 w-4" /> Get QR Code
            </button>
          </div>
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
            <h3 className="mb-2 font-display text-2xl uppercase">{orgName}</h3>
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
