import { Card } from "@/components/ui/Card";

export function TestimonialCard({ item }) {
  return (
    <Card className="h-full rounded-[32px]">
      <div className="flex h-full flex-col justify-between gap-6">
        <p className="text-base leading-8 text-foreground/90">“{item.quote}”</p>
        <div>
          <p className="font-display text-xl font-semibold text-foreground">{item.name}</p>
          <p className="text-sm text-muted-foreground">{item.role}</p>
        </div>
      </div>
    </Card>
  );
}
