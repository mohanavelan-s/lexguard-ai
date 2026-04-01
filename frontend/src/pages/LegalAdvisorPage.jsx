import { useEffect, useRef, useState } from "react";
import { Download, Sparkles, UserRoundCheck } from "lucide-react";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ResponseInsightCards } from "@/components/chat/ResponseInsightCards";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { WorkflowHero } from "@/components/ui/WorkflowHero";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSession } from "@/context/SessionContext";
import { chatSuggestions, starterQueries } from "@/data/mock";
import { apiRequest, sendLegalQuery, submitForReview } from "@/lib/api";
import { storageGet, storageSet } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export default function LegalAdvisorPage() {
  const { session } = useSession();
  const pushToast = useUiStore((state) => state.pushToast);
  const conversationRef = useRef(null);
  const storageKey = session.user?.id ? `lexguard-chat-${session.user.id}` : "lexguard-chat-guest";
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(() => storageGet(storageKey, []));
  const [currentResponse, setCurrentResponse] = useState(null);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setConversation(storageGet(storageKey, []));
  }, [storageKey]);

  useEffect(() => {
    storageSet(storageKey, conversation);
  }, [conversation, storageKey]);

  useEffect(() => {
    const nextResponse = [...conversation].reverse().find((item) => item.role === "assistant");
    setCurrentResponse(nextResponse?.response || null);
  }, [conversation]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation, loading]);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setError("Voice capture failed. Try typing your question instead.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleSubmit = async () => {
    const question = input.trim();
    if (!question || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setConversation((current) => [...current, { id: `user-${Date.now()}`, role: "user", answer: question }]);

    try {
      const payload = await sendLegalQuery(question);
      const response = { ...payload, question };
      setConversation((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          title: response.title,
          answer: response.answerText || response.interpretation,
          response
        }
      ]);
      setInput("");
      pushToast({
        title: "Analysis complete",
        description: `Risk classified as ${response.risk}.`,
        tone: response.risk === "high" ? "warning" : "success"
      });
    } catch (requestError) {
      setError(requestError.message);
      pushToast({
        title: "Analysis failed",
        description: requestError.message,
        tone: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!currentResponse?.matched) {
      return;
    }

    try {
      const blob = await apiRequest("/export-pdf", {
        method: "POST",
        body: currentResponse,
        responseType: "blob"
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "lexguard-legal-advice.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      pushToast({
        title: "PDF exported",
        description: "Your legal summary has been downloaded.",
        tone: "success"
      });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleReviewSubmit = async () => {
    if (!currentResponse?.question || !session.authenticated || submittingReview) {
      return;
    }

    setSubmittingReview(true);
    try {
      const payload = await submitForReview(currentResponse.question);
      pushToast({
        title: "Sent for review",
        description: payload.message || "A lawyer will review this answer.",
        tone: "success"
      });
    } catch (requestError) {
      pushToast({
        title: "Review submission failed",
        description: requestError.message,
        tone: "danger"
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <PageTransition className="space-y-12">
      <WorkflowHero
        actions={
          currentResponse ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExport} variant="secondary">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              {session.authenticated && session.user?.role === "user" ? (
                <Button disabled={submittingReview} onClick={handleReviewSubmit} variant="secondary">
                  <UserRoundCheck className="h-4 w-4" />
                  {submittingReview ? "Submitting..." : "Request human review"}
                </Button>
              ) : null}
            </div>
          ) : null
        }
        badges={["Natural language intake", `Output ${session.lang?.toUpperCase() || "EN"}`]}
        description={`A premium AI workspace for intake, interpretation, risk scoring, and clean response packaging. Output follows the selected workspace language (${session.lang?.toUpperCase() || "EN"}).`}
        eyebrow="AI legal assistant"
        highlights={[
          "Ask a question in plain language, then review interpretation, risk, and next steps on their own surfaces.",
          "Export polished summaries and escalate sensitive issues into the human review flow when needed."
        ]}
        title="Ask a legal question in natural language"
        icon={Sparkles}
        stats={[
          { label: "Session mode", value: session.authenticated ? "Saved history" : "Guest preview" },
          { label: "Human review", value: session.user?.role === "user" ? "Available" : "Role-gated" }
        ]}
      />

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr),430px]">
        <div className="space-y-7">
          <ChatComposer input={input} listening={listening} onChange={setInput} onSubmit={handleSubmit} onVoice={handleVoiceInput} suggestions={chatSuggestions} />
          {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}

          <div className="space-y-5 rounded-[34px] border border-border/60 bg-white/80 p-6 shadow-soft dark:bg-white/[0.03] md:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Conversation</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Live analysis feed</h3>
              </div>
              <Sparkles className="h-5 w-5 text-brand" />
            </div>

            <div className="pretty-scrollbar max-h-[640px] space-y-4 overflow-y-auto pr-1" ref={conversationRef}>
              {!conversation.length && !loading ? (
                <EmptyState
                  actionLabel="Use a starter prompt"
                  description="Choose one of the starter prompts below or paste your own legal issue to begin the analysis."
                  onAction={() => setInput(starterQueries[0].body)}
                  title="No legal conversation yet"
                />
              ) : (
                conversation.map((item) => <ChatMessage answer={item.answer} key={item.id} role={item.role} title={item.title} />)
              )}

              {loading ? (
                <Card className="rounded-[30px]">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {currentResponse ? (
            <>
              <ResponseInsightCards response={currentResponse} />
              <Card className="rounded-[30px]">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Suggested actions</p>
                    <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Recommended next steps</h3>
                  </div>
                  <div className="space-y-3">
                    {(currentResponse.actions.length ? currentResponse.actions : ["Document the issue, preserve evidence, and prepare for escalation."]).map((step) => (
                      <div className="rounded-3xl border border-border/70 bg-white/70 px-4 py-4 text-sm leading-7 text-muted-foreground dark:bg-white/[0.03]" key={step}>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <Card className="rounded-[30px]">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Response detail</p>
                    <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Legal explanation</h3>
                  </div>
                  <div className="rich-text" dangerouslySetInnerHTML={{ __html: currentResponse.answer || `<p>${currentResponse.answerText}</p>` }} />
                </div>
              </Card>
              {currentResponse.laws?.length ? (
                <Card className="rounded-[30px]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Relevant law</p>
                      <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Applicable references</h3>
                    </div>
                    <div className="space-y-3">
                      {currentResponse.laws.map((law) => (
                        <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]" key={`${law.name}-${law.section}`}>
                          <p className="font-medium text-foreground">{law.name}</p>
                          <p className="mt-1 text-sm text-brand">{law.section}</p>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">{law.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ) : null}
            </>
          ) : (
            <EmptyState
              actionLabel="Try a starter query"
              description="Once you analyze a question, LexGuard will show the legal interpretation, risk level, laws, and recommended actions here."
              onAction={() => setInput(starterQueries[1].body)}
              title="Insight panel waiting"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
