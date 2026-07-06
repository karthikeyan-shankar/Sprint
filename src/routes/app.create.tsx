import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Save, ArrowLeft, Check, Loader2 } from "lucide-react";
import { AppPageHeader, AppPanel } from "./app";
import { CATEGORIES, CATEGORY_MAP, COLLEGES, type CategoryKey } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { createEvent, type NewEventInput, type EventStatus, type CustomField, type PaymentMode, type ApprovalMode } from "@/lib/events";
import { CustomFieldsBuilder } from "@/components/host/CustomFieldsBuilder";
import { uploadImage } from "@/lib/firebase";


export const Route = createFileRoute("/app/create")({
  component: CreateEvent,
});

// -------- Step 1: chooser groups --------
type ChooserGroup = { label: string; keys: CategoryKey[] };

const CHOOSER: ChooserGroup[] = [
  { label: "Sports",              keys: ["sports"] },
  { label: "Hackathon",           keys: ["hackathon", "coding"] },
  { label: "Workshop / Bootcamp", keys: ["workshop", "bootcamp"] },
  { label: "Symposium",           keys: ["symposium", "conference"] },
  { label: "Technical Event",     keys: ["technical", "paper", "project-expo", "innovation"] },
  { label: "Non Technical Event", keys: ["non-technical", "quiz", "debate", "poster"] },
  { label: "Cultural",            keys: ["cultural", "festival", "music", "dance", "drama", "photography"] },
  { label: "Placement / Career",  keys: ["placement", "career", "guest-lecture", "seminar"] },
  { label: "Startup / Pitch",     keys: ["startup", "entrepreneurship"] },
  { label: "Gaming Tournament",   keys: ["gaming"] },
  { label: "Club Event",          keys: ["club"] },
  { label: "Other",               keys: ["other"] },
];

const HOST_TYPES = [
  "College", "Department", "Club",
  "IEEE", "CSI", "ISTE", "Google Developer Group",
  "Rotaract", "NSS", "NCC",
  "Community", "Startup", "Organization",
] as const;
type HostType = typeof HOST_TYPES[number];

function fieldsFor(cat: CategoryKey) {
  const base = { team: false, prize: false, tracks: false, kit: false, level: false, format: false, prerequisites: false };
  switch (cat) {
    case "sports":
    case "gaming":
      return { ...base, team: true, format: true, prize: true };
    case "hackathon":
      return { ...base, team: true, tracks: true, prize: true, prerequisites: true };
    case "coding":
      return { ...base, prize: true, format: true, prerequisites: true };
    case "workshop":
    case "bootcamp":
      return { ...base, kit: true, level: true, prerequisites: true };
    case "paper":
    case "project-expo":
      return { ...base, tracks: true, prize: true };
    case "cultural":
    case "music":
    case "dance":
    case "drama":
      return { ...base, team: true, prize: true, format: true };
    case "quiz":
    case "debate":
      return { ...base, team: true, format: true, prize: true };
    case "startup":
    case "entrepreneurship":
      return { ...base, prize: true, tracks: true };
    case "placement":
    case "career":
      return { ...base, prerequisites: true };
    default:
      return base;
  }
}

function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [hostType, setHostType] = useState<HostType>("College");
  const [poster, setPoster] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [saving, setSaving] = useState<null | EventStatus>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("free");
  const [upiQrFile, setUpiQrFile] = useState<File | null>(null);
  const [upiQrPreview, setUpiQrPreview] = useState<string | null>(null);


  const extra = useMemo(() => (category ? fieldsFor(category) : null), [category]);

  if (!user) return null;

  const pick = (k: CategoryKey) => { setCategory(k); setStep(2); };
  const back = () => { setStep(1); setCategory(null); };

  const buildPayload = (form: HTMLFormElement, status: EventStatus): NewEventInput => {
    const fd = new FormData(form);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const getNum = (k: string) => {
      const v = fd.get(k);
      if (v == null || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const rulesRaw = get("rules");
    return {
      title: get("title"),
      description: get("description"),
      category: (get("category") || category!) as CategoryKey,
      hostType,
      hostName: get("hostName"),
      collegeName: get("collegeName"),
      department: get("department") || undefined,
      organizerId: user.id,
      organizerName: user.name || user.email || "Organizer",
      contactPerson: get("contactPerson") || user.name || "",
      contactPhone: get("contactPhone"),
      contactEmail: get("contactEmail"),
      venue: get("venue"),
      city: get("city"),
      district: get("district"),
      date: get("date"),
      time: get("time"),
      registrationDeadline: get("registrationDeadline"),
      fee: getNum("fee") ?? 0,
      maxParticipants: getNum("maxParticipants") ?? 0,
      poster: undefined, // Storage upload wired next step
      gallery: [],
      rules: rulesRaw ? rulesRaw.split("\n").map((r) => r.trim()).filter(Boolean) : [],
      teamMin: getNum("teamMin"),
      teamMax: getNum("teamMax"),
      format: get("format") || undefined,
      tracks: get("tracks") || undefined,
      prize: getNum("prize"),
      level: get("level") || undefined,
      kit: get("kit") || undefined,
      prerequisites: get("prerequisites") || undefined,
      status,
      customFields: customFields.length ? customFields : undefined,
      paymentMode,
      upiId: get("upiId") || undefined,
      upiQrUrl: undefined, // Will be set during upload if file exists
      bankDetails: get("bankDetails") || undefined,
      externalPayUrl: get("externalPayUrl") || undefined,
      approvalMode: "auto",
      waitlistEnabled: false,
    };
  };


  const persist = async (form: HTMLFormElement, status: EventStatus) => {
    setSaving(status);
    try {
      const payload = buildPayload(form, status);
      if (!payload.title || !payload.date) {
        toast.error("Please fill the required fields.");
        return;
      }
      
      if (paymentMode === "upi" && upiQrFile) {
        toast.message("Uploading QR code...");
        payload.upiQrUrl = await uploadImage(upiQrFile, 'qrcodes');
      }

      const id = await createEvent(payload);
      toast.success(status === "published" ? "Event published!" : "Draft saved");
      navigate({ to: "/app/events/$id", params: { id } });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Could not save event. Check Firestore rules.");
    } finally {
      setSaving(null);
    }
  };

  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    persist(ev.currentTarget, "published");
  };
  const draft = (ev: React.MouseEvent<HTMLButtonElement>) => {
    const form = ev.currentTarget.closest("form") as HTMLFormElement | null;
    if (!form) return;
    persist(form, "draft");
  };

  const onPoster = (files: FileList | null) => {
    if (!files?.[0]) return;
    setPoster(URL.createObjectURL(files[0]));
    toast.message("Poster preview only — image upload wires to Firebase Storage in the next step.");
  };
  const onGallery = (files: FileList | null) => {
    if (!files) return;
    setGallery([...gallery, ...Array.from(files).map(f => URL.createObjectURL(f))].slice(0, 8));
  };

  // ---------- STEP 1 ----------
  if (step === 1) {
    return (
      <div className="space-y-6">
        <AppPageHeader
          eyebrow="Create"
          title="What are you publishing?"
          subtitle="Pick a type. Sprint tailors the form to only what your event needs."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHOOSER.map((g) => {
            const primary = CATEGORY_MAP[g.keys[0]];
            const Icon = primary.icon;
            return (
              <button
                key={g.label}
                onClick={() => pick(g.keys[0])}
                className="group flex items-start gap-4 rounded-3xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-neon hover:shadow-[0_0_0_1px_theme(colors.neon.DEFAULT/40%)]"
              >
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `${primary.accent}22`, color: primary.accent }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-xl uppercase leading-none">{g.label}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {g.keys.slice(0, 4).map((k) => (
                      <span key={k} className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {CATEGORY_MAP[k].label}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------- STEP 2 ----------
  const cat = CATEGORY_MAP[category!];
  const publishing = saving === "published";
  const drafting = saving === "draft";

  return (
    <div className="space-y-6">
      <button onClick={back} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-neon">
        <ArrowLeft className="h-3 w-3" /> Change type
      </button>

      <AppPageHeader
        eyebrow={`New · ${cat.label}`}
        title="Publish your event"
        subtitle="Only the fields your event actually needs."
        action={{ label: drafting ? "Saving…" : "Save draft", onClick: () => {}, icon: drafting ? Loader2 : Save }}
      />

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <AppPanel title="Basics">
            <div className="space-y-4">
              <Field label="Title" required>
                <input name="title" required className={inputCls} placeholder={`e.g. ${cat.label} 2026 — Flagship`} />
              </Field>
              <Field label="Description" required>
                <textarea name="description" required rows={5} className={inputCls} placeholder="What's happening? Who's it for? What will attendees do?" />
              </Field>
              <Field label="Category" required>
                <select name="category" required className={inputCls} value={category!} onChange={(e) => setCategory(e.target.value as CategoryKey)}>
                  {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </Field>
            </div>
          </AppPanel>

          <AppPanel title="Hosting organization">
            <div className="mb-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Hosted by</div>
              <div className="flex flex-wrap gap-1.5">
                {HOST_TYPES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHostType(h)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition",
                      hostType === h
                        ? "border-neon bg-neon text-neon-foreground"
                        : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {hostType === h && <Check className="mr-1 -mt-0.5 inline h-3 w-3" />}
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`${hostType} name`} required>
                <input name="hostName" required className={inputCls} placeholder={hostType === "College" ? "Select from your college" : `e.g. ${hostType} — Chapter Name`} />
              </Field>
              <Field label="Affiliated college" required>
                <input
                  name="collegeName"
                  required
                  className={inputCls}
                  list="sprint-college-suggestions"
                  placeholder="Type your college name"
                  defaultValue={COLLEGES.find((c) => c.id === user.collegeId)?.name ?? ""}
                />
                <datalist id="sprint-college-suggestions">
                  {COLLEGES.map((c) => <option key={c.id} value={c.name} />)}
                </datalist>
              </Field>

              {hostType === "Department" || hostType === "Club" ? (
                <Field label="Department"><input name="department" className={inputCls} placeholder="e.g. Computer Science" /></Field>
              ) : null}
              <Field label="Organizer contact person" required>
                <input name="contactPerson" required className={inputCls} defaultValue={user.name} />
              </Field>
            </div>
          </AppPanel>

          <AppPanel title="Where & when">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Venue" required><input name="venue" required className={inputCls} placeholder="e.g. Vivekananda Auditorium" /></Field>
              <Field label="City" required><input name="city" required className={inputCls} placeholder="e.g. Chennai" /></Field>
              <Field label="District" required><input name="district" required className={inputCls} placeholder="e.g. Chennai" /></Field>
              <Field label="Max participants" required><input name="maxParticipants" required type="number" min={1} className={inputCls} placeholder="e.g. 500" /></Field>
              <Field label="Event date" required><input name="date" required type="date" className={inputCls} /></Field>
              <Field label="Time" required><input name="time" required type="time" className={inputCls} /></Field>
              <Field label="Registration deadline" required><input name="registrationDeadline" required type="date" className={inputCls} /></Field>
              <Field label="Entry fee (₹)" required><input name="fee" required type="number" min={0} className={inputCls} placeholder="0 for free" /></Field>
            </div>
          </AppPanel>

          {extra && (extra.team || extra.tracks || extra.prize || extra.format || extra.kit || extra.level || extra.prerequisites) && (
            <AppPanel title={`${cat.label} specifics`}>
              <div className="grid gap-4 sm:grid-cols-2">
                {extra.team && (
                  <>
                    <Field label="Team size (min)"><input name="teamMin" type="number" min={1} className={inputCls} placeholder="1" /></Field>
                    <Field label="Team size (max)"><input name="teamMax" type="number" min={1} className={inputCls} placeholder="4" /></Field>
                  </>
                )}
                {extra.format && (
                  <Field label="Format">
                    <input name="format" className={inputCls} placeholder="e.g. Knockout · Best of 3 · Swiss" />
                  </Field>
                )}
                {extra.tracks && (
                  <Field label="Tracks / themes">
                    <input name="tracks" className={inputCls} placeholder="AI · FinTech · HealthTech · Open Innovation" />
                  </Field>
                )}
                {extra.prize && (
                  <Field label="Prize pool (₹)">
                    <input name="prize" type="number" min={0} className={inputCls} placeholder="e.g. 100000" />
                  </Field>
                )}
                {extra.level && (
                  <Field label="Level">
                    <select name="level" className={inputCls} defaultValue="All levels">
                      <option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                    </select>
                  </Field>
                )}
                {extra.kit && (
                  <Field label="Kit / materials provided">
                    <input name="kit" className={inputCls} placeholder="e.g. Arduino kit, sensors" />
                  </Field>
                )}
                {extra.prerequisites && (
                  <div className="sm:col-span-2">
                    <Field label="Prerequisites">
                      <textarea name="prerequisites" rows={3} className={inputCls} placeholder="What should attendees know or bring?" />
                    </Field>
                  </div>
                )}
              </div>
            </AppPanel>
          )}

          <AppPanel title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact phone" required><input name="contactPhone" required className={inputCls} placeholder="+91 …" /></Field>
              <Field label="Contact email" required><input name="contactEmail" required type="email" className={inputCls} placeholder="you@college.edu" /></Field>
            </div>
          </AppPanel>

          <AppPanel title="Rules">
            <textarea name="rules" rows={5} className={inputCls} placeholder={"One rule per line.\nRegistration closes 24 hours before the event.\nCollege ID mandatory."} />
          </AppPanel>

          <AppPanel title="Registration setup">
            <p className="mb-4 text-xs text-muted-foreground">Control how registrants pay, get approved, and what extra info you collect. This replaces your Google Form.</p>

            <div className="mb-5">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment method</div>
              <div className="flex flex-wrap gap-1.5">
                {(["free","upi","bank","external"] as PaymentMode[]).map((m) => (
                  <button key={m} type="button" onClick={() => setPaymentMode(m)} className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest",
                    paymentMode === m ? "border-neon bg-neon text-neon-foreground" : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
                  )}>{m === "free" ? "Free" : m === "upi" ? "UPI" : m === "bank" ? "Bank transfer" : "External link"}</button>
                ))}
              </div>
              {paymentMode === "upi" && (
                <div className="mt-3 space-y-4">
                  <Field label="UPI ID"><input name="upiId" className={inputCls} placeholder="yourname@upi" /></Field>
                  <Field label="College/Host QR Code (Upload Image)">
                    <label className={cn(inputCls, "flex cursor-pointer items-center justify-center gap-2 hover:border-neon", upiQrPreview && "border-neon text-neon")}>
                      <ImagePlus className="h-4 w-4" /> {upiQrPreview ? "QR Code selected" : "Upload QR Code Image"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUpiQrFile(file);
                          setUpiQrPreview(URL.createObjectURL(file));
                        }
                      }} />
                    </label>
                  </Field>
                  {upiQrPreview && (
                    <div className="mt-2 text-center">
                      <img src={upiQrPreview} alt="QR Preview" className="h-32 w-32 object-contain mx-auto rounded-lg border border-border p-1" />
                    </div>
                  )}
                </div>
              )}
              {paymentMode === "bank" && (
                <div className="mt-3"><Field label="Bank details (account · IFSC · name)"><textarea name="bankDetails" rows={2} className={inputCls} placeholder="A/C: 1234… · IFSC: HDFC0000 · Name: …" /></Field></div>
              )}
              {paymentMode === "external" && (
                <div className="mt-3"><Field label="External payment URL"><input name="externalPayUrl" type="url" className={inputCls} placeholder="https://razorpay.me/…" /></Field></div>
              )}
            </div>

            <div>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Custom questions</div>
              <CustomFieldsBuilder value={customFields} onChange={setCustomFields} />
            </div>
          </AppPanel>
        </div>


        <div className="space-y-6">
          <AppPanel title="Poster">
            <label className="block cursor-pointer overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2 hover:border-neon">
              {poster ? (
                <img src={poster} alt="Poster" className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
                  <ImagePlus className="h-6 w-6 text-neon" />
                  <div className="font-semibold uppercase tracking-widest">Upload poster</div>
                  <div className="text-xs">JPG or PNG · Recommended 3:4</div>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPoster(e.target.files)} />
            </label>
            <p className="mt-2 text-[10px] text-muted-foreground">Image upload will save to Firebase Storage in the next step.</p>
          </AppPanel>

          <AppPanel title="Gallery">
            <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-surface-2 p-3 text-sm text-muted-foreground hover:border-neon">
              <ImagePlus className="h-4 w-4 text-neon" /> Add photos ({gallery.length}/8)
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onGallery(e.target.files)} />
            </label>
            {gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {gallery.map((g, i) => <img key={i} src={g} alt="" className="aspect-square rounded-xl object-cover" />)}
              </div>
            )}
          </AppPanel>

          <button
            type="button"
            onClick={draft}
            disabled={saving !== null}
            className="w-full rounded-full border border-border bg-surface-2 px-6 py-3 text-sm font-bold uppercase tracking-widest text-foreground transition hover:border-neon disabled:opacity-50"
          >
            {drafting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Save as draft"}
          </button>

          <button
            type="submit"
            disabled={saving !== null}
            className="w-full rounded-full bg-neon px-6 py-4 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow disabled:opacity-60"
          >
            {publishing ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Publish event"}
          </button>
          <p className="text-center text-[11px] text-muted-foreground">
            You'll be able to edit or delete this event anytime from My Events.
          </p>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-neon";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label} {required && <span className="text-neon">*</span>}
      </div>
      {children}
    </label>
  );
}
