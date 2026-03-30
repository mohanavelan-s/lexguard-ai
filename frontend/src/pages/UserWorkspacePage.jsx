import { useEffect, useState } from "react";
import { Clock3, FileText, MessageSquareDot } from "lucide-react";

import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextAreaField } from "@/components/ui/InputField";
import { useSession } from "@/context/SessionContext";
import { fetchReviewHistory, submitForReview } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

function getStatusVariant(status) {
  if (status === "approved") {
    return "success";
  }
  if (status === "pending") {
    return "warning";
  }
  return "neutral";
}

export default function UserWorkspacePage() {
  const { session } = useSession();
  const pushToast = useUiStore((state) => state.pushToast);
  const [question, setQuestion] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const payload = await fetchReviewHistory();
      setReviews(payload || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim() || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = await submitForReview(question.trim());
      setQuestion("");
      pushToast({
        title: "Submitted for review",
        description: payload.message || "Your question is now in the legal review queue.",
        tone: "success"
      });
      await loadReviews();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const approvedCount = reviews.filter((review) => review.status === "approved").length;

  return (
    <PageTransition className="space-y-8">
      <SectionHeading
        description={`A dedicated member workspace for ${session.user?.name || "your account"} with clean request intake, review history, and publish status tracking.`}
        eyebrow="User dashboard"
        title="Submit questions and track reviewed answers"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[28px] p-5">
          <p className="text-sm text-muted-foreground">Total submissions</p>
          <p className="mt-3 font-display text-4xl font-semibold text-foreground">{reviews.length}</p>
        </Card>
        <Card className="rounded-[28px] p-5">
          <p className="text-sm text-muted-foreground">Approved answers</p>
          <p className="mt-3 font-display text-4xl font-semibold text-foreground">{approvedCount}</p>
        </Card>
        <Card className="rounded-[28px] p-5">
          <p className="text-sm text-muted-foreground">Current plan</p>
          <p className="mt-3 font-display text-4xl font-semibold text-foreground">Pro</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr,1.08fr]">
        <Card className="rounded-[32px]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Submit request</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Ask for reviewed legal guidance</h3>
            </div>

            <TextAreaField
              className="min-h-[220px]"
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Describe your situation, what happened, and what kind of answer or review you need."
              value={question}
            />

            {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}

            <Button disabled={!question.trim() || submitting} type="submit">
              {submitting ? "Submitting..." : "Submit for lawyer review"}
            </Button>
          </form>
        </Card>

        <Card className="rounded-[32px]">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Review history</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Your queue</h3>
              </div>
              <Badge variant="brand">{loading ? "Refreshing" : `${reviews.length} items`}</Badge>
            </div>

            {!reviews.length && !loading ? (
              <EmptyState
                actionLabel="Draft a submission"
                description="Your reviewed answers and pending submissions will appear here once you send your first request."
                onAction={() => setQuestion("I need a clear summary of my legal position and safest next step.")}
                title="No review history yet"
              />
            ) : (
              <div className="pretty-scrollbar max-h-[680px] space-y-4 overflow-y-auto pr-1">
                {reviews.map((review) => (
                  <div className="rounded-[28px] border border-border/70 bg-white/70 p-5 dark:bg-white/[0.03]" key={review.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <p className="font-display text-2xl font-semibold text-foreground">{review.question}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            {formatRelativeTime(review.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MessageSquareDot className="h-4 w-4" />
                            Human review workflow
                          </span>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(review.status)}>{review.status}</Badge>
                    </div>

                    {review.status === "approved" ? (
                      <div className="mt-4 space-y-4">
                        <div className="rounded-[24px] border border-border/70 bg-white/80 p-4 dark:bg-slate-950/40">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Published answer</p>
                          <div className="rich-text mt-3" dangerouslySetInnerHTML={{ __html: review.final_response || review.ai_response || "" }} />
                        </div>
                        {review.lawyer_notes ? (
                          <div className="rounded-[24px] border border-border/70 bg-white/80 p-4 dark:bg-slate-950/40">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Lawyer notes</p>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">{review.lawyer_notes}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[24px] border border-warning/20 bg-warning/10 p-4 text-sm leading-7 text-warning-foreground">
                        Your question is still waiting for a reviewer to approve or edit the final answer.
                      </div>
                    )}
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
