import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl space-y-3">
        {eyebrow ? <span className="inline-flex text-xs font-semibold uppercase tracking-[0.24em] text-brand/80">{eyebrow}</span> : null}
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h2>
          {description ? <p className="text-sm leading-7 text-muted-foreground md:text-base">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
