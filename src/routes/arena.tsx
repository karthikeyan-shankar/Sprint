import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Plus, ArrowRight, Gamepad2, Brain, Trophy, Users, Timer } from "lucide-react";
import { Navbar, Footer } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { createRoom, getRoomByCode, type QuizMode, type QuizQuestion } from "@/lib/quiz";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arena")({
  component: ArenaPage,
  head: () => ({
    meta: [
      { title: "Arena — Sprint" },
      { name: "description", content: "Host or join live quiz battles. Classic mode, buzzer mode, real-time leaderboards." },
    ],
  }),
});

function ArenaPage() {
  const [tab, setTab] = useState<"join" | "create">("join");

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-8">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-purple-400">
            <Zap className="h-3 w-3" /> Live Quiz Arena
          </div>
          <h1 className="font-display text-5xl uppercase sm:text-7xl">
            Learn. <span className="text-purple-400">Compete.</span> Win.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Host live quiz battles for your class, club, or campus. Students join with a room code on their phones. Real-time leaderboards. Two modes: Classic & Buzzer.
          </p>
        </div>
      </section>

      {/* Feature pills */}
      <section className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3 px-6 pb-10">
        {[
          { icon: Gamepad2, label: "Classic & Buzzer modes" },
          { icon: Users, label: "Up to 50 players" },
          { icon: Timer, label: "Timed questions" },
          { icon: Trophy, label: "Live leaderboard" },
        ].map((f) => (
          <div key={f.label} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-xs font-semibold backdrop-blur">
            <f.icon className="h-3.5 w-3.5 text-purple-400" /> {f.label}
          </div>
        ))}
      </section>

      {/* Tab toggle */}
      <section className="mx-auto max-w-lg px-6 pb-16">
        <div className="mb-6 flex rounded-full border border-border bg-surface/60 p-1">
          {(["join", "create"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-full py-2.5 text-sm font-bold uppercase tracking-wider transition",
                tab === t ? "bg-neon text-neon-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "join" ? "Join Quiz" : "Host Quiz"}
            </button>
          ))}
        </div>

        {tab === "join" ? <JoinForm /> : <CreateForm />}
      </section>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Join a quiz                                                        */
/* ------------------------------------------------------------------ */

function JoinForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async () => {
    setError("");
    const trimmed = code.replace(/\s/g, "");
    if (trimmed.length !== 6) {
      setError("Enter a 6-digit room code");
      return;
    }
    setLoading(true);
    try {
      const room = await getRoomByCode(trimmed);
      if (!room) {
        setError("Room not found. Check the code and try again.");
        return;
      }
      if (room.status === "finished") {
        setError("This quiz has already ended.");
        return;
      }
      navigate({ to: "/arena/play/$roomId", params: { roomId: room.id } });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <h3 className="mb-1 font-display text-lg uppercase">Enter Room Code</h3>
      <p className="mb-6 text-xs text-muted-foreground">Get the 6-digit code from your host</p>

      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            value={code[i] ?? ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              const newCode = code.split("");
              newCode[i] = val;
              setCode(newCode.join(""));
              if (val && e.target.nextElementSibling) {
                (e.target.nextElementSibling as HTMLInputElement).focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !code[i] && e.target instanceof HTMLInputElement && e.target.previousElementSibling) {
                (e.target.previousElementSibling as HTMLInputElement).focus();
              }
            }}
            className="h-14 w-full rounded-xl border-2 border-border bg-surface text-center font-display text-2xl focus:border-neon focus:outline-none"
          />
        ))}
      </div>

      {error && <p className="mt-3 text-xs font-semibold text-red-400">{error}</p>}

      <button onClick={handleJoin} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-neon py-3.5 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow disabled:opacity-60">
        {loading ? "Joining…" : <><ArrowRight className="h-4 w-4" /> Join Quiz</>}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Create a quiz                                                      */
/* ------------------------------------------------------------------ */

interface QDraft {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
}

const emptyQ = (): QDraft => ({ text: "", options: ["", "", "", ""], correctIndex: 0, timeLimitSec: 20 });

function CreateForm() {
  const { isAuthed, user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<QuizMode>("classic");
  const [questions, setQuestions] = useState<QDraft[]>([emptyQ()]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthed) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <Brain className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 font-display text-lg uppercase">Sign in to host</h3>
        <p className="mt-1 text-xs text-muted-foreground">You need an account to create quiz rooms.</p>
        <a href="/login" className="mt-6 inline-block rounded-full bg-neon px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-neon-foreground">Sign in</a>
      </div>
    );
  }

  const updateQ = (i: number, patch: Partial<QDraft>) => {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  };

  const updateOption = (qi: number, oi: number, val: string) => {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? val : o)) } : q,
      ),
    );
  };

  const handleCreate = async () => {
    setError("");
    if (!title.trim()) { setError("Give your quiz a title"); return; }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) { setError(`Question ${i + 1} is empty`); return; }
      if (q.options.some((o) => !o.trim())) { setError(`Fill all options for Q${i + 1}`); return; }
    }

    setCreating(true);
    try {
      const { roomId } = await createRoom(
        user!.id,
        user!.name,
        title.trim(),
        mode,
        questions.map((q, i) => ({
          text: q.text.trim(),
          options: q.options.map((o) => o.trim()),
          correctIndex: q.correctIndex,
          timeLimitSec: q.timeLimitSec,
          order: i,
        })),
      );
      navigate({ to: "/arena/host/$roomId", params: { roomId } });
    } catch (err) {
      setError("Failed to create room. Try again.");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      <h3 className="mb-4 font-display text-lg uppercase">Create Quiz Room</h3>

      {/* Title */}
      <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Quiz Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. DSA Round 1, GK Challenge"
        className="mb-5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:border-neon focus:outline-none"
      />

      {/* Mode */}
      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Mode</label>
      <div className="mb-6 flex gap-2">
        {(["classic", "buzzer"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold uppercase transition",
              mode === m ? "border-neon bg-neon/10 text-neon" : "border-border text-muted-foreground hover:border-neon/40",
            )}
          >
            {m === "classic" ? "🎓 Classic" : "🔴 Buzzer"}
          </button>
        ))}
      </div>

      {/* Questions */}
      <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Questions ({questions.length})</label>
      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-xl border border-border bg-surface/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Q{qi + 1}</span>
              {questions.length > 1 && (
                <button onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              )}
            </div>
            <input
              value={q.text}
              onChange={(e) => updateQ(qi, { text: e.target.value })}
              placeholder="Type your question…"
              className="mb-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-neon focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    onClick={() => updateQ(qi, { correctIndex: oi })}
                    className={cn(
                      "h-5 w-5 shrink-0 rounded-full border-2 transition",
                      q.correctIndex === oi ? "border-green-400 bg-green-400" : "border-border",
                    )}
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs focus:border-neon focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Timer:</label>
              <select
                value={q.timeLimitSec}
                onChange={(e) => updateQ(qi, { timeLimitSec: Number(e.target.value) })}
                className="rounded-lg border border-border bg-surface px-2 py-1 text-xs focus:outline-none"
              >
                {[10, 15, 20, 30, 45, 60].map((s) => (
                  <option key={s} value={s}>{s}s</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setQuestions((qs) => [...qs, emptyQ()])}
        className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neon hover:text-neon/80"
      >
        <Plus className="h-3.5 w-3.5" /> Add question
      </button>

      {error && <p className="mt-4 text-xs font-semibold text-red-400">{error}</p>}

      <button onClick={handleCreate} disabled={creating} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-neon py-3.5 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow disabled:opacity-60">
        {creating ? "Creating…" : <><Zap className="h-4 w-4" /> Create Room</>}
      </button>
    </div>
  );
}
