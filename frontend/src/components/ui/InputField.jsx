import { cn } from "@/lib/utils";

export function InputField({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-border/70 bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10 dark:bg-white/[0.03]",
        className
      )}
      {...props}
    />
  );
}

export function TextAreaField({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-3xl border border-border/70 bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10 dark:bg-white/[0.03]",
        className
      )}
      {...props}
    />
  );
}
