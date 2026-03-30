import { cn } from "@/lib/utils";

const variants = {
  neutral: "border-border/70 bg-white/70 text-foreground dark:bg-white/5",
  brand: "border-brand/20 bg-brand/10 text-brand-foreground dark:text-white",
  success: "border-success/20 bg-success/10 text-success-foreground",
  warning: "border-warning/20 bg-warning/10 text-warning-foreground",
  danger: "border-danger/20 bg-danger/10 text-danger-foreground"
};

export function Badge({ children, className, variant = "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.14em] uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
