import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Loader2, Building2 } from "lucide-react";
import { Navbar, Footer } from "@/components/site/Navbar";
import { EmptyState } from "@/components/site/EmptyState";
import { useEffect, useState } from "react";
import { listPublishedEvents } from "@/lib/events";

export const Route = createFileRoute("/colleges")({
  component: CollegesPage,
  head: () => ({
    meta: [
      { title: "Colleges — Sprint" },
      { name: "description", content: "Every college onboarded to Sprint gets a public page with events, followers and updates." },
    ],
  }),
});

interface ActiveCollege {
  id: string;
  name: string;
  eventsCount: number;
  poster?: string;
}

function CollegesPage() {
  const [colleges, setColleges] = useState<ActiveCollege[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPublishedEvents()
      .then(events => {
        const orgMap = new Map<string, ActiveCollege>();
        events.forEach(e => {
          if (!orgMap.has(e.organizerId)) {
            orgMap.set(e.organizerId, {
              id: e.organizerId,
              name: e.collegeName || e.organizerName || e.hostName || "Featured College",
              eventsCount: 1,
              poster: e.poster
            });
          } else {
            const org = orgMap.get(e.organizerId)!;
            org.eventsCount++;
            if (!org.poster && e.poster) org.poster = e.poster;
          }
        });
        setColleges(Array.from(orgMap.values()));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 pt-12">
        <div className="text-xs font-bold uppercase tracking-widest text-neon">Colleges & Clubs</div>
        <h1 className="mt-2 font-display text-5xl uppercase leading-none md:text-7xl">
          A digital home for <span className="text-neon">every campus & club.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Each college and club on Sprint gets its own public page — upcoming events, past events, followers and a gallery. Currently onboarding across Tamil Nadu.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-neon" />
          </div>
        ) : colleges.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            eyebrow="Onboarding"
            title="Sprint is currently onboarding colleges and clubs."
            body="Want your college or club listed on Sprint? Request a listing and we'll set up your public page with your logo, cover and event calendar."
            primary={{ label: "Request Listing", href: "mailto:karthikeyanshankar8@gmail.com?subject=Request%20Listing%20on%20Sprint" }}
            secondary={{ label: "Why Sprint", to: "/why" }}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college) => (
              <Link
                key={college.id}
                to="/org/$orgId"
                params={{ orgId: college.id }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-surface/50 p-1 transition-all hover:border-neon/50 hover:bg-surface"
              >
                <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl bg-ink relative">
                  {college.poster ? (
                    <>
                      <img
                        src={college.poster}
                        alt={college.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-40 blur-sm"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center">
                       <Building2 className="h-12 w-12 opacity-10" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon text-neon-foreground">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl uppercase leading-none text-white">{college.name}</h3>
                      <p className="text-sm font-bold text-neon">{college.eventsCount} Active {college.eventsCount === 1 ? 'Event' : 'Events'}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

