import { Card } from "@/components/ui/Card";

export function StepCard({ description, index, title }) {
  return (
    <Card className="h-full rounded-[32px]">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/80">Step {index + 1}</span>
          <span className="font-display text-5xl text-foreground/10">0{index + 1}</span>
        </div>
        <div className="space-y-3">
          <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}
