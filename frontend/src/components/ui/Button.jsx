import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-brand text-brand-foreground shadow-glow hover:-translate-y-0.5 hover:shadow-soft",
  secondary:
    "border border-border/70 bg-white/70 text-foreground hover:-translate-y-0.5 hover:border-brand/30 hover:bg-white/85 dark:bg-white/5 dark:hover:bg-white/10",
  ghost: "text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-white/5",
  outline:
    "border border-border/70 bg-transparent text-foreground hover:-translate-y-0.5 hover:border-brand/30 hover:bg-white/60 dark:hover:bg-white/5",
  danger: "bg-danger text-danger-foreground hover:-translate-y-0.5"
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base"
};

export const Button = forwardRef(function Button({ asChild = false, className, size = "md", variant = "primary", ...props }, ref) {
  const Component = asChild ? "span" : "button";

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
