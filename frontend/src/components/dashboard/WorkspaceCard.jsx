import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { useTranslatedText } from "@/hooks/useTranslatedText";

export function WorkspaceCard({ description, href, icon: Icon, title }) {
  const [translatedTitle, translatedDescription, translatedCta] = useTranslatedText([title, description, "Open workflow"]);

  return (
    <Link className="group" to={href}>
      <Card className="h-full rounded-[34px] p-8 transition duration-200 group-hover:-translate-y-1.5 group-hover:shadow-glow md:p-9">
        <div className="flex h-full min-h-[300px] flex-col justify-between gap-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-brand/10 text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-5">
            <h3 className="font-display text-[2rem] font-semibold leading-tight text-foreground">{translatedTitle}</h3>
            <p className="max-w-[36ch] text-sm leading-7 text-muted-foreground">{translatedDescription}</p>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-brand">
              {translatedCta}
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
