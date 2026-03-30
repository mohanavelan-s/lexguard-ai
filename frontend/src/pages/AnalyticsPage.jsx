import { mockAnalytics } from "@/data/mock";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { compactNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const maxValue = Math.max(...mockAnalytics.trend.map((item) => item.value));

  return (
    <PageTransition className="space-y-8">
      <SectionHeading
        description="Optional admin-style analytics designed to make the product feel operationally mature for demos and production storytelling."
        eyebrow="Analytics"
        title="Product health and query intelligence"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mockAnalytics.activity.map((item) => (
          <MetricCard key={item.label} label={item.label} meta={item.tone} value={compactNumber(item.value)} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="rounded-[32px]">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Weekly volume</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Query demand by day</h3>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {mockAnalytics.trend.map((item) => (
                <div className="flex flex-col items-center gap-3" key={item.day}>
                  <div className="flex h-56 w-full items-end rounded-3xl bg-foreground/5 p-2">
                    <div className="w-full rounded-2xl bg-gradient-to-t from-brand to-brand-secondary" style={{ height: `${(item.value / maxValue) * 100}%` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{item.day}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="rounded-[32px]">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Team insights</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Operational notes</h3>
            </div>
            {[
              "Highest demand clusters around contract interpretation and urgent employment issues.",
              "Reviewer completions are healthy enough to support a premium SLA narrative.",
              "The frontend is structured for future analytics APIs without redesigning the experience."
            ].map((note) => (
              <div className="rounded-3xl border border-border/70 bg-white/70 p-4 text-sm leading-7 text-muted-foreground dark:bg-white/[0.03]" key={note}>
                {note}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
