import { useMemo, useState } from "react";
import { BriefcaseBusiness, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";

import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField, TextAreaField } from "@/components/ui/InputField";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { lawyers as curatedLawyers } from "@/data/lawyers";
import { searchLawyers } from "@/lib/api";
import { initials } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const specializationOptions = [...new Set(curatedLawyers.map((lawyer) => lawyer.spec))];

function normaliseLawyer(lawyer, index = 0) {
  return {
    id: `${lawyer.name}-${lawyer.city}-${index}`,
    name: lawyer.name,
    city: lawyer.city,
    spec: lawyer.spec || lawyer.specialization || "General practice",
    fees: lawyer.fees || "Quote on request",
    exp: lawyer.exp || "8 Yrs",
    cases: lawyer.cases || 120 + index * 12,
    contact: lawyer.contact || "Available on request",
    tags: lawyer.tags || [lawyer.specialization || lawyer.spec || "legal"],
    img: lawyer.img || ""
  };
}

function scoreLawyer(lawyer, brief, city, specialization) {
  const needle = `${brief} ${city} ${specialization}`.toLowerCase();
  let score = 58;

  if (city && lawyer.city.toLowerCase().includes(city.toLowerCase())) {
    score += 12;
  }

  if (specialization && lawyer.spec.toLowerCase() === specialization.toLowerCase()) {
    score += 15;
  }

  lawyer.tags.forEach((tag) => {
    if (needle.includes(tag.toLowerCase())) {
      score += 6;
    }
  });

  if (needle.includes(lawyer.spec.toLowerCase().split(" ")[0])) {
    score += 10;
  }

  return Math.min(score, 98);
}

export default function LawyersPage() {
  const pushToast = useUiStore((state) => state.pushToast);
  const [filters, setFilters] = useState({
    brief: "",
    city: "",
    specialization: ""
  });
  const [directory, setDirectory] = useState(curatedLawyers.map((lawyer, index) => normaliseLawyer(lawyer, index)));
  const [sourceLabel, setSourceLabel] = useState("Curated directory");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rankedLawyers = useMemo(() => {
    return directory
      .filter((lawyer) => {
        const matchesCity = !filters.city || lawyer.city.toLowerCase().includes(filters.city.toLowerCase());
        const matchesSpec = !filters.specialization || lawyer.spec === filters.specialization;
        return matchesCity && matchesSpec;
      })
      .map((lawyer) => ({
        ...lawyer,
        match: scoreLawyer(lawyer, filters.brief, filters.city, filters.specialization)
      }))
      .sort((left, right) => right.match - left.match);
  }, [directory, filters]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = await searchLawyers(filters.city, filters.specialization);
      const liveLawyers = (payload?.lawyers || []).map((lawyer, index) => normaliseLawyer(lawyer, index + 20));
      const merged = [...liveLawyers];

      curatedLawyers.forEach((lawyer, index) => {
        if (!merged.some((item) => item.name === lawyer.name)) {
          merged.push(normaliseLawyer(lawyer, index));
        }
      });

      setDirectory(merged);
      setSourceLabel(liveLawyers.length ? "Live API + curated directory" : "Curated directory");
      pushToast({
        title: "Directory refreshed",
        description: liveLawyers.length ? "Live advocate results blended into the showcase list." : "Using the curated lawyer directory.",
        tone: "success"
      });
    } catch (requestError) {
      setError(requestError.message);
      setSourceLabel("Curated directory");
      pushToast({
        title: "Lawyer API unavailable",
        description: "Showing the premium curated directory instead.",
        tone: "warning"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ brief: "", city: "", specialization: "" });
    setError("");
  };

  return (
    <PageTransition className="space-y-8">
      <SectionHeading
        actions={<Badge variant="brand">{sourceLabel}</Badge>}
        description="Match a legal brief to the right counsel using a product-grade discovery flow with instant scoring, location filters, and consultation-ready cards."
        eyebrow="Lawyer connect"
        title="Find the right legal expert faster"
      />

      <div className="grid gap-6 xl:grid-cols-[0.96fr,1.04fr]">
        <Card className="rounded-[32px]">
          <form className="space-y-5" onSubmit={handleSearch}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Search brief</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Describe the legal need</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Case brief</label>
              <TextAreaField
                onChange={(event) => setFilters((current) => ({ ...current, brief: event.target.value }))}
                placeholder="Property eviction in Chennai, police detention, cyber fraud, divorce custody, founder agreement review..."
                value={filters.brief}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">City</label>
                <InputField
                  onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
                  placeholder="Chennai"
                  value={filters.city}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Specialization</label>
                <select
                  className="h-12 w-full rounded-2xl border border-border/70 bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10 dark:bg-white/[0.03]"
                  onChange={(event) => setFilters((current) => ({ ...current, specialization: event.target.value }))}
                  value={filters.specialization}
                >
                  <option value="">Any specialization</option>
                  {specializationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}

            <div className="flex flex-wrap gap-3">
              <Button disabled={loading} type="submit">
                {loading ? "Refreshing directory..." : "Refresh matches"}
              </Button>
              <Button onClick={resetFilters} type="button" variant="secondary">
                Reset filters
              </Button>
            </div>

            <div className="rounded-[28px] border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">How matching works</p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    LexGuard weighs your issue summary, city, and specialization fit so the first cards feel immediately actionable in a live demo.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {rankedLawyers.map((lawyer) => (
            <Card className="rounded-[30px] p-5" key={lawyer.id}>
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand to-brand-secondary text-sm font-semibold text-white shadow-soft">
                      {initials(lawyer.name)}
                    </div>
                    <div>
                      <p className="font-display text-2xl font-semibold text-foreground">{lawyer.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{lawyer.spec}</p>
                    </div>
                  </div>
                  <Badge variant="success">{lawyer.match}% match</Badge>
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-white/70 px-3 py-3 dark:bg-white/[0.03]">
                    <MapPin className="h-4 w-4 text-brand" />
                    {lawyer.city}
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-white/70 px-3 py-3 dark:bg-white/[0.03]">
                    <BriefcaseBusiness className="h-4 w-4 text-brand" />
                    {lawyer.exp}
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-white/70 px-3 py-3 dark:bg-white/[0.03]">
                    <Star className="h-4 w-4 text-brand" />
                    {lawyer.cases} matters handled
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-white/70 px-3 py-3 dark:bg-white/[0.03]">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    {lawyer.fees}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {lawyer.tags.slice(0, 4).map((tag) => (
                    <span
                      className="rounded-full border border-border/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:bg-white/[0.03]"
                      key={`${lawyer.id}-${tag}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="rounded-[28px] border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Contact readiness</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Best fit for {filters.brief ? "the brief you entered" : "general legal consultations"} with a premium directory card that is ready for real booking integration.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={() =>
                    pushToast({
                      title: "Consultation interest saved",
                      description: `A consultation workflow for ${lawyer.name} can be connected to real scheduling next.`,
                      tone: "success"
                    })
                  }
                  type="button"
                >
                  Book consultation
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
