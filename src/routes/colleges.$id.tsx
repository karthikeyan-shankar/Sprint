import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Globe, Users, Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Navbar, Footer } from "@/components/site/Navbar";
import { EventCard } from "@/components/event/EventCard";
import { COLLEGES, EVENTS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/colleges/$id")({
  loader: ({ params }) => {
    const c = COLLEGES.find(x => x.id === params.id);
    if (!c) throw notFound();
    return { college: c };
  },
  component: CollegeDetail,
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.college.name} — Sprint` },
          { name: "description", content: loaderData.college.about },
          { property: "og:title", content: `${loaderData.college.name} — Sprint` },
          { property: "og:description", content: loaderData.college.about },
        ]
      : [{ title: "College — Sprint" }],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="font-display text-6xl uppercase">College not found</div>
        <Link to="/colleges" className="mt-6 inline-flex rounded-full bg-neon px-5 py-2.5 text-sm font-bold uppercase text-neon-foreground">All colleges</Link>
      </div>
    </div>
  ),
});

function CollegeDetail() {
  const { college: c } = Route.useLoaderData();
  const { user, isAuthed, followCollege } = useAuth();
  const following = !!user?.followedCollegeIds.includes(c.id);
  const now = Date.now();
  const collegeEvents = EVENTS.filter(e => e.collegeId === c.id);
  const upcoming = collegeEvents.filter(e => new Date(e.date).getTime() >= now);
  const past = collegeEvents.filter(e => new Date(e.date).getTime() < now);

  const onFollow = () => {
    if (!isAuthed) { toast.info("Sign in to follow this college."); return; }
    followCollege(c.id);
    toast.success(following ? "Unfollowed" : `Following ${c.short}`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: c.cover }} />
        <div className="grid-court absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="relative mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pt-16">
          <Link to="/colleges" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-white/80 hover:text-neon">
            <ArrowLeft className="h-3 w-3" /> All colleges
          </Link>

          <div className="mt-8 flex flex-wrap items-end gap-6">
            <div className="grid h-24 w-24 place-items-center rounded-3xl font-display text-3xl text-neon-foreground shadow-2xl" style={{ background: c.logoColor }}>
              {c.short.slice(0,3)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-widest text-neon">{c.short}</div>
              <h1 className="mt-1 font-display text-4xl uppercase leading-none text-white drop-shadow-xl md:text-6xl">{c.name}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/90">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-neon" />{c.city}, {c.state}</span>
                <a href={`https://${c.website}`} className="inline-flex items-center gap-1.5 hover:text-neon"><Globe className="h-4 w-4 text-neon" />{c.website}</a>
                <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-neon" />{c.followers.toLocaleString("en-IN")} followers</span>
              </div>
            </div>
            <button onClick={onFollow} className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-widest transition",
              following ? "border border-neon bg-surface-2 text-neon" : "bg-neon text-neon-foreground neon-glow"
            )}>
              {following ? <><Check className="h-4 w-4" /> Following</> : <><Plus className="h-4 w-4" /> Follow</>}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-3 font-display text-xl uppercase">About</div>
            <p className="text-muted-foreground">{c.about}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatBox k={c.eventCount} v="Events" />
            <StatBox k={upcoming.length} v="Upcoming" />
            <StatBox k={c.followers.toLocaleString("en-IN")} v="Followers" />
          </div>
        </div>
      </section>

      <SectionBlock title="Upcoming events" empty="No upcoming events yet." items={upcoming} />
      <SectionBlock title="Past events" empty="No past events on record." items={past} muted />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-3 font-display text-xl uppercase">Gallery</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[c.cover, ...upcoming.slice(0,7).map(e => e.banner)].slice(0,8).map((bg, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded-2xl" style={{ background: bg }}>
                <div className="grid-court h-full w-full opacity-30" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionBlock({ title, empty, items, muted }: { title: string; empty: string; items: typeof EVENTS; muted?: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-end justify-between">
        <h2 className={cn("font-display text-3xl uppercase", muted && "text-muted-foreground")}>{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{empty}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(e => <EventCard key={e.id} e={e} />)}
        </div>
      )}
    </section>
  );
}

function StatBox({ k, v }: { k: string | number; v: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <div className="font-display text-3xl text-neon">{k}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{v}</div>
    </div>
  );
}
