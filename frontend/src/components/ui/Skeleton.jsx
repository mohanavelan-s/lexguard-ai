import { cn } from "@/lib/utils";

export function Skeleton({ className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-foreground/5", className)}>
      <div className="absolute inset-y-0 left-[-120%] w-[60%] animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
    </div>
  );
}
