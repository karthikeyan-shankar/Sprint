import { Link } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Action = { label: string; to?: string; href?: string; onClick?: () => void };

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  body,
  primary,
  secondary,
  className,
  children,
}: {
  icon?: ComponentType<{ className?: string }>;
  eyebrow?: string;
  title: string;
  body?: string;
  primary?: Action;
  secondary?: Action;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-border bg-card p-10 text-center md:p-16",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[520px] max-w-[90vw] -translate-x-1/2 rounded-full bg-neon/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="relative mx-auto flex max-w-xl flex-col items-center">
        {Icon && (
          <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-border bg-surface-2">
            <Icon className="h-7 w-7 text-neon" />
          </div>
        )}
        {eyebrow && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neon">
            <span className="h-1.5 w-1.5 rounded-full bg-neon" />
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-3xl uppercase leading-tight md:text-4xl">{title}</h2>
        {body && <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">{body}</p>}

        {(primary || secondary) && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {primary && <Cta variant="primary" {...primary} />}
            {secondary && <Cta variant="secondary" {...secondary} />}
          </div>
        )}

        {children && <div className="mt-8 w-full">{children}</div>}
      </div>
    </div>
  );
}

function Cta({ label, to, href, onClick, variant }: Action & { variant: "primary" | "secondary" }) {
  const cls =
    variant === "primary"
      ? "inline-flex items-center gap-2 rounded-full bg-neon px-6 py-3 text-xs font-bold uppercase tracking-widest text-neon-foreground neon-glow"
      : "inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-surface-2";
  if (to) return <Link to={to} className={cls}>{label}</Link>;
  if (href) return <a href={href} className={cls}>{label}</a>;
  return <button onClick={onClick} className={cls}>{label}</button>;
}
