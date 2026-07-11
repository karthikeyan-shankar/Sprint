import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { Navbar, Footer } from "@/components/site/Navbar";
import { COLLEGES } from "@/lib/mock-data";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/colleges")({
  component: CollegesPage,
  head: () => ({
    meta: [
      { title: "Colleges — Sprint" },
      { name: "description", content: "Every college onboarded to Sprint gets a public page with events, followers and updates." },
    ],
  }),
});

function CollegesPage() {
  const colleges = COLLEGES;

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
        {colleges.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            eyebrow="Onboarding"
            title="Sprint is currently onboarding colleges and clubs."
            body="Want your college or club listed on Sprint? Request a listing and we'll set up your public page with your logo, cover and event calendar."
            primary={{ label: "Request Listing", href: "mailto:karthikeyanshankar8@gmail.com?subject=Request%20Listing%20on%20Sprint" }}
            secondary={{ label: "Why Sprint", to: "/why" }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* rendered when real colleges arrive */}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
