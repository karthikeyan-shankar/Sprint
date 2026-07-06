import { useEffect, useState } from "react";
import { X, Phone, Mail, MessageCircle, CheckCircle2, XCircle, Loader2, CircleDollarSign, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import type { RegistrationDoc, EventDoc, RegStatus } from "@/lib/events";
import { updateRegistration, markCheckedIn, updateRegistrationStatus } from "@/lib/events";
import { whatsappLink, mailtoLink, TEMPLATES, fillTemplate } from "@/lib/comms";
import { cn } from "@/lib/utils";

export function RegistrantDrawer({
  reg,
  event,
  onClose,
  onChange,
}: {
  reg: RegistrationDoc | null;
  event: EventDoc;
  onClose: () => void;
  onChange: (updated: RegistrationDoc) => void;
}) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [tplId, setTplId] = useState(TEMPLATES[0].id);

  useEffect(() => {
    if (reg) setNotes(reg.notes ?? "");
  }, [reg?.id]);

  if (!reg) return null;

  const setStatus = async (status: RegStatus) => {
    onChange({ ...reg, status });
    try {
      await updateRegistrationStatus(reg.id, status);
      toast.success(status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Set to pending");
    } catch (e: any) {
      toast.error("Failed", { description: e?.message });
    }
  };

  const togglePaid = async () => {
    const next = reg.paymentStatus === "Paid" ? "Pending" : "Paid";
    onChange({ ...reg, paymentStatus: next });
    try {
      await updateRegistration(reg.id, { paymentStatus: next });
      toast.success(`Marked ${next}`);
    } catch (e: any) {
      toast.error("Failed", { description: e?.message });
    }
  };

  const toggleCheckIn = async () => {
    const next = !reg.checkedIn;
    onChange({ ...reg, checkedIn: next });
    try {
      await markCheckedIn(reg.id, next);
      toast.success(next ? "Checked in" : "Check-in cleared");
    } catch (e: any) {
      toast.error("Failed", { description: e?.message });
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await updateRegistration(reg.id, { notes });
      onChange({ ...reg, notes });
      toast.success("Notes saved");
    } catch (e: any) {
      toast.error("Failed", { description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  const tpl = TEMPLATES.find((t) => t.id === tplId)!;
  const filledBody = fillTemplate(tpl.body, reg, event);
  const filledSubject = fillTemplate(tpl.subject, reg, event);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 p-4 backdrop-blur">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registrant</div>
            <div className="truncate font-display text-2xl uppercase leading-tight">{reg.name}</div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-surface-2"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-6 p-4">
          {/* Status & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={toggleCheckIn} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface-2 px-4 py-2 text-xs font-bold uppercase hover:bg-surface">
              <BadgeCheck className="h-3.5 w-3.5" /> {reg.checkedIn ? "Undo check-in" : "Check in"}
            </button>
            {reg.checkedIn && <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-400">Checked in</span>}
          </div>

          {/* Contact */}
          <div className="grid grid-cols-3 gap-2">
            <a href={`tel:${reg.phone}`} className="inline-flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface-2 p-3 text-xs hover:border-neon">
              <Phone className="h-4 w-4 text-neon" /> Call
            </a>
            <a href={whatsappLink(reg.phone, `Hi ${reg.name}, regarding ${event.title} — `)} target="_blank" rel="noreferrer" className="inline-flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface-2 p-3 text-xs hover:border-neon">
              <MessageCircle className="h-4 w-4 text-neon" /> WhatsApp
            </a>
            <a href={mailtoLink(reg.email, `Regarding ${event.title}`, "")} className="inline-flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface-2 p-3 text-xs hover:border-neon">
              <Mail className="h-4 w-4 text-neon" /> Email
            </a>
          </div>

          {/* Details */}
          <Section title="Details">
            <Row k="Email" v={reg.email} />
            <Row k="Phone" v={reg.phone} />
            <Row k="College" v={reg.collegeName || "—"} />
            <Row k="Department" v={reg.department || "—"} />
            <Row k="Year" v={reg.year} />
            <Row k="Gender" v={reg.gender} />
            {reg.teamName && <Row k="Team" v={reg.teamName} />}
            {reg.txnId && <Row k="Txn ID (UTR)" v={reg.txnId} mono />}
            {reg.paymentScreenshotUrl && (
              <div className="mt-2 space-y-2">
                <div className="text-sm text-muted-foreground">Payment Screenshot</div>
                <a href={reg.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-border">
                  <img src={reg.paymentScreenshotUrl} alt="Payment Screenshot" className="w-full object-contain hover:opacity-90 transition-opacity" />
                </a>
              </div>
            )}
          </Section>

          {/* Custom answers */}
          {event.customFields && event.customFields.length > 0 && (
            <Section title="Answers">
              {event.customFields.map((f) => (
                <Row key={f.id} k={f.label} v={reg.answers?.[f.id] || "—"} />
              ))}
            </Section>
          )}

          {/* Notes */}
          <Section title="Private notes">
            <textarea
              rows={4}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-neon"
              placeholder="Only you and co-hosts see this."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={saveNotes} disabled={saving} className="mt-2 rounded-full bg-neon px-4 py-1.5 text-[11px] font-bold uppercase text-neon-foreground disabled:opacity-60">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save notes"}
            </button>
          </Section>

          {/* Send message */}
          <Section title="Send a message">
            <select value={tplId} onChange={(e) => setTplId(e.target.value)} className="mb-2 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-neon">
              {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <pre className="mb-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted-foreground">{filledBody}</pre>
            <div className="flex gap-2">
              <a href={whatsappLink(reg.phone, filledBody)} target="_blank" rel="noreferrer" className="flex-1 rounded-full bg-neon py-2 text-center text-xs font-bold uppercase text-neon-foreground">Send on WhatsApp</a>
              <a href={mailtoLink(reg.email, filledSubject, filledBody)} className="flex-1 rounded-full border border-border bg-surface-2 py-2 text-center text-xs font-bold uppercase hover:bg-surface">Email</a>
            </div>
          </Section>
        </div>
      </aside>
    </div>
  );
}



function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("text-right", mono && "font-mono text-xs")}>{v}</span>
    </div>
  );
}
