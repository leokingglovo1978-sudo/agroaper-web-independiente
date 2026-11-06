import { Tractor } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-lg",
          light ? "bg-brand-bright text-brand-graphite" : "bg-brand-deep text-brand-bright",
        )}
        aria-hidden
      >
        <Tractor className="size-5" strokeWidth={2.2} />
      </span>
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight",
          light ? "text-brand-cream" : "text-brand-graphite",
        )}
      >
        AGROAPER
      </span>
    </span>
  );
}
