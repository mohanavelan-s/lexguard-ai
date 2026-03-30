import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, BrainCircuit, Scale, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { platformStats } from "@/data/mock";

const floatingCards = [
  { icon: BrainCircuit, title: "Intent classified", value: "Employment dispute", position: "left-0 top-12" },
  { icon: ShieldAlert, title: "Risk score", value: "Medium", position: "right-0 top-0" },
  { icon: Scale, title: "Recommended action", value: "Request written notice", position: "left-10 bottom-0" },
  { icon: BadgeCheck, title: "Reviewer queue", value: "Ready in 3 hours", position: "right-8 bottom-10" }
];

export function HeroShowcase() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl gap-16 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr,0.85fr] lg:px-8 lg:py-24">
        <div className="relative z-10 space-y-8">
          <Badge variant="brand">Premium legal guidance, reimagined</Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl font-display text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              Legal intelligence that looks and feels like a real SaaS product.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              LexGuard AI turns legal questions, documents, and case workflows into a clean operational workspace with AI
              interpretation, risk scoring, human review, and polished decision support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/register">
              <Button size="lg">
                Get started
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/legal-advisor">
              <Button size="lg" variant="secondary">
                Try the AI workspace
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {platformStats.map((stat) => (
              <div className="rounded-[28px] border border-border/60 bg-white/70 p-5 shadow-soft backdrop-blur-xl dark:bg-white/[0.03]" key={stat.label}>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px]">
          <div className="absolute inset-0 rounded-[36px] bg-hero-gradient opacity-80" />
          <div className="absolute inset-0 rounded-[36px] bg-hero-grid bg-[length:32px_32px] [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-35" />
          <div className="absolute inset-0 rounded-[36px] border border-white/40 bg-white/50 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/40" />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            className="absolute inset-x-8 top-10 rounded-[28px] border border-border/60 bg-background/90 p-6 shadow-soft"
            transition={{ duration: 8, repeat: Infinity }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Live workspace</p>
                <p className="mt-2 font-display text-3xl font-semibold text-foreground">AI legal assistant</p>
              </div>
              <Badge variant="success">Human-in-the-loop ready</Badge>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                <p className="text-sm font-medium text-foreground">
                  “My employer ended my contract without notice after two years. What should I review first?”
                </p>
              </div>
              <div className="rounded-3xl border border-brand/15 bg-brand/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-brand">Interpretation</p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  Likely employment termination issue with potential due-process and notice-period exposure. Medium-high urgency recommended.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-danger/20 bg-danger/10 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-danger-foreground">Risk</p>
                  <p className="mt-2 font-display text-2xl text-foreground">High</p>
                </div>
                <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Suggested action</p>
                  <p className="mt-2 text-sm font-medium text-foreground">Collect written communication + request HR summary</p>
                </div>
              </div>
            </div>
          </motion.div>

          {floatingCards.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                animate={{ y: index % 2 === 0 ? [0, -8, 0] : [0, 8, 0] }}
                className={`absolute ${item.position} hidden w-52 rounded-[24px] border border-white/50 bg-white/90 p-4 shadow-soft backdrop-blur-xl md:block dark:border-white/10 dark:bg-slate-950/70`}
                key={item.title}
                transition={{ duration: 6 + index, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.title}</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
