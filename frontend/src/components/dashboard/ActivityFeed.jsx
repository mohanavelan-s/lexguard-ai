import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatRelativeTime, getRiskMeta } from "@/lib/utils";

export function ActivityFeed({ items, title = "Recent activity" }) {
  return (
    <Card className="rounded-[32px]">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">{title}</p>
          <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Operational history</h3>
        </div>
        <div className="space-y-4">
          {items.map((item) => {
            const riskMeta = getRiskMeta(item.risk || "low");

            return (
              <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]" key={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{item.title || item.question}</p>
                    <p className="text-sm text-muted-foreground">{item.category || item.status || "Saved workspace item"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={riskMeta.className}>{riskMeta.label}</Badge>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{formatRelativeTime(item.createdAt || item.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
