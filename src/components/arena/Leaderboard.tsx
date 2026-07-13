import { cn } from "@/lib/utils";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import type { QuizPlayer } from "@/lib/quiz";

interface LeaderboardProps {
  players: QuizPlayer[];
  currentUid?: string;
  compact?: boolean;
}

const RANK_ICONS = [Trophy, Medal, Award];
const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];

export function Leaderboard({ players, currentUid, compact }: LeaderboardProps) {
  if (!players.length) {
    return (
      <div className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
        No players yet — waiting for players to join…
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <Trophy className="h-4 w-4 text-neon" />
        <span className="text-xs font-bold uppercase tracking-widest text-neon">Leaderboard</span>
      </div>
      <ul className={cn("divide-y divide-border", compact && "max-h-64 overflow-y-auto")}>
        {players.map((p, i) => {
          const RankIcon = RANK_ICONS[i] ?? TrendingUp;
          const rankColor = RANK_COLORS[i] ?? "text-muted-foreground";
          const isMe = p.uid === currentUid;

          return (
            <li
              key={p.uid}
              className={cn(
                "flex items-center gap-3 px-5 py-3 transition",
                isMe && "bg-neon/5",
                i === 0 && "bg-yellow-500/5",
              )}
            >
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-black", i < 3 ? rankColor : "text-muted-foreground")}>
                {i < 3 ? <RankIcon className="h-4 w-4" /> : i + 1}
              </span>
              <span className={cn("flex-1 text-sm font-semibold truncate", isMe && "text-neon")}>
                {p.name} {isMe && <span className="text-[10px] font-normal uppercase tracking-widest text-muted-foreground ml-1">(You)</span>}
              </span>
              {p.streak >= 3 && (
                <span className="text-[10px] font-bold text-orange-400">🔥{p.streak}</span>
              )}
              <span className="text-sm font-black tabular-nums">{p.score.toLocaleString()}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
