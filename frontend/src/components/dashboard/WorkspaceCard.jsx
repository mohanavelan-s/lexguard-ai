import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";

export function WorkspaceCard({ description, href, icon: Icon, title }) {
  return (
    <Link className="group" to={href}>
      <Card className="h-full rounded-[28px] transition duration-200 group-hover:-translate-y-1">
        <div className="flex h-full flex-col justify-between gap-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
            <p className="text-sm leading-7 text-muted-foreground">{description}</p>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-brand">
              Open workflow
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
