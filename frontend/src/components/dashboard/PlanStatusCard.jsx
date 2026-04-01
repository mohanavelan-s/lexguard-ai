import { CreditCard, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslatedText } from "@/hooks/useTranslatedText";

export function PlanStatusCard({ authenticated, role }) {
  const [subscriptionLabel, planLabel, usageLabel, usageValue, upgradeText, manageBilling] = useTranslatedText([
    "Subscription status",
    authenticated ? "Pro plan" : "Free preview",
    "Usage this month",
    authenticated ? "72% of Pro allowance" : "4 of 20 free analyses used",
    "Unlock faster exports, queue priority, and team billing when you move to Pro.",
    "Manage billing"
  ]);

  return (
    <Card className="rounded-[32px] bg-gradient-to-br from-brand/10 via-white/90 to-white/80 dark:via-slate-950/40 dark:to-slate-950/30">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{subscriptionLabel}</p>
              <p className="font-display text-2xl font-semibold text-foreground">{planLabel}</p>
            </div>
          </div>
          <Badge variant="brand">{role === "lawyer" ? "Reviewer seat" : "SaaS workspace"}</Badge>
        </div>
        <div className="space-y-3">
          <div className="h-3 overflow-hidden rounded-full bg-foreground/5">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-brand to-brand-secondary" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{usageLabel}</span>
            <span className="font-medium text-foreground">{usageValue}</span>
          </div>
        </div>
        <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-brand" />
            <p className="text-sm text-foreground">{upgradeText}</p>
          </div>
        </div>
        <Button className="w-full" variant="secondary">
          {manageBilling}
        </Button>
      </div>
    </Card>
  );
}
