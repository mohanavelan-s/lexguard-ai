import { useState } from "react";
import { FileText } from "lucide-react";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { WorkflowHero } from "@/components/ui/WorkflowHero";
import { uploadContractFile } from "@/lib/api";
import { getRiskMeta } from "@/lib/utils";

const sampleScan = {
  success: true,
  heatmap: { high: 2, medium: 2, low: 4 },
  clauses: [
    {
      id: 1,
      risk: "HIGH",
      risk_title: "Termination without notice",
      impact: "May seriously affect your job security or rights.",
      suggestion: "Negotiate safer terms or add employee protections.",
      full_text: "The employer may terminate the engagement immediately without prior written notice."
    }
  ]
};

export default function ScannerPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await uploadContractFile(file);
      setResult(payload);
    } catch (requestError) {
      setError(requestError.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="space-y-10">
      <WorkflowHero
        badges={["Dedicated workflow", "Clause heatmaps"]}
        description="Turn dense legal documents into a visual risk dashboard with premium presentation, clause summaries, and action guidance."
        eyebrow="Document scanner"
        highlights={[
          "Upload a contract on its own page, review clause-level issues, and keep the dashboard free from analysis clutter.",
          "Designed for walkthrough demos, negotiation prep, and fast legal risk reviews."
        ]}
        icon={FileText}
        stats={[
          { label: "Accepted format", value: "PDF" },
          { label: "Output", value: result?.success ? "Risk mapped" : "Awaiting upload" }
        ]}
        title="Clause-level contract risk analysis"
      />

      <div className="grid gap-7 2xl:grid-cols-[0.94fr,1.06fr]">
        <Card className="rounded-[32px]">
          <form className="space-y-5" onSubmit={handleUpload}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Upload file</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Analyze a PDF agreement</h3>
            </div>

            <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[30px] border border-dashed border-border/70 bg-white/60 px-6 text-center dark:bg-white/[0.03]">
              <input className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} type="file" />
              <p className="font-medium text-foreground">{file?.name || "Drop a PDF here or click to browse"}</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">Best for numbered agreements, employment contracts, and rental documents.</p>
            </label>

            {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}

            <div className="flex flex-wrap gap-3">
              <Button disabled={!file || loading} type="submit">
                {loading ? "Scanning..." : "Analyze document"}
              </Button>
              <Button onClick={() => setResult(sampleScan)} type="button" variant="secondary">
                Load sample result
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          {loading ? (
            <Card className="rounded-[32px] space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </Card>
          ) : result?.success ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="High risk" value={result.heatmap?.high ?? 0} />
                <MetricCard label="Medium risk" value={result.heatmap?.medium ?? 0} />
                <MetricCard label="Low risk" value={result.heatmap?.low ?? 0} />
              </div>

              <div className="grid gap-4">
                {(result.clauses || []).map((clause) => {
                  const riskMeta = getRiskMeta(clause.risk?.toLowerCase());

                  return (
                    <Card className="rounded-[30px]" key={clause.id}>
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="font-display text-3xl font-semibold text-foreground">{clause.risk_title}</h3>
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${riskMeta.className}`}>
                            {clause.risk}
                          </span>
                        </div>
                        <p className="text-sm leading-7 text-muted-foreground">{clause.full_text}</p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Impact</p>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">{clause.impact}</p>
                          </div>
                          <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Suggested change</p>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">{clause.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState
              actionLabel="Load sample result"
              description="Upload a legal document and LexGuard will visualize risky clauses, impact, and mitigation recommendations."
              onAction={() => setResult(sampleScan)}
              title="No scan results yet"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
