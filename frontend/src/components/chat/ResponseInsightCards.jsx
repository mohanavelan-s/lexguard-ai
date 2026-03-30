import { AlertTriangle, FileText, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getRiskMeta } from "@/lib/utils";

export function ResponseInsightCards({ response }) {
  const riskMeta = getRiskMeta(response.risk);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
      <Card className="rounded-[30px]">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Badge variant="brand">Legal interpretation</Badge>
              <h3 className="font-display text-3xl font-semibold text-foreground">{response.title}</h3>
            </div>
            <Badge className={riskMeta.className}>{riskMeta.label}</Badge>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">{response.interpretation}</p>
          <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-brand" />
              Confidence score: {response.confidence}%
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-[30px]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk class</p>
                <p className="font-display text-2xl font-semibold text-foreground">{riskMeta.label}</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              LexGuard weights the issue based on urgency signals, rights exposure, and likely enforcement friction.
            </p>
          </div>
        </Card>
        <Card className="rounded-[30px]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 text-success">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Action bundle</p>
                <p className="font-display text-2xl font-semibold text-foreground">{response.actions.length || 1} next steps</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">Use the suggested actions to plan documentation, negotiation, or escalation.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
