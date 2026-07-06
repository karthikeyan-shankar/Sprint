import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, CheckCircle2, XCircle, FileText, MessageSquare, Table2,
  Wallet, Users2, LayoutDashboard, FileDown, CalendarPlus, Sparkles, Clock,
} from "lucide-react";
import { Navbar, Footer } from "@/components/site/Navbar";

export const Route = createFileRoute("/why")({
  component: WhyPage,
  head: () => ({
    meta: [
      { title: "Why Sprint — One workflow for every college event" },
      { name: "description", content: "Sprint replaces WhatsApp groups, Google Forms and Excel sheets with one platform for college events. See the old workflow, the problems, and the new Sprint workflow." },
      { property: "og:title", content: "Why Sprint" },
      { property: "og:description", content: "Replace WhatsApp, Google Forms and Excel with one platform built for college events." },
    ],
  }),
});

function WhyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-neon/15 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-neon" /> Why Sprint
          </div>
          <h1 className="text-display text-5xl uppercase md:text-8xl">
            Why should you stop <br /> using <span className="text-neon">Google Forms?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Every college event today lives across 6+ tools. Sprint replaces all of
            them with one workflow — built specifically for college organizers.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-border bg-card p-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <XCircle className="h-3 w-3" /> Current workflow
            </div>
            <div className="font-display text-3xl uppercase">The old way</div>
            <Flow items={[
              { icon: FileText,       label: "Poster" },
              { icon: MessageSquare,  label: "Instagram" },
              { icon: MessageSquare,  label: "WhatsApp groups" },
              { icon: FileText,       label: "Google Form" },
              { icon: Wallet,         label: "Payment screenshot" },
              { icon: Table2,         label: "Manual Excel" },
              { icon: Users2,         label: "Manual verification" },
              { icon: MessageSquare,  label: "Phone calls" },
              { icon: Sparkles,       label: "Event day" },
            ]} tone="old" />
          </div>

          <div className="rounded-[2rem] border border-neon bg-neon/5 p-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-neon/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon">
              <CheckCircle2 className="h-3 w-3" /> Sprint workflow
            </div>
            <div className="font-display text-3xl uppercase">The Sprint way</div>
            <Flow items={[
              { icon: CalendarPlus,     label: "Create event" },
              { icon: Sparkles,         label: "Publish" },
              { icon: Users2,           label: "Students register" },
              { icon: Wallet,           label: "Payment tracked" },
              { icon: LayoutDashboard,  label: "Participant dashboard" },
              { icon: FileDown,         label: "Export required data" },
              { icon: Sparkles,         label: "Conduct event" },
            ]} tone="new" />
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-neon">Problems</div>
          <h2 className="mt-2 font-display text-4xl uppercase md:text-6xl">Where the old way breaks.</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Too many tools",       body: "Instagram, WhatsApp, Google Form, Excel, phone — one event, six apps." },
            { title: "Manual work",          body: "Copy names, copy phone numbers, copy transaction IDs. Every event." },
            { title: "Time consuming",       body: "What should take minutes eats up entire evenings before the event." },
            { title: "Duplicate work",       body: "The same data is entered by the student, the organizer and the faculty." },
            { title: "Payment confusion",    body: "A folder full of UPI screenshots and no easy way to match them to a name." },
            { title: "Participant confusion",body: "Nobody knows who's actually attending until the day of the event." },
            { title: "No source of truth",   body: "The 'real' list lives in one Excel, on one laptop — until it doesn't." },
            { title: "No centralized platform", body: "Students hunt across Instagram and WhatsApp to find what's happening on campus." },
          ].map(p => (
            <div key={p.title} className="rounded-3xl border border-border bg-card p-6">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              <div className="mt-4 font-display text-lg uppercase">{p.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap note */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon">
            <Clock className="h-3 w-3" /> Coming soon
          </div>
          <div className="font-display text-2xl uppercase">WhatsApp automation is a future feature.</div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            We're honest about what Sprint does today. Registrations, payment tracking,
            participant dashboards and exports are live. WhatsApp confirmations,
            reminders and announcements are on the roadmap — we won't pretend
            they already exist.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-neon p-10 text-neon-foreground md:p-14">
          <div className="grid-court absolute inset-0 opacity-20" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest">Early Access</div>
              <h3 className="mt-3 font-display text-4xl uppercase leading-none md:text-6xl">Move your next event onto Sprint.</h3>
              <p className="mt-4 max-w-md text-sm opacity-80">Publish once. Skip the WhatsApp chaos, the form fatigue and the Excel cleanup.</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/app/create" className="rounded-full bg-ink px-6 py-3.5 font-bold uppercase text-neon">Publish first event</Link>
              <Link to="/explore" className="inline-flex items-center gap-1 rounded-full border border-ink/30 px-6 py-3.5 font-semibold uppercase">
                Explore Sprint <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Flow({ items, tone }: { items: { icon: any; label: string }[]; tone: "old" | "new" }) {
  return (
    <ol className="mt-6 space-y-2">
      {items.map((s, i) => (
        <li key={s.label} className="flex items-center gap-3">
          <span className={
            "grid h-8 w-8 shrink-0 place-items-center rounded-xl " +
            (tone === "new" ? "bg-neon text-neon-foreground" : "border border-border bg-surface-2 text-muted-foreground")
          }>
            <s.icon className="h-4 w-4" />
          </span>
          <span className={"text-sm " + (tone === "new" ? "" : "text-muted-foreground")}>{s.label}</span>
          {i < items.length - 1 && <span className="ml-auto text-xs text-muted-foreground">↓</span>}
        </li>
      ))}
    </ol>
  );
}
