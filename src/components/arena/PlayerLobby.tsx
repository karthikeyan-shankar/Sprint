import { Users } from "lucide-react";
import type { QuizPlayer } from "@/lib/quiz";

interface PlayerLobbyProps {
  players: QuizPlayer[];
  roomCode: string;
  title: string;
  isHost: boolean;
  onStart?: () => void;
}

export function PlayerLobby({ players, roomCode, title, isHost, onStart }: PlayerLobbyProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {/* Room code display */}
      <div className="glass mb-8 rounded-2xl p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Join at sprint-mauve.vercel.app/arena</p>
        <p className="mt-1 text-xs text-muted-foreground">Room Code</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          {roomCode.split("").map((ch, i) => (
            <span key={i} className="grid h-16 w-14 place-items-center rounded-xl border-2 border-neon/40 bg-neon/10 font-display text-4xl text-neon">
              {ch}
            </span>
          ))}
        </div>
        <h2 className="mt-5 font-display text-2xl uppercase">{title}</h2>
      </div>

      {/* Players grid */}
      <div className="mb-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span><strong className="text-foreground">{players.length}</strong> player{players.length !== 1 ? "s" : ""} in lobby</span>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {players.map((p) => (
          <div
            key={p.uid}
            className="animate-in fade-in slide-in-from-bottom-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-4 py-2 text-sm font-semibold backdrop-blur"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-neon text-[10px] font-black text-neon-foreground">
              {p.name.charAt(0).toUpperCase()}
            </span>
            {p.name}
          </div>
        ))}
        {players.length === 0 && (
          <p className="py-10 text-sm text-muted-foreground">Waiting for players to join…</p>
        )}
      </div>

      {/* Host start button */}
      {isHost && (
        <button
          onClick={onStart}
          disabled={players.length === 0}
          className="mt-10 rounded-full bg-neon px-10 py-4 text-sm font-bold uppercase tracking-widest text-neon-foreground neon-glow transition hover:brightness-110 disabled:opacity-40"
        >
          Start Quiz ({players.length} player{players.length !== 1 ? "s" : ""})
        </button>
      )}
    </div>
  );
}
