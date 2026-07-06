import {
  Trophy, Presentation, Cpu, Palette, Code2, Wrench, Mic2, GraduationCap,
  Music2, Camera, Users2, Rocket, Briefcase, Lightbulb, FileText, Gamepad2,
  Drama, HelpCircle, MessageSquare, Sparkles, ClipboardList, Landmark,
  Layers, Star,
} from "lucide-react";

export type CategoryKey =
  | "sports" | "symposium" | "technical" | "non-technical" | "hackathon"
  | "workshop" | "seminar" | "guest-lecture" | "cultural" | "festival"
  | "club" | "competition" | "conference" | "bootcamp" | "placement"
  | "career" | "entrepreneurship" | "innovation" | "paper" | "project-expo"
  | "coding" | "gaming" | "photography" | "dance" | "music" | "drama"
  | "quiz" | "debate" | "poster" | "startup" | "other";

export interface Category {
  key: CategoryKey;
  label: string;
  icon: any;
  accent: string; // hex-ish tone
}

export const CATEGORIES: Category[] = [
  { key: "sports",           label: "Sports",             icon: Trophy,          accent: "#D4FF3A" },
  { key: "symposium",        label: "Symposium",          icon: Presentation,    accent: "#8CE0FF" },
  { key: "technical",        label: "Technical",          icon: Cpu,             accent: "#B4FF7A" },
  { key: "non-technical",    label: "Non Technical",      icon: Palette,         accent: "#FFB380" },
  { key: "hackathon",        label: "Hackathon",          icon: Code2,           accent: "#FF4D8B" },
  { key: "workshop",         label: "Workshop",           icon: Wrench,          accent: "#C4B5FD" },
  { key: "seminar",          label: "Seminar",            icon: Mic2,            accent: "#FDE68A" },
  { key: "guest-lecture",    label: "Guest Lecture",      icon: GraduationCap,   accent: "#A7F3D0" },
  { key: "cultural",         label: "Cultural",           icon: Music2,          accent: "#F0ABFC" },
  { key: "festival",         label: "Festival",           icon: Sparkles,        accent: "#FCA5A5" },
  { key: "club",             label: "Club Activity",      icon: Users2,          accent: "#93C5FD" },
  { key: "competition",      label: "Competition",        icon: Trophy,          accent: "#FDBA74" },
  { key: "conference",       label: "Conference",         icon: Landmark,        accent: "#67E8F9" },
  { key: "bootcamp",         label: "Bootcamp",           icon: Rocket,          accent: "#FCD34D" },
  { key: "placement",        label: "Placement Drive",    icon: Briefcase,       accent: "#86EFAC" },
  { key: "career",           label: "Career Event",       icon: Briefcase,       accent: "#5EEAD4" },
  { key: "entrepreneurship", label: "Entrepreneurship",   icon: Lightbulb,       accent: "#FCA5A5" },
  { key: "innovation",       label: "Innovation",         icon: Lightbulb,       accent: "#D4FF3A" },
  { key: "paper",            label: "Paper Presentation", icon: FileText,        accent: "#C4B5FD" },
  { key: "project-expo",     label: "Project Expo",       icon: Layers,          accent: "#F0ABFC" },
  { key: "coding",           label: "Coding Contest",     icon: Code2,           accent: "#B4FF7A" },
  { key: "gaming",           label: "Gaming",             icon: Gamepad2,        accent: "#FF4D8B" },
  { key: "photography",      label: "Photography",        icon: Camera,          accent: "#FDE68A" },
  { key: "dance",            label: "Dance",              icon: Music2,          accent: "#F0ABFC" },
  { key: "music",            label: "Music",              icon: Music2,          accent: "#93C5FD" },
  { key: "drama",            label: "Drama",              icon: Drama,           accent: "#FCA5A5" },
  { key: "quiz",             label: "Quiz",               icon: HelpCircle,      accent: "#FDBA74" },
  { key: "debate",           label: "Debate",             icon: MessageSquare,   accent: "#67E8F9" },
  { key: "poster",           label: "Poster Presentation",icon: ClipboardList,   accent: "#A7F3D0" },
  { key: "startup",          label: "Startup",            icon: Rocket,          accent: "#D4FF3A" },
  { key: "other",            label: "Other",              icon: Star,            accent: "#94A3B8" },
];

export const CATEGORY_MAP: Record<CategoryKey, Category> =
  Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as any;

const gradient = (from: string, mid: string) =>
  `linear-gradient(135deg, ${from} 0%, ${mid} 55%, oklch(0.12 0.01 240) 100%)`;

export const BANNERS = [
  gradient("oklch(0.94 0.22 118)", "oklch(0.35 0.12 145)"),
  gradient("oklch(0.55 0.22 30)",  "oklch(0.2 0.05 20)"),
  gradient("oklch(0.55 0.2 260)",  "oklch(0.18 0.04 260)"),
  gradient("oklch(0.7 0.16 200)",  "oklch(0.2 0.04 220)"),
  gradient("oklch(0.55 0.22 340)", "oklch(0.16 0.04 300)"),
  gradient("oklch(0.75 0.15 90)",  "oklch(0.2 0.04 60)"),
  gradient("oklch(0.6 0.2 145)",   "oklch(0.15 0.03 200)"),
  gradient("oklch(0.65 0.2 15)",   "oklch(0.18 0.04 340)"),
];

export interface College {
  id: string;
  name: string;
  short: string;
  city: string;
  district: string;
  state: string;
  about: string;
  website: string;
  logoColor: string;
  cover: string;
  followers: number;
  eventCount: number;
}

// Sprint is in Early Access. No colleges are seeded — real listings arrive
// as colleges onboard. UI must render empty states, not fake data.
export const COLLEGES: College[] = [];


export type EventStatus = "Upcoming" | "Registration Open" | "Registration Closed" | "Live" | "Completed" | "Draft";

export interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  category: CategoryKey;
  collegeId: string;
  department?: string;
  organizer: string;
  venue: string;
  city: string;
  district: string;
  date: string;
  endDate?: string;
  time: string;
  registrationDeadline: string;
  fee: number;
  maxParticipants: number;
  participants: number;
  rules: string[];
  contactPhone: string;
  contactEmail: string;
  banner: string;
  gallery: string[];
  status: EventStatus;
  featured?: boolean;
  trending?: boolean;
}

// Early Access: no seeded events. Once colleges publish real events they
// appear here (or, later, from Firebase). Screens must show empty states.
export const EVENTS: CollegeEvent[] = [];




// ---------- Auth-mocked current user ----------
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo: string;
  collegeId: string;
  department: string;
  year: string;
  bio: string;
  createdEventIds: string[];
  joinedEventIds: string[];
  bookmarkedEventIds: string[];
  followedCollegeIds: string[];
}

export const DEFAULT_USER: UserProfile = {
  id: "u1",
  name: "",
  email: "",
  photo: "",
  collegeId: "",
  department: "",
  year: "",
  bio: "",
  createdEventIds: [],
  joinedEventIds: [],
  bookmarkedEventIds: [],
  followedCollegeIds: [],
};

// ---------- Notifications ----------
export interface Notification {
  id: string;
  type: "success" | "reminder" | "update" | "closed" | "announcement";
  title: string;
  body: string;
  time: string;
}
export const NOTIFICATIONS: Notification[] = [];


// ---------- Helpers ----------
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
export function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
export function collegeById(id: string) {
  return COLLEGES.find((c) => c.id === id);
}
export function eventById(id: string) {
  return EVENTS.find((e) => e.id === id);
}
export function eventsByCollege(id: string) {
  return EVENTS.filter((e) => e.collegeId === id);
}
export function isUpcoming(iso: string) {
  return new Date(iso).getTime() >= Date.now();
}

// ---------- Mock registrations (per event) ----------
export type RegStatus = "pending" | "approved" | "rejected";
export interface Registration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  collegeId: string;
  department: string;
  year: string;
  gender: "Male" | "Female" | "Other";
  teamName?: string;
  txnId: string;
  paymentStatus: "Paid" | "Pending" | "Waived";
  status: RegStatus;
  registeredAt: string;
  notes?: string;
}

const REG_NAMES = [
  ["Priya", "Ramesh"], ["Karthik", "Muthu"], ["Anjali", "Kumar"], ["Rohan", "Pillai"],
  ["Ishaan", "Verma"], ["Meera", "Iyer"], ["Vikram", "Das"], ["Debjani", "Ghosh"],
  ["Neel", "Krishna"], ["Yash", "Shah"], ["Ananya", "Reddy"], ["Kabir", "Menon"],
  ["Tara", "Nair"], ["Aarav", "Bansal"], ["Diya", "Chowdhury"], ["Aditya", "Rao"],
  ["Sneha", "Balaji"], ["Manish", "Prasad"], ["Kavya", "Suresh"], ["Rahul", "Joshi"],
];
const DEPTS = ["Computer Science", "Information Tech", "Electronics", "Mechanical", "Civil", "AI & DS", "Biotech", "Chemical"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

function hashInt(str: string, mod: number) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % mod;
}

export function registrationsForEvent(eventId: string): Registration[] {
  const e = EVENTS.find(x => x.id === eventId);
  if (!e) return [];
  const total = Math.min(e.participants, 24);
  const list: Registration[] = [];
  for (let i = 0; i < total; i++) {
    const [first, last] = REG_NAMES[(hashInt(eventId + i, REG_NAMES.length))];
    const collegeIdx = hashInt(eventId + "c" + i, COLLEGES.length);
    const c = COLLEGES[collegeIdx];
    const genderPick = (["Male", "Female", "Other"] as const)[hashInt(eventId + "g" + i, 3)];
    const statusPick: RegStatus = i < Math.max(2, Math.floor(total * 0.15))
      ? "pending"
      : i > total - 3
        ? "rejected"
        : "approved";
    const payPick = e.fee === 0
      ? "Waived"
      : statusPick === "approved" ? "Paid" : statusPick === "pending" ? "Pending" : "Paid";
    list.push({
      id: `${eventId}-r${i}`,
      eventId,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@student.${c.website}`,
      phone: `+91 9${(700000000 + hashInt(eventId + i, 99999999)).toString().slice(0,9)}`,
      collegeId: c.id,
      department: DEPTS[hashInt(eventId + "d" + i, DEPTS.length)],
      year: YEARS[hashInt(eventId + "y" + i, YEARS.length)],
      gender: genderPick,
      teamName: i % 4 === 0 ? `Team ${["Blaze","Nova","Titan","Vortex","Zenith"][hashInt(eventId + "t" + i, 5)]}` : undefined,
      txnId: e.fee === 0 ? "-" : `TXN${(1000000 + hashInt(eventId + "x" + i, 9000000)).toString()}`,
      paymentStatus: payPick,
      status: statusPick,
      registeredAt: new Date(Date.now() - hashInt(eventId + "at" + i, 1000000) * 60_000).toISOString(),
    });
  }
  return list;
}

// ---------- Hosting organizations available in the publish form ----------
export const HOSTING_ORGS = [
  "College", "Department", "Club", "Association", "IEEE", "CSI", "ISTE",
  "Google Developer Group", "Rotaract", "NSS", "NCC", "Startup Community", "Organization",
];

