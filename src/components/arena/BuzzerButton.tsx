import { cn } from "@/lib/utils";

interface BuzzerButtonProps {
  locked: boolean;
  lockedByName?: string;
  isMe: boolean;
  onBuzz: () => void;
}

export function BuzzerButton({ locked, lockedByName, isMe, onBuzz }: BuzzerButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {locked ? (
        <div className="text-center">
          <div className={cn(
            "mx-auto grid h-40 w-40 place-items-center rounded-full border-4 text-xl font-black uppercase",
            isMe ? "border-neon bg-neon/20 text-neon animate-pulse" : "border-red-500 bg-red-500/20 text-red-400",
          )}>
            {isMe ? "You!" : "Locked"}
          </div>
          <p className="mt-3 text-sm font-semibold text-muted-foreground">
            {isMe ? "You buzzed first! Answer now!" : `${lockedByName ?? "Someone"} buzzed first`}
          </p>
        </div>
      ) : (
        <button
          onClick={onBuzz}
          className="group relative grid h-40 w-40 place-items-center rounded-full border-4 border-red-500 bg-red-500/20 text-xl font-black uppercase text-red-400 transition-all hover:scale-105 hover:bg-red-500/40 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] active:scale-95"
        >
          <span className="absolute inset-0 animate-ping rounded-full border-2 border-red-500/30" />
          BUZZ!
        </button>
      )}
    </div>
  );
}
