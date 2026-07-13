import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/site/Navbar";
import { useAuth } from "@/lib/auth";
import { Loader2, Trophy } from "lucide-react";
import {
  getQuestion,
  joinRoom,
  submitAnswer,
  updatePlayerScore,
  hasAnswered,
  onRoomChange,
  onPlayersChange,
  calcScore,
  type QuizRoom,
  type QuizQuestion,
  type QuizPlayer,
} from "@/lib/quiz";
import { QuestionCard } from "@/components/arena/QuestionCard";
import { BuzzerButton } from "@/components/arena/BuzzerButton";
import { Leaderboard } from "@/components/arena/Leaderboard";
import { updateRoom } from "@/lib/quiz";

export const Route = createFileRoute("/arena/play/$roomId")({
  component: PlayPage,
  head: () => ({
    meta: [{ title: "Play — Sprint Arena" }],
  }),
});

function PlayPage() {
  const { roomId } = Route.useParams();
  const { isAuthed, user, ready } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [players, setPlayers] = useState<QuizPlayer[]>([]);
  const [currentQ, setCurrentQ] = useState<QuizQuestion | null>(null);
  const [joined, setJoined] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerUid, setPlayerUid] = useState("");

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [answerStartTime, setAnswerStartTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scoreGained, setScoreGained] = useState<number | null>(null);

  // Real-time room listener
  useEffect(() => {
    const unsub = onRoomChange(roomId, (r) => {
      if (!r) return navigate({ to: "/arena" });
      setRoom(r);
      setLoading(false);
    });
    return unsub;
  }, [roomId, navigate]);

  // Real-time players
  useEffect(() => {
    return onPlayersChange(roomId, setPlayers);
  }, [roomId]);

  // Load question when it changes
  useEffect(() => {
    if (!room || room.currentQuestionIndex < 0) return;
    setSelectedIndex(null);
    setAnswered(false);
    setScoreGained(null);
    setAnswerStartTime(Date.now());

    getQuestion(roomId, room.currentQuestionIndex).then((q) => {
      setCurrentQ(q);
    });

    // Check if already answered
    if (playerUid) {
      hasAnswered(roomId, playerUid, room.currentQuestionIndex).then(setAnswered);
    }
  }, [room?.currentQuestionIndex, room?.status, roomId, playerUid]);

  // Timer
  useEffect(() => {
    if (!room || room.status !== "question" || !room.questionStartedAt || !currentQ) return;
    const tick = () => {
      const elapsed = (Date.now() - room.questionStartedAt!.toMillis()) / 1000;
      setTimeLeft(Math.max(0, currentQ.timeLimitSec - Math.floor(elapsed)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [room?.status, room?.questionStartedAt, currentQ]);

  // Join the room
  const handleJoin = useCallback(async () => {
    const name = isAuthed && user ? user.name : guestName.trim();
    const uid = isAuthed && user ? user.id : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    if (!name) return;

    await joinRoom(roomId, uid, name);
    setPlayerName(name);
    setPlayerUid(uid);
    setJoined(true);
  }, [roomId, isAuthed, user, guestName]);

  // Answer a question
  const handleAnswer = useCallback(async (index: number) => {
    if (!room || !currentQ || answered) return;

    setSelectedIndex(index);
    setAnswered(true);

    const timeMs = Date.now() - answerStartTime;
    const correct = index === currentQ.correctIndex;
    let newStreak = correct ? myStreak + 1 : 0;
    let gained = 0;

    if (correct) {
      gained = calcScore(timeMs, currentQ.timeLimitSec, myStreak);
      const newScore = myScore + gained;
      setMyScore(newScore);
      setMyStreak(newStreak);
      await updatePlayerScore(roomId, playerUid, newScore, newStreak);
    } else {
      setMyStreak(0);
      await updatePlayerScore(roomId, playerUid, myScore, 0);
    }

    setScoreGained(correct ? gained : 0);

    await submitAnswer(roomId, playerUid, room.currentQuestionIndex, index, correct, timeMs);
  }, [room, currentQ, answered, answerStartTime, myScore, myStreak, playerUid, roomId]);

  // Buzzer mode
  const handleBuzz = useCallback(async () => {
    if (!room || room.buzzerLockedBy) return;
    await updateRoom(roomId, { buzzerLockedBy: playerUid });
  }, [room, roomId, playerUid]);

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

  // Not joined yet — show name input
  if (!joined) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-md px-6 pt-20 text-center">
          <h1 className="mb-2 font-display text-3xl uppercase">{room.title}</h1>
          <p className="mb-8 text-sm text-muted-foreground">Hosted by {room.hostName}</p>

          <div className="glass rounded-2xl p-8">
            {isAuthed && user ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">Joining as</p>
                <p className="mb-6 text-lg font-bold">{user.name}</p>
                <button onClick={handleJoin} className="w-full rounded-full bg-neon py-3.5 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow">
                  Join Quiz
                </button>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">Enter your name to join</p>
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name"
                  className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm focus:border-neon focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
                <button onClick={handleJoin} disabled={!guestName.trim()} className="w-full rounded-full bg-neon py-3.5 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow disabled:opacity-40">
                  Join Quiz
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-4xl px-6 py-8">

        {/* Waiting in lobby */}
        {room.status === "lobby" && (
          <div className="pt-10 text-center">
            <div className="glass mx-auto max-w-md rounded-2xl p-10">
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-neon" />
              <h2 className="font-display text-2xl uppercase">You're in!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Waiting for <strong>{room.hostName}</strong> to start the quiz…
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                {players.length} player{players.length !== 1 ? "s" : ""} in lobby
              </p>
            </div>
          </div>
        )}

        {/* Active question */}
        {room.status === "question" && currentQ && (
          <div>
            {room.mode === "buzzer" && !room.buzzerLockedBy && !answered ? (
              <div className="pt-10">
                <h2 className="mb-6 text-center font-display text-2xl uppercase">{currentQ.text}</h2>
                <BuzzerButton
                  locked={false}
                  isMe={false}
                  onBuzz={handleBuzz}
                />
              </div>
            ) : room.mode === "buzzer" && room.buzzerLockedBy && room.buzzerLockedBy !== playerUid ? (
              <div className="pt-10 text-center">
                <BuzzerButton
                  locked
                  lockedByName={players.find((p) => p.uid === room.buzzerLockedBy)?.name}
                  isMe={false}
                  onBuzz={() => {}}
                />
              </div>
            ) : (
              <QuestionCard
                questionNumber={room.currentQuestionIndex + 1}
                totalQuestions={room.totalQuestions}
                text={currentQ.text}
                options={currentQ.options}
                timeLeft={timeLeft}
                timeLimitSec={currentQ.timeLimitSec}
                selectedIndex={selectedIndex}
                revealed={false}
                disabled={answered}
                onSelect={handleAnswer}
              />
            )}

            {answered && (
              <div className="mt-6 text-center">
                <div className="glass inline-block rounded-2xl px-8 py-4">
                  {scoreGained !== null && scoreGained > 0 ? (
                    <p className="text-lg font-black text-green-400">+{scoreGained} pts! 🔥</p>
                  ) : scoreGained === 0 ? (
                    <p className="text-lg font-black text-red-400">Wrong! Streak lost 💔</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Waiting for results…</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Total: {myScore.toLocaleString()} pts</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reveal */}
        {room.status === "reveal" && currentQ && (
          <div>
            <QuestionCard
              questionNumber={room.currentQuestionIndex + 1}
              totalQuestions={room.totalQuestions}
              text={currentQ.text}
              options={currentQ.options}
              timeLeft={0}
              timeLimitSec={currentQ.timeLimitSec}
              selectedIndex={selectedIndex}
              correctIndex={currentQ.correctIndex}
              revealed
              disabled
              onSelect={() => {}}
            />
            <div className="mt-8">
              <Leaderboard players={players} currentUid={playerUid} compact />
            </div>
          </div>
        )}

        {/* Finished */}
        {room.status === "finished" && (
          <div className="mx-auto max-w-2xl pt-10 text-center">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
            <h1 className="mb-2 font-display text-5xl uppercase">
              Game <span className="text-neon">Over!</span>
            </h1>
            <p className="mb-8 text-muted-foreground">Your final score: <strong className="text-foreground">{myScore.toLocaleString()} pts</strong></p>
            <Leaderboard players={players} currentUid={playerUid} />
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
