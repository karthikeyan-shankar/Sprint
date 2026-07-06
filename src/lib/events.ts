import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit as fbLimit,
  serverTimestamp,
  increment,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { getDb } from "./firebase";
import type { CategoryKey } from "./mock-data";

export type EventStatus = "draft" | "published" | "closed";

export type CustomFieldType = "short" | "long" | "single" | "multi";

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  options?: string[];
}

export type PaymentMode = "free" | "upi" | "bank" | "external";
export type ApprovalMode = "auto" | "manual";

export interface EventDoc {
  id: string;
  title: string;
  description: string;
  category: CategoryKey;
  hostType: string;
  hostName: string;
  collegeName: string;
  department?: string;
  organizerId: string;
  organizerName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  venue: string;
  city: string;
  district: string;
  date: string;
  time: string;
  registrationDeadline: string;
  fee: number;
  maxParticipants: number;
  poster?: string;
  gallery: string[];
  rules: string[];
  teamMin?: number;
  teamMax?: number;
  format?: string;
  tracks?: string;
  prize?: number;
  level?: string;
  kit?: string;
  prerequisites?: string;
  status: EventStatus;
  participants: number;
  // Host-controlled registration setup
  customFields?: CustomField[];
  paymentMode?: PaymentMode;
  upiId?: string;
  upiQrUrl?: string;
  bankDetails?: string;
  externalPayUrl?: string;
  approvalMode?: ApprovalMode;
  waitlistEnabled?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type NewEventInput = Omit<EventDoc, "id" | "createdAt" | "updatedAt" | "participants">;

export type RegStatus = "pending" | "approved" | "rejected";

export interface RegistrationDoc {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  collegeName: string;
  department: string;
  year: string;
  gender: "Male" | "Female" | "Other";
  teamName?: string;
  txnId?: string;
  paymentStatus: "Paid" | "Pending" | "Waived";
  status: RegStatus;
  notes?: string;
  answers?: Record<string, string>;
  paymentScreenshotUrl?: string;
  checkedIn?: boolean;
  checkedInAt?: Timestamp;
  createdAt?: Timestamp;
}


export type NewRegistrationInput = Omit<RegistrationDoc, "id" | "createdAt" | "status" | "paymentStatus"> & {
  paymentStatus?: RegistrationDoc["paymentStatus"];
};

const COL = "events";
const REGS = "registrations";

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = {};
  for (const k of Object.keys(obj)) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
}

export async function createEvent(input: NewEventInput): Promise<string> {
  const db = getDb();
  const payload = stripUndefined({
    ...input,
    participants: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const ref = await addDoc(collection(db, COL), payload);
  return ref.id;
}

export async function getEvent(id: string): Promise<EventDoc | null> {
  const snap = await getDoc(doc(getDb(), COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<EventDoc, "id">) };
}

export async function getEventsByIds(ids: string[]): Promise<EventDoc[]> {
  if (!ids.length) return [];
  const unique = Array.from(new Set(ids));
  const rows = await Promise.all(unique.map((id) => getEvent(id).catch(() => null)));
  return rows.filter((x): x is EventDoc => !!x);
}

async function runQuery(constraints: QueryConstraint[]): Promise<EventDoc[]> {
  const q = query(collection(getDb(), COL), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventDoc, "id">) }));
}

export async function listPublishedEvents(max = 60) {
  const rows = await runQuery([where("status", "==", "published"), fbLimit(max)]);
  return rows.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
}

export async function listMyEvents(organizerId: string) {
  const rows = await runQuery([where("organizerId", "==", organizerId)]);
  return rows.sort((a, b) => {
    const at = a.createdAt?.toMillis?.() ?? 0;
    const bt = b.createdAt?.toMillis?.() ?? 0;
    return bt - at;
  });
}

export async function updateEvent(id: string, patch: Partial<NewEventInput>) {
  await updateDoc(doc(getDb(), COL, id), stripUndefined({ ...patch, updatedAt: serverTimestamp() }));
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(getDb(), COL, id));
}

/* ---------------- Registrations ---------------- */

export async function createRegistration(input: NewRegistrationInput, opts?: { autoApprove?: boolean }): Promise<string> {
  const db = getDb();
  const payload = stripUndefined({
    ...input,
    status: (opts?.autoApprove ? "approved" : "pending") as RegStatus,
    paymentStatus: input.paymentStatus ?? "Pending",
    createdAt: serverTimestamp(),
  });
  const ref = await addDoc(collection(db, REGS), payload);
  try {
    await updateDoc(doc(db, COL, input.eventId), {
      participants: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("participant increment failed", err);
  }
  return ref.id;
}

export async function listRegistrationsForEvent(eventId: string): Promise<RegistrationDoc[]> {
  const q = query(collection(getDb(), REGS), where("eventId", "==", eventId));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RegistrationDoc, "id">) }));
  return rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function listRegistrationsForUser(userId: string): Promise<RegistrationDoc[]> {
  const q = query(collection(getDb(), REGS), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RegistrationDoc, "id">) }));
}

export async function updateRegistrationStatus(regId: string, status: RegStatus) {
  await updateDoc(doc(getDb(), REGS, regId), { status });
}

export async function bulkUpdateStatus(regIds: string[], status: RegStatus) {
  await Promise.all(regIds.map((id) => updateRegistrationStatus(id, status)));
}

export async function updateRegistration(regId: string, patch: Partial<Pick<RegistrationDoc, "notes" | "paymentStatus" | "checkedIn">>) {
  await updateDoc(doc(getDb(), REGS, regId), stripUndefined(patch));
}

export async function markCheckedIn(regId: string, checkedIn = true) {
  await updateDoc(doc(getDb(), REGS, regId), stripUndefined({
    checkedIn,
    checkedInAt: checkedIn ? serverTimestamp() : undefined,
  }));
}

