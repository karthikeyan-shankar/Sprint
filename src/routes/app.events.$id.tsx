import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, CheckCircle2, Clock, XCircle, Download, FileSpreadsheet, FileText,
  Loader2, Megaphone, Send, Users, Search, MessageCircle, Mail, CircleDollarSign,
  BadgeCheck, TrendingUp, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppPageHeader, AppPanel } from "./app";
import { formatDate } from "@/lib/mock-data";
import {
  getEvent, listRegistrationsForEvent, updateRegistrationStatus, bulkUpdateStatus,
  updateRegistration, type EventDoc, type RegistrationDoc, type RegStatus,
} from "@/lib/events";
import { TEMPLATES, fillTemplate, whatsappLink, mailtoLink, batchMailto } from "@/lib/comms";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { RegistrantDrawer } from "@/components/host/RegistrantDrawer";

type Tab = "overview" | "registrations" | "export";

export const Route = createFileRoute("/app/events/$id")({
  component: ManageEvent,
  head: () => ({ meta: [{ title: "Manage Event — Sprint" }] }),
});

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "registrations", label: "Registrations", icon: Users },
  { key: "export", label: "Export", icon: Download },
];

function ManageEvent() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [regs, setRegs] = useState<RegistrationDoc[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [openReg, setOpenReg] = useState<RegistrationDoc | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getEvent(id), listRegistrationsForEvent(id)])
      .then(([e, r]) => { if (!cancelled) { setEvent(e); setRegs(r); } })
      .catch((err) => console.error("manage load failed", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const updateReg = (r: RegistrationDoc) => setRegs((prev) => prev.map((x) => x.id === r.id ? r : x));

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        <div className="mt-2 text-sm">Loading event…</div>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="py-20 text-center">
        <div className="font-display text-4xl uppercase">Event not found</div>
        <Link to="/app/my-events" className="mt-6 inline-flex rounded-full bg-neon px-5 py-2.5 text-sm font-bold uppercase text-neon-foreground">My events</Link>
      </div>
    );
  }
  if (!user || event.organizerId !== user.id) {
    return (
      <div className="py-20 text-center">
        <div className="font-display text-4xl uppercase">Access denied</div>
        <p className="mt-2 text-muted-foreground">You don't have permission to manage this event.</p>
        <Link to="/app/my-events" className="mt-6 inline-flex rounded-full bg-neon px-5 py-2.5 text-sm font-bold uppercase text-neon-foreground">My events</Link>
      </div>
    );
  }

  const e = event;
  const pending = regs.filter(r => r.status === "pending");
  const approved = regs.filter(r => r.status === "approved");
  const rejected = regs.filter(r => r.status === "rejected");
  const paid = regs.filter(r => r.paymentStatus === "Paid");
  const revenue = paid.reduce((a) => a + (e.fee || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/my-events" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-neon">
          <ArrowLeft className="h-3 w-3" /> My events
        </Link>
      </div>

      <AppPageHeader eyebrow="Command center" title={e.title} subtitle={`${formatDate(e.date)} · ${e.venue}${e.city ? `, ${e.city}` : ""}`} />

      {/* Alert bar */}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-full border border-border bg-surface-2 p-1 text-xs font-bold uppercase tracking-widest overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5",
              tab === t.key ? "bg-neon text-neon-foreground" : "text-muted-foreground hover:text-foreground"
            )}>
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <OverviewTab event={e} regs={regs} pending={pending.length} approved={approved.length} rejected={rejected.length} paid={paid.length} revenue={revenue} onOpen={setOpenReg} onJump={setTab} />}
      {tab === "registrations" && <RegistrationsTab event={e} regs={regs} setRegs={setRegs} onOpen={setOpenReg} />}
      {tab === "export" && <ExportTab event={e} regs={regs} />}

      <RegistrantDrawer reg={openReg} event={e} onClose={() => setOpenReg(null)} onChange={updateReg} />
    </div>
  );
}

/* ---------------- Overview ---------------- */

function OverviewTab({
  event: e, regs, pending, approved, rejected, paid, revenue, onOpen, onJump,
}: {
  event: EventDoc; regs: RegistrationDoc[]; pending: number; approved: number; rejected: number; paid: number; revenue: number;
  onOpen: (r: RegistrationDoc) => void; onJump: (t: Tab) => void;
}) {
  const fillPct = e.maxParticipants ? Math.min(100, Math.round((regs.length / e.maxParticipants) * 100)) : 0;
  
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <AppPanel title="At a glance">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Registered" value={regs.length} tone="text-foreground" />
          <Stat label="Seats" value={`${regs.length}/${e.maxParticipants || "∞"}`} tone="text-foreground" />
        </div>
        {e.maxParticipants > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Fill rate</span><span>{fillPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full bg-neon transition-all" style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        )}
      </AppPanel>

      <AppPanel title="Share your event">
        {e.poster ? (
          <img src={e.poster} alt={e.title} className="mb-3 h-24 w-full rounded-2xl object-cover" />
        ) : <div className="mb-3 h-24 w-full rounded-2xl bg-surface-2" />}
        <Link to="/events/$id" params={{ id: e.id }} className="inline-flex w-full items-center justify-center rounded-full border border-border bg-surface-2 py-2 text-xs font-bold uppercase hover:bg-surface">View public page</Link>
        <button
          onClick={() => {
            const url = `${window.location.origin}/events/${e.id}`;
            navigator.clipboard.writeText(url);
            toast.success("Link copied");
          }}
          className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-neon py-2 text-xs font-bold uppercase text-neon-foreground"
        >Copy registration link</button>
      </AppPanel>
    </div>
  );
}

/* ---------------- Registrations ---------------- */

type FilterStatus = "all" | RegStatus;
type FilterPayment = "all" | "Paid" | "Pending" | "Waived";

function RegistrationsTab({
  event, regs, setRegs, onOpen,
}: {
  event: EventDoc; regs: RegistrationDoc[]; setRegs: (r: RegistrationDoc[]) => void; onOpen: (r: RegistrationDoc) => void;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return regs.filter((r) => {
      if (!needle) return true;
      return [r.name, r.email, r.phone, r.collegeName, r.department, r.teamName]
        .filter(Boolean).some((s) => String(s).toLowerCase().includes(needle));
    });
  }, [regs, q]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <AppPanel>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone, college, team…"
              className="w-full rounded-full border border-border bg-surface-2 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-neon"
            />
          </div>
        </div>
      </AppPanel>

      <AppPanel>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {regs.length === 0 ? "No registrations yet." : "No matches for these filters."}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">College · Dept</th>
                  <th className="pb-2">Phone</th>
                  <th className="pb-2">Txn ID</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-2/50">
                    <td className="py-3">
                      <button onClick={() => onOpen(r)} className="block text-left hover:text-neon">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </button>
                    </td>
                    <td className="py-3 text-xs">
                      <div>{r.collegeName || "—"}</div>
                      <div className="text-muted-foreground">{r.department || "—"} · {r.year}</div>
                    </td>
                    <td className="py-3 tabular-nums text-xs">
                      <div className="flex items-center gap-1">
                        {r.phone}
                        <a href={whatsappLink(r.phone, `Hi ${r.name}, `)} target="_blank" rel="noreferrer" className="ml-1 text-muted-foreground hover:text-neon" title="WhatsApp"><MessageCircle className="h-3.5 w-3.5" /></a>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">
                      {r.txnId || "—"}
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => onOpen(r)} className="rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground">Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AppPanel>
    </div>
  );
}

function FilterChips({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <button key={o.v} onClick={() => onChange(o.v)} className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
            value === o.v ? "bg-neon text-neon-foreground" : "bg-surface-2 text-muted-foreground hover:text-foreground",
          )}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}



/* ---------------- Export ---------------- */

function ExportTab({ event, regs }: { event: EventDoc; regs: RegistrationDoc[] }) {
  const download = () => {
    const customCols = (event.customFields ?? []).map((f) => f.label);
    const baseCols = ["Name", "Email", "Phone", "College", "Department", "Year", "Gender", "Team", "Txn ID", "Payment", "Status", "Checked In", "Registered At"];
    const cols = [...baseCols, ...customCols];
    const rows = regs.map((r) => {
      const base = [
        r.name, r.email, r.phone, r.collegeName, r.department, r.year, r.gender,
        r.teamName ?? "", r.txnId ?? "", r.paymentStatus, r.status,
        r.checkedIn ? "Yes" : "No",
        r.createdAt?.toDate?.().toLocaleString?.() ?? "",
      ];
      const custom = (event.customFields ?? []).map((f) => r.answers?.[f.id] ?? "");
      return [...base, ...custom];
    });
    const csv = [cols, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${event.title.replace(/\W+/g, "-").toLowerCase()}-registrations.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const attendance = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = regs.filter(r => r.status === "approved").map((r, i) => `
      <tr>
        <td>${i + 1}</td><td>${r.name}</td><td>${r.collegeName || ""}</td><td>${r.phone}</td>
        <td style="width:80px;border:1px solid #999;">&nbsp;</td>
      </tr>`).join("");
    w.document.write(`<!doctype html><html><head><title>${event.title} — Attendance</title>
      <style>body{font-family:system-ui;padding:24px} table{width:100%;border-collapse:collapse} th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:left;font-size:12px}</style>
      </head><body>
      <h1>${event.title}</h1><p>${formatDate(event.date)} · ${event.venue}</p>
      <table><thead><tr><th>#</th><th>Name</th><th>College</th><th>Phone</th><th>Signature</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <AppPanel title="Export registrations">
      <p className="mb-6 text-sm text-muted-foreground">
        Download all {regs.length} registration(s) — with your custom questions and payment status included. Opens directly in Excel or Google Sheets.
      </p>
      <div className="flex flex-wrap gap-3">
        <button onClick={download} className="inline-flex items-center gap-2 rounded-full bg-neon px-5 py-2.5 text-xs font-bold uppercase text-neon-foreground">
          <FileSpreadsheet className="h-4 w-4" /> Download CSV
        </button>
        <button onClick={attendance} className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-bold uppercase hover:bg-surface-2">
          <FileText className="h-4 w-4" /> Print attendance sheet
        </button>
      </div>
    </AppPanel>
  );
}

/* ---------------- shared ---------------- */

function StatusBadge({ s }: { s: RegStatus }) {
  return (
    <span className={cn(
      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
      s === "pending" && "bg-yellow-500/20 text-yellow-400",
      s === "approved" && "bg-neon/20 text-neon",
      s === "rejected" && "bg-red-500/20 text-red-400",
    )}>{s}</span>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-2xl", tone)}>{value}</div>
    </div>
  );
}

// Silence unused imports kept intentionally for type/JSX context.
void [Clock, CheckCircle2, XCircle, CircleDollarSign];
