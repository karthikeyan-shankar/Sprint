import { cn } from "@/lib/utils";
import { Timer, CheckCircle2, XCircle } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  text: string;
  options: string[];
  timeLeft: number;
  timeLimitSec: number;
  selectedIndex: number | null;
  correctIndex?: number | null;
  revealed: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
}

const OPTION_COLORS = [
  { bg: "bg-red-500/20 border-red-500/40 hover:bg-red-500/30", active: "bg-red-500 border-red-500 text-white" },
  { bg: "bg-blue-500/20 border-blue-500/40 hover:bg-blue-500/30", active: "bg-blue-500 border-blue-500 text-white" },
  { bg: "bg-yellow-500/20 border-yellow-500/40 hover:bg-yellow-500/30", active: "bg-yellow-500 border-yellow-500 text-white" },
  { bg: "bg-green-500/20 border-green-500/40 hover:bg-green-500/30", active: "bg-green-500 border-green-500 text-white" },
];

const OPTION_SHAPES = ["◆", "●", "▲", "■"];

export function QuestionCard({
  questionNumber,
  totalQuestions,
  text,
  options,
  timeLeft,
  timeLimitSec,
  selectedIndex,
  correctIndex,
  revealed,
  disabled,
  onSelect,
}: QuestionCardProps) {
  const timerPercent = timeLimitSec > 0 ? (timeLeft / timeLimitSec) * 100 : 100;
  const urgent = timeLeft <= 5;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Timer bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className={cn("flex items-center gap-1.5 text-sm font-bold", urgent ? "text-red-400 animate-pulse" : "text-neon")}>
          <Timer className="h-4 w-4" />
          {timeLeft}s
        </div>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear", urgent ? "bg-red-500" : "bg-neon")}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {questionNumber}/{totalQuestions}
        </span>
      </div>

      {/* Question */}
      <div className="glass mb-8 rounded-2xl p-6 text-center sm:p-10">
        <h2 className="font-display text-2xl uppercase leading-tight sm:text-3xl">{text}</h2>
      </div>

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt, i) => {
          const color = OPTION_COLORS[i % OPTION_COLORS.length];
          const isSelected = selectedIndex === i;
          const isCorrect = revealed && correctIndex === i;
          const isWrong = revealed && isSelected && correctIndex !== i;

          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={disabled || selectedIndex !== null}
              className={cn(
                "relative flex items-center gap-3 rounded-xl border-2 px-5 py-4 text-left text-sm font-semibold transition-all sm:text-base",
                !revealed && !isSelected && color.bg,
                !revealed && isSelected && color.active,
                isCorrect && "border-green-400 bg-green-500/30 ring-2 ring-green-400",
                isWrong && "border-red-400 bg-red-500/30 opacity-60",
                disabled && !revealed && "cursor-not-allowed opacity-50",
              )}
            >
              <span className="text-lg opacity-60">{OPTION_SHAPES[i]}</span>
              <span className="flex-1">{opt}</span>
              {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-400" />}
              {isWrong && <XCircle className="h-5 w-5 text-red-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
