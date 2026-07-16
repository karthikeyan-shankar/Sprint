import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, ChevronRight, Sparkles, Zap, MessageSquare, Table2, CalendarPlus,
  Users2, Wallet, FileDown, LayoutDashboard, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { Navbar, Footer } from "@/components/site/Navbar";
import { Logo } from "@/components/Logo";
import { CATEGORIES } from "@/lib/mock-data";
import heroImg from "@/assets/hero-coral.png";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Sprint — One Platform. Every College Event." },
      { name: "description", content: "Sprint helps colleges create, publish, manage and discover campus events — without WhatsApp groups, Google Forms, or Excel sheets. Currently onboarding colleges across Tamil Nadu." },
      { property: "og:title", content: "Sprint — One Platform. Every College Event." },
      { property: "og:description", content: "Replace WhatsApp groups, Google Forms and Excel sheets with one platform built for college events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <MarqueeStrip />
      <PainGainMarquee />
      <ProblemSection />
      <SprintWorkflow />
      <FeatureGrid />
      <ExportShowcase />
      <CategoriesStrip />
      <WhatsAppRoadmap />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

/* ---------------- Kinetic Brutalist Hero ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink px-4 py-16 sm:px-8 sm:py-20 lg:py-24">
      {/* Background giant SPRINT */}
      <div className="pointer-events-none absolute -left-10 -top-10 select-none opacity-[0.05]">
        <h2 className="font-display text-[22rem] leading-none tracking-tighter text-foreground">SPRINT</h2>
      </div>
      <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-neon/20 blur-[140px]" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Content column */}
        <div className="space-y-10 lg:col-span-7">
          {/* Eyebrow */}
          <div className="flex items-center gap-4">
            <div className="flex h-6 items-center bg-neon px-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-foreground">
                Early Access · 2026
              </span>
            </div>
            <div className="hidden h-px flex-1 bg-border md:block" />
          </div>

          {/* Headline */}
          <div className="space-y-6">
            <h1 className="font-display text-7xl uppercase leading-[0.8] tracking-tighter text-foreground sm:text-8xl lg:text-[9rem]">
              Run your<br />
              <span className="inline-block -rotate-1 transform-gpu text-neon">Events</span> faster
            </h1>
            <p className="max-w-lg border-l-2 border-neon pl-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              The platform for Tamil Nadu's college fests. Publish events, take
              registrations, track payments and export clean XLSX — without
              WhatsApp groups, Google Forms or Excel chaos.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/app/create"
              className="group relative bg-neon px-10 py-5 font-display text-2xl uppercase text-neon-foreground transition-all hover:brightness-110"
            >
              Publish first event
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-2">→</span>
              <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-foreground" />
            </Link>
            <Link
              to="/explore"
              className="border-2 border-border bg-transparent px-10 py-5 font-display text-2xl uppercase text-foreground transition-all hover:border-neon hover:text-neon"
            >
              Explore Sprint
            </Link>
          </div>

          {/* Metric strip */}
          <div className="grid grid-cols-3 gap-8 border-t border-border pt-8">
            {[
              { v: "50+", k: "Colleges live" },
              { v: "Secure", k: "Payment tracking" },
              { v: "Fast", k: "XLSX export" },
            ].map((m) => (
              <div key={m.k}>
                <p className="font-display text-4xl uppercase text-foreground">{m.v}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{m.k}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual column */}
        <div className="relative lg:col-span-5">
          <div className="relative">
            {/* main poster */}
            <div className="group relative z-20">
              <img
                src={heroImg}
                alt="Sprint college event"
                className="aspect-[3/4] w-full object-cover shadow-2xl grayscale transition-all duration-500 group-hover:grayscale-0"
                width={800}
                height={1067}
              />
              {/* corner bracket */}
              <div className="absolute -right-4 -top-4 z-30 h-24 w-24 border-r-4 border-t-4 border-neon sm:-right-6 sm:-top-6 sm:h-32 sm:w-32" />

              {/* neon bottom badge */}
              <div className="absolute -bottom-4 -left-4 z-30 bg-neon p-5 sm:p-6">
                <div className="font-display text-2xl leading-none text-neon-foreground sm:text-3xl">TN-FEST '26</div>
                <div className="text-[10px] font-black uppercase tracking-tight text-neon-foreground/70">Verified Organizer</div>
              </div>

              {/* tilted revenue card */}
              <div className="absolute -left-8 top-10 z-40 rotate-[-5deg] bg-card p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-neon">
                    <CheckCircle2 className="h-5 w-5 text-neon-foreground" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Total revenue</p>
                    <p className="font-display text-2xl leading-none text-foreground">₹1,42,000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* decorative rotated frames */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[80%] w-[120%] -translate-x-1/2 -translate-y-1/2 rotate-12 border border-border" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[80%] w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-6 border border-neon/20" />
          </div>
        </div>
      </div>

      {/* bottom accent */}
      <div className="relative z-10 mt-16 flex h-1.5 w-full">
        <div className="flex-1 bg-neon" />
        <div className="flex-1 bg-neon/60" />
        <div className="flex-1 bg-neon/30" />
        <div className="flex-1 bg-neon/10" />
      </div>
    </section>
  );
}



function MarqueeStrip() {
  const items = ["SYMPOSIUM", "★", "HACKATHON", "★", "CULTURAL", "★", "SPORTS", "★", "PLACEMENT", "★", "WORKSHOP", "★", "GUEST LECTURE", "★", "STARTUP"];
  return (
    <div className="border-y border-border bg-ink py-4">
      <div className="flex overflow-hidden">
        <div className="flex shrink-0 animate-[marquee_35s_linear_infinite] gap-10 pr-10 font-display text-2xl uppercase tracking-widest text-neon">
          {[...items, ...items].map((w, i) => <span key={i}>{w}</span>)}
        </div>
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/* ---------------- Pain vs Gain Moving Cards ---------------- */
function PainGainMarquee() {
  const pairs = [
    { pain: "WhatsApp groups with 400 unread messages",       gain: "One clean event page every student can find" },
    { pain: "Google Forms with 27 junk columns",              gain: "Export only the columns you actually need" },
    { pain: "Payment screenshots lost in DMs",                gain: "Transaction ID + status attached to every registrant" },
    { pain: "Excel sheets copy-pasted by hand at midnight",   gain: "Live participant dashboard, always up to date" },
    { pain: "Students asking 'is this event real?'",          gain: "Verified college events, discoverable in seconds" },
    { pain: "Posters on Instagram nobody can register from",  gain: "Publish once — register, track, export inside Sprint" },
    { pain: "Chasing confirmations on phone calls",           gain: "Approve / reject in one tap from the dashboard" },
    { pain: "Different tool for every event, every year",     gain: "One workflow. Every symposium, hackathon, cultural" },
  ];
  const row = [...pairs, ...pairs];

  return (
    <section className="relative overflow-hidden border-b border-border bg-ink py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-neon">Pain → Gain</div>
        <h2 className="font-display text-3xl uppercase leading-tight sm:text-5xl">
          Every headache organizers know.<br />
          <span className="text-neon">Solved inside Sprint.</span>
        </h2>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          The cards below keep moving — each one is a real pain point today,
          matched with the way Sprint replaces it. Hover to pause.
        </p>
      </div>

      <div className="group relative mt-10">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />

        <div className="flex gap-5 overflow-hidden">
          <div className="flex shrink-0 gap-5 pr-5 animate-[paingain_50s_linear_infinite] group-hover:[animation-play-state:paused]">
            {row.map((p, i) => (
              <article
                key={i}
                className="flex w-[320px] shrink-0 overflow-hidden rounded-3xl border border-border bg-card sm:w-[380px]"
              >
                {/* pain half */}
                <div className="flex-1 border-r border-border p-5">
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    <XCircle className="h-3 w-3" /> Today
                  </div>
                  <div className="text-sm leading-snug text-muted-foreground line-through decoration-destructive/60">
                    {p.pain}
                  </div>
                </div>
                {/* gain half */}
                <div className="flex-1 bg-neon/5 p-5">
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-neon/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-neon">
                    <CheckCircle2 className="h-3 w-3" /> Sprint
                  </div>
                  <div className="text-sm font-semibold leading-snug text-foreground">
                    {p.gain}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* second row, reverse direction, for a richer moving-cards feel */}
      <div className="group relative mt-5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
        <div className="flex gap-5 overflow-hidden">
          <div className="flex shrink-0 gap-5 pr-5 animate-[paingainrev_60s_linear_infinite] group-hover:[animation-play-state:paused]">
            {[...row].reverse().map((p, i) => (
              <div
                key={i}
                className="flex w-[280px] shrink-0 items-center gap-3 rounded-2xl border border-border bg-surface/60 px-5 py-4 backdrop-blur"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neon/15 text-neon">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
                    {p.pain}
                  </div>
                  <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {p.gain}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes paingain { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes paingainrev { from { transform: translateX(-50%) } to { transform: translateX(0) } }
      `}</style>
    </section>
  );
}

/* ---------------- Problem / Why Sprint ---------------- */

function ProblemSection() {
  const oldSteps = ["Design a poster", "Post on Instagram", "Create WhatsApp group", "Send Google Form", "Chase payment screenshots", "Copy into Excel", "Verify by hand", "Send reminders on calls", "Event day"];
  return (
    <Section eyebrow="Why Sprint" title="The current way is broken.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <XCircle className="h-3 w-3" /> Without Sprint
          </div>
          <div className="font-display text-2xl uppercase">Poster → Instagram → WhatsApp → Google Form → Screenshot → Excel → Calls</div>
          <ol className="mt-6 space-y-3">
            {oldSteps.map((s, i) => (
              <li key={s} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-[10px] font-bold">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">
            Every event lives across 6+ tools. Organizers waste days copy-pasting.
            Students never know what's real. Payments turn into a screenshot inbox.
          </p>
        </div>

        <div className="rounded-3xl border border-neon bg-neon/5 p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-neon/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon">
            <CheckCircle2 className="h-3 w-3" /> With Sprint
          </div>
          <div className="font-display text-2xl uppercase">Publish once. Everything else happens inside Sprint.</div>
          <ol className="mt-6 space-y-3">
            {["Create event", "Publish", "Students register", "Payment tracked", "Participants dashboard", "Export only what you need", "Conduct event"].map((s, i) => (
              <li key={s} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neon text-[10px] font-bold text-neon-foreground">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <Link to="/why" className="mt-6 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-neon">
            See the full comparison <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Sprint Workflow ---------------- */
function SprintWorkflow() {
  const steps = [
    { icon: CalendarPlus,  title: "Create",      body: "Fill one form. Poster, rules, fee, deadline — done." },
    { icon: Sparkles,      title: "Publish",     body: "Your event is live and searchable across Sprint." },
    { icon: Users2,        title: "Register",    body: "Students discover and register in seconds." },
    { icon: Wallet,        title: "Payments",    body: "Store transaction IDs and payment status per registrant." },
    { icon: LayoutDashboard, title: "Dashboard", body: "See every participant in one organized view." },
    { icon: FileDown,      title: "Export",      body: "Download Excel with only the columns you need." },
  ];
  return (
    <Section eyebrow="Sprint workflow" title="Everything, in one place.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-neon">
            <div className="absolute right-6 top-6 font-display text-4xl text-border transition group-hover:text-neon/40">0{i + 1}</div>
            <s.icon className="h-6 w-6 text-neon" />
            <div className="mt-6 font-display text-xl uppercase">{s.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Feature Grid ---------------- */
function FeatureGrid() {
  const feats = [
    { icon: CalendarPlus, title: "Publish events",       body: "Create in minutes. Poster, category, rules, contact — one clean form." },
    { icon: Users2,       title: "Easy registration",    body: "Students register in one flow. No PDFs, no WhatsApp DMs." },
    { icon: LayoutDashboard, title: "Participant dashboard", body: "Every registrant in one organized view. Filter, approve, reject." },
    { icon: Wallet,       title: "Payment tracking",     body: "Transaction IDs, payment status, and screenshots — all attached to the registrant." },
    { icon: FileDown,     title: "Export Excel",         body: "Pick your columns. Skip the Google Form timestamps and junk fields." },
    { icon: Sparkles,     title: "Professional UI",      body: "Modern, fast, mobile-first. Your event finally looks like a real product." },
  ];
  return (
    <Section eyebrow="Features" title="Built for real organizers.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {feats.map(f => (
          <div key={f.title} className="rounded-3xl border border-border bg-card p-6 transition hover:border-neon">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-2">
              <f.icon className="h-5 w-5 text-neon" />
            </div>
            <div className="mt-5 font-display text-xl uppercase">{f.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- Export Showcase ---------------- */
function ExportShowcase() {
  const cols = [
    { k: "Name",           on: true },
    { k: "College",        on: true },
    { k: "Department",     on: true },
    { k: "Year",           on: true },
    { k: "Phone",          on: true },
    { k: "Email",          on: true },
    { k: "Transaction ID", on: true },
    { k: "Payment status", on: true },
    { k: "Timestamp",      on: false },
    { k: "Google row ID",  on: false },
  ];
  return (
    <Section eyebrow="Export" title="Only the data you actually need.">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-border bg-card p-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-neon">Pick your columns</div>
          <div className="font-display text-3xl uppercase leading-tight">Stop cleaning Google Form exports by hand.</div>
          <p className="mt-4 text-sm text-muted-foreground">
            Sprint lets organizers export only the fields they need. No junk
            timestamps, no unused columns — a clean Excel ready to hand to your
            faculty in one click.
          </p>
          <ul className="mt-6 space-y-2">
            {cols.map(c => (
              <li key={c.k} className="flex items-center gap-3 text-sm">
                <span className={"grid h-5 w-5 place-items-center rounded border " + (c.on ? "border-neon bg-neon text-neon-foreground" : "border-border text-muted-foreground")}>
                  {c.on ? "✓" : ""}
                </span>
                <span className={c.on ? "" : "text-muted-foreground line-through"}>{c.k}</span>
              </li>
            ))}
          </ul>
          <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-neon px-5 py-3 text-xs font-bold uppercase tracking-widest text-neon-foreground">
            <FileDown className="h-4 w-4" /> Export Excel
          </button>
        </div>

        {/* Fake spreadsheet preview — clearly illustrative, no real data */}
        <div className="overflow-hidden rounded-3xl border border-border bg-ink">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-xs text-muted-foreground">
            <Table2 className="h-4 w-4 text-neon" />
            <span className="font-mono">registrations_export.xlsx</span>
            <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-widest">Preview</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-surface-2 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  {["Name", "College", "Dept", "Year", "Phone", "TXN ID", "Status"].map(h => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="text-muted-foreground/60">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 w-20 rounded bg-surface-2" />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
                    Your first export appears here after your first event.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Categories ---------------- */
function CategoriesStrip() {
  return (
    <Section eyebrow="Categories" title="Built for every kind of college event.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.slice(0, 20).map(c => {
          const Icon = c.icon;
          return (
            <Link key={c.key} to="/explore" search={{ category: c.key } as any}
              className="group relative flex flex-col items-start justify-between overflow-hidden rounded-3xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-neon">
              <Icon className="h-6 w-6" style={{ color: c.accent }} />
              <div className="mt-6 font-display text-lg uppercase leading-tight">{c.label}</div>
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-0 transition group-hover:opacity-40" style={{ background: c.accent }} />
            </Link>
          );
        })}
      </div>
    </Section>
  );
}

/* ---------------- WhatsApp Roadmap ---------------- */
function WhatsAppRoadmap() {
  const items = ["Registration confirmation", "Event reminders", "Venue updates", "Schedule changes", "Announcements"];
  return (
    <Section eyebrow="Roadmap" title="WhatsApp updates for every participant.">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-neon/10 blur-3xl" />
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon">
              <Clock className="h-3 w-3" /> Coming soon
            </div>
            <div className="font-display text-3xl uppercase leading-tight md:text-4xl">
              Participants get every update on WhatsApp — automatically.
            </div>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              This is a future feature on Sprint's roadmap. It does not exist yet —
              we're being upfront so organizers can plan for it. Today, Sprint
              handles the registrations, dashboard, payments and exports.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {items.map(i => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 text-neon" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-surface-2 p-5">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preview</div>
            <div className="w-64 rounded-2xl bg-[#0b141a] p-4 text-xs text-[#e9edef] shadow-lg">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-[#8696a0]">Sprint · WhatsApp</div>
              <div className="rounded-lg rounded-tl-none bg-[#005c4b] p-3">
                You're registered for TechSymposium '26.
                <div className="mt-1 text-[10px] text-[#a5c9c1]">10:24 · via Sprint</div>
              </div>
              <div className="mt-2 rounded-lg rounded-tl-none bg-[#005c4b] p-3">
                Reminder: event starts tomorrow at 9:00 AM.
                <div className="mt-1 text-[10px] text-[#a5c9c1]">18:00 · via Sprint</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const items = [
    { q: "Is Sprint free during Early Access?", a: "Yes. Colleges, clubs and organizers can publish events on Sprint for free during Early Access." },
    { q: "Who can publish events?", a: "Any signed-in organizer — clubs, departments, associations, sports coordinators, symposium leads. No approval delays." },
    { q: "Do I have to move away from WhatsApp and Excel today?", a: "No. Use Sprint for registrations, payment tracking and exports first. Announcements over WhatsApp are on the roadmap." },
    { q: "How do payments work today?", a: "Organizers set a fee and UPI ID. Students register and enter their transaction ID. Sprint tracks status per registrant. Automated payment gateways are on the roadmap." },
    { q: "Can I export only the columns I need?", a: "Yes. That's the point. Pick exactly the fields you need and download a clean Excel — no Google Form junk." },
    { q: "Where is Sprint available?", a: "We're currently onboarding colleges across Tamil Nadu. India-wide rollout follows." },
  ];
  return (
    <Section eyebrow="FAQ" title="Answers, fast.">
      <div className="mx-auto max-w-4xl divide-y divide-border rounded-3xl border border-border bg-card">
        {items.map(f => (
          <details key={f.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg uppercase">
              {f.q}
              <ChevronRight className="h-5 w-5 text-neon transition group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- CTA ---------------- */
function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-neon p-10 text-neon-foreground md:p-16">
        <div className="grid-court absolute inset-0 opacity-20" />
        <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest">Early Access</div>
            <h3 className="mt-3 font-display text-5xl uppercase leading-none md:text-7xl">Be the first organizer on Sprint.</h3>
            <p className="mt-4 max-w-md text-sm opacity-80">
              Help us shape the future of college events. Publish your first event
              in minutes — no forms, no spreadsheets, no WhatsApp chaos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/app/create" className="rounded-full bg-ink px-6 py-3.5 font-bold uppercase text-neon">Publish first event</Link>
            <Link to="/why" className="rounded-full border border-ink/30 px-6 py-3.5 font-semibold uppercase">Why Sprint</Link>
          </div>
        </div>
        <Logo size="xl" className="pointer-events-none absolute -bottom-6 -right-4 select-none opacity-10 md:-right-10" />
      </div>
    </section>
  );
}

function Section({ eyebrow, title, cta, children }: { eyebrow: string; title: string; cta?: { to: string; label: string }; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-neon">{eyebrow}</div>
          <h2 className="mt-2 font-display text-4xl uppercase leading-none md:text-6xl">{title}</h2>
        </div>
        {cta && (
          <Link to={cta.to} className="hidden shrink-0 items-center gap-1 text-sm font-bold uppercase tracking-widest hover:text-neon sm:inline-flex">
            {cta.label} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}
