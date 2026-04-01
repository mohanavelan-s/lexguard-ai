import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { useTranslatedText } from "@/hooks/useTranslatedText";

export function WorkflowHero({ actions, badges = [], description, eyebrow, highlights = [], icon: Icon, stats = [], title }) {
  const translatedHeader = useTranslatedText([eyebrow, title, description]);
  const translatedBadges = useTranslatedText(badges);
  const translatedHighlights = useTranslatedText(highlights);
  const translatedStats = useTranslatedText(stats.flatMap((item) => [item.label, item.value]));

  return (
    <div className="overflow-hidden rounded-[38px] border border-border/60 bg-gradient-to-br from-brand/12 via-white/88 to-brand-secondary/10 p-7 shadow-soft backdrop-blur-2xl dark:from-brand/10 dark:via-slate-950/44 dark:to-brand-secondary/10 md:p-9 xl:p-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr),320px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {Icon ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-brand/12 text-brand shadow-glow">
                  <Icon className="h-6 w-6" />
                </div>
              ) : null}
              {translatedBadges.map((badge) =>
                badge ? (
                  <Badge key={badge} variant="brand">
                    {badge}
                  </Badge>
                ) : null
              )}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/80">{translatedHeader[0]}</p>
              <h1 className="max-w-4xl font-display text-4xl font-semibold tracking-tight text-foreground md:text-[3.25rem] md:leading-[1.05]">
                {translatedHeader[1]}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground">{translatedHeader[2]}</p>
            </div>
          </div>

          {translatedHighlights.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {translatedHighlights.map((highlight) => (
                <div className="rounded-[24px] border border-border/70 bg-white/72 px-4 py-4 text-sm leading-7 text-muted-foreground dark:bg-white/[0.03]" key={highlight}>
                  {highlight}
                </div>
              ))}
            </div>
          ) : null}

          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {stats.length ? (
          <div className="grid gap-4 self-end">
            {stats.map((item, index) => (
              <div className="rounded-[26px] border border-border/70 bg-white/74 p-5 dark:bg-white/[0.03]" key={`${item.label}-${index}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">{translatedStats[index * 2]}</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="font-display text-3xl font-semibold text-foreground">{translatedStats[index * 2 + 1]}</p>
                  <ArrowUpRight className="h-4 w-4 text-brand" />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
