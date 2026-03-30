import { Check } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

function formatPrice(value) {
  return value?.replace?.("â‚¹", "Rs. ") || value;
}

export function PricingCard({ plan }) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col rounded-[32px]",
        plan.featured && "border-brand/40 bg-gradient-to-br from-brand/10 via-white/90 to-white/80 dark:via-slate-950/50 dark:to-slate-950/30"
      )}
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant={plan.featured ? "brand" : "neutral"}>{plan.badge}</Badge>
            <div>
              <h3 className="font-display text-3xl font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{plan.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="font-display text-5xl font-semibold text-foreground">{formatPrice(plan.price)}</span>
          {plan.period ? <span className="pb-2 text-sm text-muted-foreground">{plan.period}</span> : null}
        </div>
        <div className="space-y-3">
          {plan.features.map((feature) => (
            <div className="flex items-center gap-3" key={feature}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Button className="w-full" variant={plan.featured ? "primary" : "secondary"}>
          {plan.cta}
        </Button>
      </div>
    </Card>
  );
}
