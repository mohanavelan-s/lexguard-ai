import { useEffect, useState } from "react";

import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { InputField } from "@/components/ui/InputField";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { searchCases } from "@/lib/api";

const initialFilters = {
  query: "",
  year: "Any",
  court: "Any"
};

export default function CasesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const runSearch = async (nextFilters) => {
    setLoading(true);
    setError("");

    try {
      const payload = await searchCases(nextFilters.query, nextFilters.year, nextFilters.court);
      setCases(payload?.cases || []);
    } catch (requestError) {
      setError(requestError.message);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(initialFilters);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await runSearch(filters);
  };

  return (
    <PageTransition className="space-y-8">
      <SectionHeading
        description="Search precedent with a cleaner legal research interface that feels closer to a knowledge product than a simple data dump."
        eyebrow="Case intelligence"
        title="Search landmark cases and judgments"
      />

      <Card className="rounded-[32px]">
        <form className="grid gap-4 xl:grid-cols-[1.4fr,0.6fr,0.9fr,0.5fr]" onSubmit={handleSubmit}>
          <InputField onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="Search privacy, liberty, property, workplace..." value={filters.query} />
          <select
            className="h-12 rounded-2xl border border-border/70 bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10 dark:bg-white/[0.03]"
            onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))}
            value={filters.year}
          >
            <option value="Any">Any</option>
            <option value="1973">1973</option>
            <option value="1985">1985</option>
            <option value="1997">1997</option>
            <option value="2014">2014</option>
            <option value="2018">2018</option>
            <option value="2020">2020</option>
          </select>
          <select
            className="h-12 rounded-2xl border border-border/70 bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10 dark:bg-white/[0.03]"
            onChange={(event) => setFilters((current) => ({ ...current, court: event.target.value }))}
            value={filters.court}
          >
            <option value="Any">Any</option>
            <option value="Supreme Court">Supreme Court</option>
            <option value="High Court">High Court</option>
          </select>
          <Button disabled={loading} type="submit">
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
        {error ? <div className="mt-4 rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}
      </Card>

      {cases.length ? (
        <div className="grid gap-4">
          {cases.map((entry) => (
            <Card className="rounded-[30px]" key={`${entry.title}-${entry.year || ""}`}>
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-3xl font-semibold text-foreground">{entry.title}</h3>
                    <p className="mt-2 text-sm text-brand">{[entry.year, entry.court].filter(Boolean).join(" • ")}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Summary</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{entry.summary}</p>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Outcome</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{entry.outcome}</p>
                  </div>
                  {entry.key_people ? (
                    <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Key figures</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{entry.key_people}</p>
                    </div>
                  ) : null}
                  {entry.judges ? (
                    <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Bench</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{entry.judges}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          actionLabel="Search sample topic"
          description="Run a case query to populate this research view with summary cards and reusable precedent context."
          onAction={() => setFilters((current) => ({ ...current, query: "privacy" }))}
          title="No cases loaded"
        />
      )}
    </PageTransition>
  );
}
