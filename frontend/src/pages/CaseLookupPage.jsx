import { useState } from "react";
import { CalendarClock, MailCheck, SearchCheck, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { InputField } from "@/components/ui/InputField";
import { WorkflowHero } from "@/components/ui/WorkflowHero";
import { useSession } from "@/context/SessionContext";
import { lookupCase } from "@/lib/api";
import { useUiStore } from "@/store/ui-store";

const initialForm = {
  caseType: "civil",
  caseNumber: "",
  filingYear: "",
  courtComplex: ""
};

const demoCases = [
  { number: "1234", status: "Pending", note: "Hearing scheduled" },
  { number: "5678", status: "Disposed", note: "Final order issued" },
  { number: "9999", status: "Adjourned", note: "New date awaited" }
];

function getBadgeVariant(status) {
  if (status === "Disposed") {
    return "success";
  }
  if (status === "Adjourned") {
    return "warning";
  }
  if (status === "Pending") {
    return "brand";
  }
  return "neutral";
}

export default function CaseLookupPage() {
  const { session } = useSession();
  const pushToast = useUiStore((state) => state.pushToast);
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!session.authenticated) {
      setError("Sign in first so the lookup can be saved to your account.");
      pushToast({
        title: "Login required",
        description: "Case lookup results are saved against a signed-in account.",
        tone: "warning"
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await lookupCase({
        case_number: form.caseNumber,
        year: form.filingYear,
        court_type: form.caseType,
        court_complex: form.courtComplex
      });
      setResult(payload);
      pushToast({
        title: "Case status loaded",
        description: `Case ${form.caseNumber || "lookup"} returned ${payload.status}.`,
        tone: "success"
      });
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
        actions={
          !session.authenticated ? (
            <Link to="/login">
              <Button size="sm" variant="secondary">
                Login to save results
              </Button>
            </Link>
          ) : null
        }
        badges={[session.authenticated ? `Signed in as ${session.user?.role}` : "Login required", "Email status updates"]}
        description="A cleaner case-tracking experience for status checks, hearing dates, and notification states, wrapped in a premium SaaS-style surface."
        eyebrow="Case status lookup"
        highlights={[
          "Track a case on its own page with room for hearing dates, notification delivery, and quick reference examples.",
          "When email delivery is configured, updates are sent back to the signed-in user's address automatically."
        ]}
        icon={SearchCheck}
        stats={[
          { label: "Latest status", value: result?.status || "Awaiting lookup" },
          { label: "Email delivery", value: result?.email_sent ? "Sent" : session.authenticated ? "Ready" : "Disabled" }
        ]}
        title="Track hearing progress without leaving the workspace"
      />

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,0.92fr),minmax(0,1.08fr)]">
        <Card className="rounded-[32px]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Lookup form</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Search by case details</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Case type</label>
                <select
                  className="h-12 w-full rounded-2xl border border-border/70 bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10 dark:bg-white/[0.03]"
                  onChange={(event) => setForm((current) => ({ ...current, caseType: event.target.value }))}
                  value={form.caseType}
                >
                  <option value="civil">Civil</option>
                  <option value="criminal">Criminal</option>
                  <option value="family">Family</option>
                  <option value="consumer">Consumer</option>
                  <option value="labor">Labor</option>
                  <option value="writ">Writ petition</option>
                  <option value="appeal">Appeal</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Case number</label>
                <InputField
                  onChange={(event) => setForm((current) => ({ ...current, caseNumber: event.target.value }))}
                  placeholder="1234"
                  value={form.caseNumber}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Filing year</label>
                <InputField
                  maxLength={4}
                  onChange={(event) => setForm((current) => ({ ...current, filingYear: event.target.value }))}
                  placeholder="2026"
                  value={form.filingYear}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Court complex</label>
                <InputField
                  onChange={(event) => setForm((current) => ({ ...current, courtComplex: event.target.value }))}
                  placeholder="Chennai District Court"
                  value={form.courtComplex}
                />
              </div>
            </div>

            {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}

            <div className="flex flex-wrap gap-3">
              <Button disabled={loading} type="submit">
                {loading ? "Checking status..." : "Check case status"}
              </Button>
              <Button
                onClick={() => setForm({ ...initialForm, caseNumber: "1234", filingYear: "2026", courtComplex: "Chennai District Court" })}
                type="button"
                variant="secondary"
              >
                Load demo input
              </Button>
            </div>
          </form>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-[34px]">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Result panel</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Latest lookup</h3>
                </div>
                {result?.status ? <Badge variant={getBadgeVariant(result.status)}>{result.status}</Badge> : null}
              </div>

              {!result ? (
                <EmptyState
                  actionLabel="Try demo case 5678"
                  description="Run a lookup to reveal status, hearing timeline, and notification outcomes in this detail panel."
                  onAction={() => setForm((current) => ({ ...current, caseNumber: "5678" }))}
                  title="No case result yet"
                />
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[30px] border border-border/70 bg-white/70 p-5 dark:bg-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <SearchCheck className="h-5 w-5 text-brand" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tracked case</p>
                          <p className="font-medium text-foreground">Case #{form.caseNumber}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[30px] border border-border/70 bg-white/70 p-5 dark:bg-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <CalendarClock className="h-5 w-5 text-brand" />
                        <div>
                          <p className="text-sm text-muted-foreground">Next hearing</p>
                          <p className="font-medium text-foreground">{result.next_hearing}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-border/70 bg-white/70 p-6 dark:bg-white/[0.03]">
                    <div className="flex items-start gap-3">
                      <MailCheck className="mt-1 h-5 w-5 text-brand" />
                      <div>
                        <p className="font-medium text-foreground">Notification status</p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {result.notification_message ||
                            (result.email_sent
                              ? `An email notification was sent to ${session.user?.email || "the signed-in user"}.`
                              : "The lookup was saved, but email delivery is not configured for this deployment yet.")}
                        </p>
                        {result.notification_email || session.user?.email ? (
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand/80">
                            Delivery target: {result.notification_email || session.user?.email}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="rounded-[34px]">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Demo quick references</p>
                  <h3 className="font-display text-3xl font-semibold text-foreground">Sample case numbers</h3>
                </div>
              </div>
              <div className="grid gap-3">
                {demoCases.map((item) => (
                  <button
                    className="flex items-center justify-between rounded-3xl border border-border/70 bg-white/70 px-4 py-4 text-left transition hover:border-brand/30 hover:bg-brand/5 dark:bg-white/[0.03]"
                    key={item.number}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        caseNumber: item.number
                      }))
                    }
                    type="button"
                  >
                    <div>
                      <p className="font-medium text-foreground">Case {item.number}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
                    </div>
                    <Badge variant={getBadgeVariant(item.status)}>{item.status}</Badge>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
