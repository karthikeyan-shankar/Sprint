import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar, Footer } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { emailSignIn, emailSignUp, googleSignIn, resetPassword } from "@/lib/firebase";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign in — Sprint" }] }),
});

function Login() {
  const { isAuthed, ready } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | "email" | "google">(null);

  useEffect(() => {
    if (ready && isAuthed) navigate({ to: "/app" });
  }, [ready, isAuthed, navigate]);

  const humanize = (e: unknown) => {
    const code = (e as any)?.code as string | undefined;
    const map: Record<string, string> = {
      "auth/invalid-credential": "Incorrect email or password.",
      "auth/invalid-email": "That email doesn't look right.",
      "auth/user-not-found": "No account with that email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "An account already exists for that email.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/popup-closed-by-user": "Sign-in popup was closed.",
      "auth/popup-blocked": "Popup blocked by the browser. Allow popups and retry.",
      "auth/unauthorized-domain": "This domain isn't authorized in Firebase → Auth → Settings.",
      "auth/operation-not-allowed": "Enable the provider in Firebase → Authentication → Sign-in method.",
    };
    return (code && map[code]) || (e as any)?.message || "Something went wrong.";
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setBusy("email");
    try {
      if (mode === "signup") await emailSignUp(name, email, password);
      else await emailSignIn(email, password);
      toast.success(mode === "signup" ? "Account created" : "Welcome back");
      navigate({ to: "/app" });
    } catch (e) {
      toast.error(humanize(e));
    } finally {
      setBusy(null);
    }
  };

  const google = async () => {
    setBusy("google");
    try {
      await googleSignIn();
      toast.success("Signed in with Google");
      navigate({ to: "/app" });
    } catch (e) {
      toast.error(humanize(e));
    } finally {
      setBusy(null);
    }
  };

  const forgot = async () => {
    if (!email) { toast.error("Enter your email first"); return; }
    try {
      await resetPassword(email);
      toast.success("Password reset email sent");
    } catch (e) { toast.error(humanize(e)); }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2">
        <div>
          <Logo size="md" />
          <div className="mt-8 text-xs font-bold uppercase tracking-widest text-neon">{mode === "signin" ? "Sign in" : "Create account"}</div>
          <h1 className="mt-2 font-display text-5xl uppercase leading-none md:text-7xl">
            {mode === "signin" ? <>Welcome <span className="text-neon">back.</span></> : <>Join <span className="text-neon">Sprint.</span></>}
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            One platform for every college event. Sign in to register, save events, and publish your own.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
            <li>• Sign in with Google in one tap.</li>
            <li>• Or use email and password.</li>
            <li>• Any authenticated user can host an event.</li>
          </ul>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-8">
          <div className="mb-6 inline-flex rounded-full border border-border p-1 text-xs font-bold uppercase tracking-widest">
            <button type="button" onClick={() => setMode("signin")} className={"rounded-full px-4 py-1.5 " + (mode === "signin" ? "bg-neon text-neon-foreground" : "text-muted-foreground")}>Sign in</button>
            <button type="button" onClick={() => setMode("signup")} className={"rounded-full px-4 py-1.5 " + (mode === "signup" ? "bg-neon text-neon-foreground" : "text-muted-foreground")}>Create</button>
          </div>

          <button
            type="button"
            onClick={google}
            disabled={!!busy}
            className="mb-5 inline-flex w-full items-center justify-center gap-3 rounded-full border border-border bg-surface-2 px-6 py-3 text-sm font-semibold transition hover:bg-surface hover:text-foreground disabled:opacity-60"
          >
            {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          {mode === "signup" && (
            <Field label="Full name">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Priya R"
                className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-neon" />
            </Field>
          )}
          <Field label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@student.college.edu"
                className="w-full rounded-xl border border-border bg-surface-2 px-10 py-3 text-sm outline-none focus:border-neon" />
            </div>
          </Field>
          <Field label="Password">
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none focus:border-neon" />
          </Field>

          {mode === "signin" && (
            <button type="button" onClick={forgot} className="mb-2 text-xs text-muted-foreground hover:text-foreground">
              Forgot password?
            </button>
          )}

          <button type="submit" disabled={!!busy} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-neon px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow disabled:opacity-70">
            {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" /></>}
          </button>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/explore" className="hover:text-foreground">Continue browsing as a guest →</Link>
          </div>
        </form>
      </section>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.9 29.2 5 24 5 16.3 5 9.7 9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.3-5.2l-6.1-5.2C29 35 26.6 36 24 36c-5.3 0-9.7-3.5-11.3-8.3l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.1 5.2c-.4.4 6.8-4.9 6.8-14.9 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
