import { Card } from "@/components/ui/Card";

export function MetricCard({ label, meta, value }) {
  return (
    <Card className="rounded-[28px] p-5">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-end justify-between gap-4">
          <p className="font-display text-4xl font-semibold text-foreground">{value}</p>
          {meta ? <p className="text-xs uppercase tracking-[0.22em] text-brand/80">{meta}</p> : null}
        </div>
      </div>
    </Card>
  );
}
