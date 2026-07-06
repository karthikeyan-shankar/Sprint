import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sun, Moon, Bell, Lock, Globe, User } from "lucide-react";
import { toast } from "sonner";
import { AppPageHeader, AppPanel } from "./app";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

type Section = "profile" | "appearance" | "notifications" | "privacy" | "language";

const SECTIONS: { key: Section; label: string; icon: any }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "appearance", label: "Appearance", icon: Sun },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "privacy", label: "Privacy", icon: Lock },
  { key: "language", label: "Language", icon: Globe },
];

function SettingsPage() {
  const { user } = useAuth();
  const [section, setSection] = useState<Section>("profile");
  if (!user) return null;

  return (
    <div className="space-y-6">
      <AppPageHeader eyebrow="Settings" title="Preferences" subtitle="Customize your Sprint experience." />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:gap-0 lg:rounded-3xl lg:border lg:border-border lg:bg-card lg:p-2">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.key} onClick={() => setSection(s.key)} className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition lg:w-full",
                section === s.key ? "bg-neon text-neon-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              )}>
                <Icon className="h-4 w-4" /> {s.label}
              </button>
            );
          })}
        </aside>

        <div>
          {section === "profile" && <ProfileSection />}
          {section === "appearance" && <AppearanceSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "privacy" && <PrivacySection />}
          {section === "language" && <LanguageSection />}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-neon";

function ProfileSection() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const save = () => { updateProfile({ name, email }); toast.success("Profile saved"); };
  return (
    <AppPanel title="Profile">
      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full name</span><input className={inputCls} value={name} onChange={e => setName(e.target.value)} /></label>
        <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</span><input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} /></label>
      </div>
      <button onClick={save} className="mt-6 rounded-full bg-neon px-5 py-2.5 text-xs font-bold uppercase text-neon-foreground">Save changes</button>
    </AppPanel>
  );
}

function AppearanceSection() {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  return (
    <AppPanel title="Appearance">
      <p className="mb-4 text-sm text-muted-foreground">Choose how Sprint looks for you.</p>
      <div className="flex flex-wrap gap-3">
        {(["dark", "light", "system"] as const).map(t => (
          <button key={t} onClick={() => { setTheme(t); toast.success(`Theme: ${t} (mock)`); }} className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold uppercase",
            theme === t ? "border-neon bg-neon/20 text-neon" : "border-border text-muted-foreground hover:text-foreground"
          )}>
            {t === "dark" && <Moon className="h-4 w-4" />}
            {t === "light" && <Sun className="h-4 w-4" />}
            {t === "system" && "⚙️"}
            {t}
          </button>
        ))}
      </div>
    </AppPanel>
  );
}

function NotificationsSection() {
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(false);
  return (
    <AppPanel title="Notifications">
      <ul className="space-y-4 max-w-md">
        <Toggle label="Email notifications" description="Receive updates via email." checked={email} onChange={setEmail} />
        <Toggle label="Push notifications" description="Browser push alerts." checked={push} onChange={setPush} />
      </ul>
    </AppPanel>
  );
}

function PrivacySection() {
  const [showEmail, setShowEmail] = useState(false);
  return (
    <AppPanel title="Privacy">
      <ul className="space-y-4 max-w-md">
        <Toggle label="Show email on profile" description="Others can see your contact email." checked={showEmail} onChange={setShowEmail} />
      </ul>
    </AppPanel>
  );
}

function LanguageSection() {
  const [lang, setLang] = useState("en");
  return (
    <AppPanel title="Language">
      <label className="block max-w-xs">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preferred language</span>
        <select className={inputCls} value={lang} onChange={e => { setLang(e.target.value); toast.success(`Language changed (mock)`); }}>
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
          <option value="hi">हिन्दी</option>
        </select>
      </label>
    </AppPanel>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <li className="flex items-center justify-between gap-4">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button onClick={() => onChange(!checked)} className={cn(
        "h-6 w-11 shrink-0 rounded-full p-0.5 transition",
        checked ? "bg-neon" : "bg-surface-2"
      )}>
        <span className={cn("block h-5 w-5 rounded-full bg-white transition-transform", checked && "translate-x-5")} />
      </button>
    </li>
  );
}
