import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Code2, BrainCircuit, Building2 } from "lucide-react";
import { Navbar, Footer } from "@/components/site/Navbar";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/practice")({
  component: PracticePage,
  head: () => ({
    meta: [
      { title: "Practice — Sprint" },
      { name: "description", content: "Prepare for placements with DSA questions, interview prep, and coding challenges." },
    ],
  }),
});

function PracticePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-8">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            <Code2 className="h-3 w-3" /> Coming Soon
          </div>
          <h1 className="font-display text-5xl uppercase sm:text-7xl">
            Placement <span className="text-emerald-400">Prep.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Practice DSA questions, mock interviews, and coding challenges. Questions tagged by company — TCS, Infosys, Wipro, and more.
          </p>
        </div>
      </section>

      {/* Preview cards */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Code2, title: "DSA Questions", desc: "Arrays, Trees, Graphs, DP — sorted by difficulty", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
            { icon: BrainCircuit, title: "Aptitude & Reasoning", desc: "Quantitative, logical, and verbal reasoning practice", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
            { icon: Building2, title: "Company-wise", desc: "Recently asked questions from TCS, Infosys, Wipro, CTS", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
          ].map((c) => (
            <div key={c.title} className={`glass rounded-2xl border p-6 ${c.color}`}>
              <c.icon className="mb-3 h-8 w-8" />
              <h3 className="font-display text-lg uppercase text-foreground">{c.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <EmptyState
            icon={BookOpen}
            eyebrow="Building"
            title="Practice section launching soon."
            body="We're building the most useful placement prep hub for college students. Want to contribute questions or get early access?"
            primary={{ label: "Get Early Access", href: "mailto:karthikeyanshankar8@gmail.com?subject=Sprint%20Practice%20Early%20Access" }}
            secondary={{ label: "Go to Arena", to: "/arena" }}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
