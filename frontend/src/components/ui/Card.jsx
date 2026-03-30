import { cn } from "@/lib/utils";

export function Card({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/60 bg-white/80 p-6 shadow-card backdrop-blur-xl dark:bg-white/[0.04]",
        className
      )}
    >
      {children}
    </div>
  );
}
