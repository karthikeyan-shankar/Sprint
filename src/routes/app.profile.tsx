import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppPageHeader, AppPanel } from "./app";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/profile")({
  component: Profile,
});

function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(user);
  
  useEffect(() => {
    if (user && !form) {
      setForm(user);
    }
  }, [user, form]);

  if (!user || !form) return null;

  const save = (ev: React.FormEvent) => {
    ev.preventDefault();
    updateProfile(form);
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-6">
      <AppPageHeader eyebrow="You" title="Profile" subtitle="Your identity across Sprint." />
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <AppPanel title="Photo">
          <div className="grid aspect-square place-items-center rounded-3xl bg-surface-2 font-display text-6xl text-neon">
            {form.name.split(" ").map(n => n[0]).slice(0,2).join("")}
          </div>
          <button type="button" onClick={() => toast.info("Photo upload (mock)")}
            className="mt-4 w-full rounded-full border border-border bg-surface-2 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-surface">Change photo</button>
        </AppPanel>

        <AppPanel title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="College"><input className={inputCls} placeholder="e.g. Anna University" value={form.collegeId} onChange={e => setForm({ ...form, collegeId: e.target.value })} /></Field>
            <Field label="Department"><input className={inputCls} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></Field>
            <Field label="Year">
              <select className={inputCls} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                {["1st Year", "2nd Year", "3rd Year", "4th Year", "PG"].map(y => <option key={y}>{y}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Bio"><textarea rows={4} className={inputCls} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></Field>
          </div>
          <button type="submit" className="mt-6 rounded-full bg-neon px-6 py-3 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow">Save changes</button>
        </AppPanel>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Events created" value={user.createdEventIds.length} />
        <Stat label="Events joined" value={user.joinedEventIds.length} />
        <Stat label="Bookmarks" value={user.bookmarkedEventIds.length} />
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-neon";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-5xl text-neon">{value}</div>
    </div>
  );
}
