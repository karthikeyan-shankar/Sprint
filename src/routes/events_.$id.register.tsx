import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar, Footer } from "@/components/site/Navbar";
import { CATEGORY_MAP, formatDate, EVENTS, type CollegeEvent } from "@/lib/mock-data";
import { getEvent, createRegistration, type EventDoc, type CustomField } from "@/lib/events";
import { uploadImage } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events_/$id/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Register — Sprint" }] }),
});

const inputCls = "w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-neon";

function RegisterPage() {
  const { id } = Route.useParams();
  const { user, isAuthed, registerForEvent } = useAuth();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    collegeName: "",
    department: "",
    year: "1st Year",
    gender: "Male" as "Male" | "Female" | "Other",
    teamName: "",
    txnId: "",
    notes: "",
    paymentScreenshotUrl: "",
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    // Check mock events first
    const mock = EVENTS.find((x) => x.id === id);
    if (mock) {
      const mockAsDoc: EventDoc = {
        id: mock.id,
        title: mock.title,
        description: mock.description,
        category: mock.category,
        hostType: "College",
        hostName: mock.organizer,
        collegeName: mock.organizer,
        organizerId: "mock",
        organizerName: "Mock",
        contactPerson: "Organizer",
        contactPhone: mock.contactPhone,
        contactEmail: mock.contactEmail,
        venue: mock.venue,
        city: mock.city,
        district: mock.district,
        date: mock.date,
        time: mock.time,
        registrationDeadline: mock.registrationDeadline,
        fee: mock.fee,
        maxParticipants: mock.maxParticipants,
        gallery: [],
        rules: mock.rules,
        status: mock.status as any,
        participants: mock.participants,
        poster: mock.banner.includes('url') ? mock.banner.slice(5, -2) : undefined, // very basic extraction
      };
      setEvent(mockAsDoc);
      setLoading(false);
      return;
    }

    getEvent(id)
      .then((e) => { if (!cancelled) setEvent(e); })
      .catch((err) => console.error("getEvent failed", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (user) setForm((f) => ({
      ...f,
      name: f.name || user.name || "",
      email: f.email || user.email || "",
      department: f.department || user.department || "",
      year: f.year || user.year || "1st Year",
    }));
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-xl px-6 py-20 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          <div className="mt-3 text-sm">Loading event…</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="font-display text-6xl uppercase">Event not found</div>
          <Link to="/explore" className="mt-6 inline-flex rounded-full bg-neon px-5 py-2.5 text-sm font-bold uppercase text-neon-foreground">Back to Explore</Link>
        </div>
      </div>
    );
  }

  const e = event;
  const cat = CATEGORY_MAP[e.category];

  if (!isAuthed || !user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="font-display text-4xl uppercase">Sign in to register</div>
          <p className="mt-3 text-muted-foreground">You need an account to register for events on Sprint.</p>
          <Link to="/login" className="mt-6 inline-flex rounded-full bg-neon px-6 py-3 text-sm font-bold uppercase text-neon-foreground">Sign in</Link>
        </section>
        <Footer />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-neon/20 text-neon"><CheckCircle2 className="h-10 w-10" /></div>
          <div className="mt-6 font-display text-5xl uppercase">You're in!</div>
          <p className="mt-3 text-muted-foreground">Your registration for <span className="text-foreground font-semibold">{e.title}</span> has been submitted. The organizer will review your payment and confirm soon.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/events/$id" params={{ id: e.id }} className="rounded-full border border-border px-5 py-2.5 text-sm font-bold uppercase hover:bg-surface-2">View event</Link>
            <Link to="/app" className="rounded-full bg-neon px-5 py-2.5 text-sm font-bold uppercase text-neon-foreground">My Sprint</Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error("Fill required fields"); return; }
    if (e.fee > 0) {
      if (!form.txnId) { toast.error("Enter UPI transaction ID"); return; }
      if (!form.paymentScreenshotUrl) { toast.error("Please upload your payment screenshot"); return; }
    }
    for (const f of e.customFields ?? []) {
      if (f.required && !(answers[f.id] ?? "").trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    setSubmitting(true);
    try {
      await createRegistration({
        eventId: e.id,
        userId: user.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        collegeName: form.collegeName || user.collegeId || "",
        department: form.department,
        year: form.year,
        gender: form.gender,
        teamName: form.teamName || undefined,
        txnId: form.txnId || undefined,
        paymentScreenshotUrl: form.paymentScreenshotUrl || undefined,
        notes: form.notes || undefined,
        answers: Object.keys(answers).length ? answers : undefined,
        paymentStatus: e.fee === 0 ? "Waived" : "Pending",
      }, { autoApprove: e.approvalMode === "auto" && e.fee === 0 });
      registerForEvent(e.id);
      setSubmitted(true);
      toast.success("Registration submitted!");
    } catch (err: any) {
      console.error("createRegistration failed", err);
      toast.error("Couldn't submit", { description: err?.message ?? "Try again in a moment" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingScreenshot(true);
    try {
      const url = await uploadImage(file, `payments/${event?.id}`);
      setForm((prev) => ({ ...prev, paymentScreenshotUrl: url }));
      toast.success("Screenshot uploaded");
    } catch (err: any) {
      toast.error("Upload failed", { description: err?.message });
    } finally {
      setUploadingScreenshot(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10 pb-20">
        <div className="mb-10">
          <Link to="/events/$id" params={{ id: e.id }} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-neon">
            <ArrowLeft className="h-3 w-3" /> Back to event
          </Link>
          <div className="mt-4 text-xs font-bold uppercase tracking-widest text-neon">Register</div>
          <h1 className="mt-1 font-display text-4xl uppercase leading-none md:text-5xl">{e.title}</h1>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <div className="sticky top-24 space-y-6">
              {e.poster ? (
                <img src={e.poster} alt={e.title} className="w-full rounded-3xl border border-border bg-surface-2 object-cover aspect-[4/5]" />
              ) : (
                <div className="flex w-full aspect-[4/5] items-center justify-center rounded-3xl border border-border bg-surface-2 p-10 text-center">
                  <div className="font-display text-4xl uppercase text-muted-foreground opacity-20">{e.title}</div>
                </div>
              )}
              <div className="rounded-2xl border border-border bg-surface-2 p-6">
                 <div className="text-lg font-semibold">{e.title}</div>
                 <div className="mt-1 text-sm text-muted-foreground">{formatDate(e.date)} • {e.time}</div>
                 <div className="mt-1 text-sm text-muted-foreground">{e.venue}</div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <form onSubmit={submit} className="space-y-6 rounded-3xl border border-border bg-card p-6 lg:p-8">
          <div className="rounded-2xl border border-border bg-surface-2 p-4 text-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registering as</div>
            <div className="mt-1 font-semibold text-foreground">{user?.name || "Student"}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
            {user?.collegeId && <div className="mt-1 text-[10px] text-muted-foreground">{user.collegeId}</div>}
          </div>

          <Field label="Phone number *">
            <input type="tel" className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={x => setForm({ ...form, phone: x.target.value })} />
          </Field>

          {e.fee > 0 && (
            <>
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment</div>
                <div className="mt-2 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="font-display text-3xl text-neon">₹{e.fee}</div>
                    <div className="text-sm text-muted-foreground">Pay to <span className="font-semibold text-foreground">{e.upiId || e.contactPhone || "organizer"}</span></div>
                  </div>
                  {e.upiQrUrl && (
                    <img src={e.upiQrUrl} alt="Payment QR" className="h-24 w-24 rounded-xl border border-border bg-white p-1" />
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="12-digit UTR / Txn ID *"><input className={inputCls} placeholder="e.g. 312345678901" value={form.txnId} onChange={x => setForm({ ...form, txnId: x.target.value })} /></Field>
                <Field label="Payment screenshot *">
                  <label className={cn(inputCls, "flex cursor-pointer items-center justify-center gap-2 transition hover:border-neon", form.paymentScreenshotUrl && "border-neon text-neon")}>
                    {uploadingScreenshot ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploadingScreenshot ? "Uploading…" : form.paymentScreenshotUrl ? "Screenshot Uploaded" : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
                  </label>
                </Field>
              </div>
            </>
          )}

          {(e.customFields && e.customFields.length > 0) && (
            <div className="space-y-4 rounded-2xl border border-border bg-surface-2 p-4">
              <div className="text-xs font-bold uppercase tracking-widest text-neon">Host's questions</div>
              {e.customFields.map((f) => (
                <CustomFieldInput key={f.id} field={f} value={answers[f.id] ?? ""} onChange={(v) => setAnswers({ ...answers, [f.id]: v })} />
              ))}
            </div>
          )}

          <button type="submit" disabled={submitting || uploadingScreenshot} className="w-full rounded-full bg-neon py-3.5 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow disabled:opacity-60">
            {submitting ? "Submitting…" : uploadingScreenshot ? "Uploading screenshot…" : "Submit registration"}
          </button>
        </form>
        </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function CustomFieldInput({ field, value, onChange }: { field: CustomField; value: string; onChange: (v: string) => void }) {
  const label = `${field.label}${field.required ? " *" : ""}`;
  if (field.type === "long") {
    return <Field label={label}><textarea rows={3} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} /></Field>;
  }
  if (field.type === "single") {
    return (
      <Field label={label}>
        <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </Field>
    );
  }
  if (field.type === "multi") {
    const chosen = new Set(value ? value.split("|") : []);
    return (
      <Field label={label}>
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((o) => {
            const on = chosen.has(o);
            return (
              <button
                type="button"
                key={o}
                onClick={() => {
                  const next = new Set(chosen);
                  if (on) next.delete(o); else next.add(o);
                  onChange(Array.from(next).join("|"));
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest",
                  on ? "border-neon bg-neon text-neon-foreground" : "border-border bg-surface-2 text-muted-foreground",
                )}
              >{o}</button>
            );
          })}
        </div>
      </Field>
    );
  }
  return <Field label={label}><input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} /></Field>;
}

