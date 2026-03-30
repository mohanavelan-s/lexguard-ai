import { Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function AuthShell({ children, description, title }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.95fr,1.05fr]">
      <div className="hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="space-y-5">
          <Link className="flex items-center gap-3" to="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950">LG</div>
            <div>
              <p className="font-display text-lg font-semibold">LexGuard AI</p>
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Premium legal workspace</p>
            </div>
          </Link>
          <div className="space-y-4 pt-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70">
              <Sparkles className="h-4 w-4" />
              Cloud-ready experience
            </p>
            <h1 className="font-display text-5xl font-semibold leading-tight">
              Secure access to a modern legal intelligence workspace.
            </h1>
            <p className="max-w-lg text-base leading-8 text-white/70">
              Designed like a real SaaS platform, with guided AI analysis, workflow persistence, billing states, and reviewer routing.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-300" />
            <p className="text-sm font-medium">Session-based auth with secure frontend states</p>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-xl space-y-8 rounded-[36px] border border-border/60 bg-white/85 p-8 shadow-soft backdrop-blur-2xl dark:bg-slate-950/50 sm:p-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">LexGuard access</p>
            <h2 className="font-display text-4xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
