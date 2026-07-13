import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { Loader2, SkipForward, BarChart3 } from "lucide-react";
import {
  getQuestions,
  updateRoom,
  onRoomChange,
  onPlayersChange,
  onAnswersChange,
  type QuizRoom,
  type QuizQuestion,
  type QuizPlayer,
  type QuizAnswer,
} from "@/lib/quiz";
import { PlayerLobby } from "@/components/arena/PlayerLobby";
import { Leaderboard } from "@/components/arena/Leaderboard";
import { Timestamp } from "firebase/firestore";

export const Route = createFileRoute("/arena/host/$roomId")({
  component: HostPage,
  head: () => ({
    meta: [{ title: "Host Quiz — Sprint Arena" }],
  }),
});

function HostPage() {
  const { roomId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [players, setPlayers] = useState<QuizPlayer[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  // Load questions once
  useEffect(() => {
    getQuestions(roomId).then(setQuestions).finally(() => setLoading(false));
  }, [roomId]);

  // Real-time room listener
  useEffect(() => {
    const unsub = onRoomChange(roomId, (r) => {
      if (!r) return navigate({ to: "/arena" });
      setRoom(r);
    });
    return unsub;
  }, [roomId, navigate]);

  // Real-time players
  useEffect(() => {
    return onPlayersChange(roomId, setPlayers);
  }, [roomId]);

  // Real-time answers for current question
  useEffect(() => {
    if (!room || room.currentQuestionIndex < 0) return;
    return onAnswersChange(roomId, room.currentQuestionIndex, setAnswers);
  }, [roomId, room?.currentQuestionIndex]);

  // Timer countdown
  useEffect(() => {
    if (!room || room.status !== "question" || !room.questionStartedAt) return;
    const q = questions[room.currentQuestionIndex];
    if (!q) return;

    const tick = () => {
      const elapsed = (Date.now() - room.questionStartedAt!.toMillis()) / 1000;
      const left = Math.max(0, q.timeLimitSec - Math.floor(elapsed));
      setTimeLeft(left);
      if (left <= 0) {
        // Auto-reveal when time runs out
        updateRoom(roomId, { status: "reveal" });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [room?.status, room?.questionStartedAt, room?.currentQuestionIndex, questions, roomId]);

  const startQuiz = useCallback(async () => {
    await updateRoom(roomId, {
      status: "question",
      currentQuestionIndex: 0,
      questionStartedAt: Timestamp.now(),
      buzzerLockedBy: null,
    });
  }, [roomId]);

  const nextQuestion = useCallback(async () => {
    if (!room) return;
    const nextIdx = room.currentQuestionIndex + 1;
    if (nextIdx >= room.totalQuestions) {
      await updateRoom(roomId, { status: "finished" });
    } else {
      await updateRoom(roomId, {
        status: "question",
        currentQuestionIndex: nextIdx,
        questionStartedAt: Timestamp.now(),
        buzzerLockedBy: null,
      });
    }
  }, [room, roomId]);

  const revealAnswer = useCallback(async () => {
    await updateRoom(roomId, { status: "reveal" });
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-8 w-8 animate-spin text-neon" />
        </div>
      </div>
    );
  }

  if (!room) return null;

  const currentQ = room.currentQuestionIndex >= 0 ? questions[room.currentQuestionIndex] : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-6 py-8">

        {/* Lobby */}
        {room.status === "lobby" && (
          <PlayerLobby
            players={players}
            roomCode={room.roomCode}
            title={room.title}
            isHost
            onStart={startQuiz}
          />
        )}

        {/* Question / Reveal */}
        {(room.status === "question" || room.status === "reveal") && currentQ && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Question + Answers Count */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Q{room.currentQuestionIndex + 1} / {room.totalQuestions}
                </span>
                <span className="text-xs font-bold text-neon">
                  {room.status === "question" ? `⏱ ${timeLeft}s` : "✓ Revealed"}
                </span>
              </div>

              <div className="glass rounded-2xl p-8 text-center">
                <h2 className="font-display text-3xl uppercase">{currentQ.text}</h2>
              </div>

              {/* Options with answer counts */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {currentQ.options.map((opt, i) => {
                  const count = answers.filter((a) => a.selectedIndex === i).length;
                  const total = answers.length || 1;
                  const percent = Math.round((count / total) * 100);
                  const isCorrect = i === currentQ.correctIndex;

                  return (
                    <div
                      key={i}
                      className={`relative overflow-hidden rounded-xl border-2 px-5 py-4 text-sm font-semibold ${
                        room.status === "reveal" && isCorrect
                          ? "border-green-400 bg-green-500/20"
                          : "border-border bg-surface/60"
                      }`}
                    >
                      {room.status === "reveal" && (
                        <div
                          className={`absolute inset-y-0 left-0 ${isCorrect ? "bg-green-500/20" : "bg-surface-2"}`}
                          style={{ width: `${percent}%` }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-between">
                        <span>{opt}</span>
                        <span className="text-xs text-muted-foreground">
                          {room.status === "reveal" ? `${count} (${percent}%)` : `${count}`}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Host controls */}
              <div className="mt-6 flex items-center justify-center gap-3">
                {room.status === "question" && (
                  <button onClick={revealAnswer} className="flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-purple-500">
                    <BarChart3 className="h-4 w-4" /> Reveal Answer
                  </button>
                )}
                {room.status === "reveal" && (
                  <button onClick={nextQuestion} className="flex items-center gap-2 rounded-full bg-neon px-6 py-3 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow hover:brightness-110">
                    <SkipForward className="h-4 w-4" />
                    {room.currentQuestionIndex + 1 >= room.totalQuestions ? "Finish Quiz" : "Next Question"}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Leaderboard */}
            <div>
              <Leaderboard players={players} compact />
              <div className="mt-4 text-center text-xs text-muted-foreground">
                {answers.length} / {players.length} answered
              </div>
            </div>
          </div>
        )}

        {/* Finished */}
        {room.status === "finished" && (
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-6 font-display text-5xl uppercase">
              🏆 Quiz <span className="text-neon">Complete!</span>
            </h1>
            <Leaderboard players={players} />
            <button
              onClick={() => navigate({ to: "/arena" })}
              className="mt-8 rounded-full bg-neon px-8 py-3 text-sm font-bold uppercase tracking-widest text-neon-foreground"
            >
              Back to Arena
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
