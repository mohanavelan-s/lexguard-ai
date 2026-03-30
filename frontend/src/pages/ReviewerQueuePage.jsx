import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, FilePenLine } from "lucide-react";

import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextAreaField } from "@/components/ui/InputField";
import { useSession } from "@/context/SessionContext";
import { apiRequest, fetchReviewQueue } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export default function ReviewerQueuePage() {
  const { session } = useSession();
  const pushToast = useUiStore((state) => state.pushToast);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQueue = async () => {
    setLoading(true);

    try {
      const payload = await fetchReviewQueue();
      setPending(payload.pending || []);
      setApproved(payload.approved || []);
      setError("");
    } catch (requestError) {
      setPending([]);
      setApproved([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleChange = (reviewId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [reviewId]: {
        final_response: current[reviewId]?.final_response ?? "",
        lawyer_notes: current[reviewId]?.lawyer_notes ?? "",
        [field]: value
      }
    }));
  };

  const handleApprove = async (review) => {
    const draft = drafts[review.id] || {};

    try {
      await apiRequest("/api/approve-advice", {
        method: "POST",
        body: {
          review_id: review.id,
          final_response: draft.final_response || review.ai_response,
          lawyer_notes: draft.lawyer_notes || ""
        }
      });

      pushToast({
        title: "Advice approved",
        description: "The reviewed answer was published to the user queue.",
        tone: "success"
      });
      await loadQueue();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <PageTransition className="space-y-8">
      <SectionHeading
        description={`Reviewer console for ${session.user?.name || "counsel"} with queue management, edit controls, and a polished publish workflow.`}
        eyebrow="Lawyer dashboard"
        title="Review, edit, and approve legal answers"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[28px] p-5">
          <p className="text-sm text-muted-foreground">Pending items</p>
          <p className="mt-3 font-display text-4xl font-semibold text-foreground">{pending.length}</p>
        </Card>
        <Card className="rounded-[28px] p-5">
          <p className="text-sm text-muted-foreground">Approved answers</p>
          <p className="mt-3 font-display text-4xl font-semibold text-foreground">{approved.length}</p>
        </Card>
        <Card className="rounded-[28px] p-5">
          <p className="text-sm text-muted-foreground">Reviewer role</p>
          <p className="mt-3 font-display text-4xl font-semibold text-foreground">Active</p>
        </Card>
      </div>

      {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.12fr,0.88fr]">
        <Card className="rounded-[32px]">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Pending queue</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Needs human sign-off</h3>
              </div>
              <Badge variant="warning">{loading ? "Refreshing" : `${pending.length} pending`}</Badge>
            </div>

            {!pending.length && !loading ? (
              <EmptyState
                description="Nothing is waiting for review right now. New AI requests will appear here automatically."
                title="Queue is clear"
              />
            ) : (
              <div className="pretty-scrollbar max-h-[760px] space-y-4 overflow-y-auto pr-1">
                {pending.map((review) => {
                  const draft = drafts[review.id] || {};

                  return (
                    <div className="rounded-[28px] border border-border/70 bg-white/70 p-5 dark:bg-white/[0.03]" key={review.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-2xl font-semibold text-foreground">{review.user_name}</p>
                          <p className="mt-2 text-sm text-muted-foreground">{review.user_email}</p>
                          <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                            <ClipboardCheck className="h-4 w-4" />
                            {formatRelativeTime(review.created_at)}
                          </p>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </div>

                      <div className="mt-5 space-y-4">
                        <div className="rounded-[24px] border border-border/70 bg-white/80 p-4 dark:bg-slate-950/40">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">User question</p>
                          <p className="mt-3 text-sm leading-7 text-muted-foreground">{review.question}</p>
                        </div>

                        <div className="rounded-[24px] border border-border/70 bg-white/80 p-4 dark:bg-slate-950/40">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">AI draft</p>
                          <div className="rich-text mt-3" dangerouslySetInnerHTML={{ __html: review.ai_response || "" }} />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Final response</label>
                          <TextAreaField
                            className="min-h-[180px]"
                            onChange={(event) => handleChange(review.id, "final_response", event.target.value)}
                            value={draft.final_response ?? review.ai_response}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Lawyer notes</label>
                          <TextAreaField
                            className="min-h-[120px]"
                            onChange={(event) => handleChange(review.id, "lawyer_notes", event.target.value)}
                            value={draft.lawyer_notes ?? ""}
                          />
                        </div>

                        <Button onClick={() => handleApprove(review)} type="button">
                          <FilePenLine className="h-4 w-4" />
                          Approve advice
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card className="rounded-[32px]">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Approved library</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Recently published</h3>
              </div>
              <Badge variant="success">{approved.length} approved</Badge>
            </div>

            {!approved.length ? (
              <EmptyState
                description="Approved answers will appear here once the first review is published."
                title="No approved answers yet"
              />
            ) : (
              <div className="pretty-scrollbar max-h-[760px] space-y-4 overflow-y-auto pr-1">
                {approved.map((review) => (
                  <div className="rounded-[28px] border border-border/70 bg-white/70 p-5 dark:bg-white/[0.03]" key={review.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-2xl font-semibold text-foreground">{review.user_name}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{review.question}</p>
                      </div>
                      <Badge variant="success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approved
                      </Badge>
                    </div>

                    <div className="mt-4 rounded-[24px] border border-border/70 bg-white/80 p-4 dark:bg-slate-950/40">
                      <div className="rich-text" dangerouslySetInnerHTML={{ __html: review.final_response || "" }} />
                    </div>

                    {review.lawyer_notes ? (
                      <div className="mt-4 rounded-[24px] border border-border/70 bg-white/80 p-4 dark:bg-slate-950/40">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Notes</p>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{review.lawyer_notes}</p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
