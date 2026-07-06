import { cn } from "@/lib/utils";
import logoUrl from "@/assets/sprint-logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  mark?: boolean;
}

const sizeMap = {
  sm: "h-9",
  md: "h-12",
  lg: "h-20",
  xl: "h-28 md:h-40",
};

export function Logo({ className, size = "md", mark = false }: LogoProps) {
  if (mark) {
    return (
      <img
        src={logoUrl}
        alt="Sprint"
        width={1600}
        height={704}
        className={cn("h-8 w-8 object-contain object-right", className)}
      />
    );
  }
  return (
    <img
      src={logoUrl}
      alt="Sprint — Where College Sports Begin"
      width={1600}
      height={704}
      className={cn("w-auto object-contain", sizeMap[size], className)}
    />
  );
}
