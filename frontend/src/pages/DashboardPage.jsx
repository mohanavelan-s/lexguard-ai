import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { FileSearch, FileText, MessageSquareText, ShieldAlert, Siren, Sparkles, UserRoundSearch } from "lucide-react";
import { Link } from "react-router-dom";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PlanStatusCard } from "@/components/dashboard/PlanStatusCard";
import { WorkspaceCard } from "@/components/dashboard/WorkspaceCard";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { InputField } from "@/components/ui/InputField";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkflowHero } from "@/components/ui/WorkflowHero";
import { useSession } from "@/context/SessionContext";
import { emptyStateCopy, sampleHistory, savedCases } from "@/data/mock";
import { fetchReviewHistory, fetchReviewQueue } from "@/lib/api";

const workspaceCards = [
  {
    title: "AI legal workspace",
    description: "Chat-style legal analysis with interpretation, risk scoring, and next-step recommendations.",
    href: "/legal-advisor",
    icon: MessageSquareText
  },
  {
    title: "Document scanner",
    description: "Upload contracts and visualize clause-level risk heatmaps for review and negotiation.",
    href: "/scanner",
    icon: FileText
  },
  {
    title: "Case intelligence",
    description: "Search landmark judgments, save useful precedent, and build reusable decision context.",
    href: "/cases",
    icon: FileSearch
  },
  {
    title: "Lawyer connect",
    description: "Surface relevant experts and reviewer-style roles for escalation-sensitive legal questions.",
    href: "/lawyers",
    icon: UserRoundSearch
  },
  {
    title: "Emergency protect mode",
    description: "Keep one fast path for SOS, live location sharing, and voice-triggered emergency routines.",
    href: "/protect",
    icon: Siren
  },
  {
    title: "Case lookup",
    description: "Track case progress and turn raw status checks into a clean dashboard artifact.",
    href: "/case-lookup",
    icon: ShieldAlert
  }
];

export default function DashboardPage() {
  const { session } = useSession();
  const [history, setHistory] = useState(sampleHistory);
  const [reviewQueue, setReviewQueue] = useState({ pending: [], approved: [] });
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const load = async () => {
      if (session.user?.role === "lawyer") {
        const queue = await fetchReviewQueue();
        startTransition(() => {
          setReviewQueue(queue);
        });
      } else {
        const reviews = await fetchReviewHistory();
        startTransition(() => {
          setHistory(
            (reviews || []).map((item) => ({
              id: item.id || Math.random().toString(36).slice(2),
              title: item.question || item.title,
              category: item.status || "Legal review",
              risk: item.status === "approved" ? "low" : "medium",
              createdAt: item.created_at || item.createdAt || Date.now()
            }))
          );
        });
      }
    };

    load();
  }, [session.user?.role]);

  const filteredHistory = history.filter((item) => {
    const needle = deferredSearch.trim().toLowerCase();
    if (!needle) {
      return true;
    }
    return `${item.title} ${item.category}`.toLowerCase().includes(needle);
  });

  const metrics =
    session.user?.role === "lawyer"
      ? [
          { label: "Pending reviews", value: reviewQueue.pending?.length || 0, meta: "Queue" },
          { label: "Approved today", value: reviewQueue.approved?.length || 0, meta: "Completed" },
          { label: "Role", value: "Lawyer", meta: "Reviewer" }
        ]
      : [
          { label: "Saved workflows", value: filteredHistory.length || 0, meta: "History" },
          { label: "Saved cases", value: savedCases.length, meta: "Bookmarks" },
          { label: "Subscription", value: session.authenticated ? "Pro" : "Free", meta: "Plan" }
        ];

  return (
    <PageTransition className="space-y-12">
      <WorkflowHero
        actions={
          session.user?.role === "lawyer" ? (
            <Link to="/lawyer-dashboard">
              <Button>Open reviewer queue</Button>
            </Link>
          ) : (
            <>
              <Link to="/legal-advisor">
                <Button>Open AI workspace</Button>
              </Link>
              <Link to="/case-lookup">
                <Button variant="secondary">Track a case</Button>
              </Link>
            </>
          )
        }
        badges={[session.user?.role === "lawyer" ? "Reviewer workspace" : "Member workspace", `Language ${session.lang?.toUpperCase() || "EN"}`]}
        description={
          session.authenticated
            ? `Welcome back ${session.user?.name}. Your workspace is designed to turn legal complexity into clean operational decisions.`
            : "Explore a polished legal AI workspace with guided analytics, saved history, and billing-ready product states."
        }
        eyebrow="Workspace overview"
        highlights={
          session.user?.role === "lawyer"
            ? [
                "Review queues, approvals, and escalations stay visible without leaving the control center.",
                "Every legal workflow is broken into dedicated product pages so the dashboard stays clean."
              ]
            : [
                "Launch each core legal workflow from here, then return to one calm, centralized dashboard.",
                "Saved history, case tracking, and billing status stay connected without squeezing the interface."
              ]
        }
        icon={Sparkles}
        stats={metrics}
        title={session.user?.role === "lawyer" ? "Reviewer control center" : "Legal intelligence dashboard"}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),380px]">
        <Card className="rounded-[34px] bg-gradient-to-br from-white/88 via-white/78 to-brand/10 p-7 dark:from-white/[0.04] dark:via-white/[0.03] dark:to-brand/10">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Workspace principle</p>
            <h3 className="font-display text-3xl font-semibold text-foreground">One dashboard, many dedicated workflows</h3>
            <p className="max-w-3xl text-sm leading-8 text-muted-foreground">
              LexGuard now keeps scanning, case research, lawyer discovery, emergency protect mode, and case lookup on
              separate pages. The dashboard stays as the operating system and routing layer instead of forcing every
              tool into the same surface.
            </p>
          </div>
        </Card>
        <PlanStatusCard authenticated={session.authenticated} role={session.user?.role} />
      </div>

      <section className="space-y-6">
        <SectionHeading
          description="Every core feature is now surfaced as a first-class SaaS workflow."
          eyebrow="Core platform"
          title="Launch the workflows"
        />
        <div className="grid gap-6 xl:grid-cols-2">
          {workspaceCards.map((card) => (
            <WorkspaceCard description={card.description} href={card.href} icon={card.icon} key={card.href} title={card.title} />
          ))}
        </div>
      </section>

      <div className="grid gap-8 2xl:grid-cols-[1.08fr,0.92fr]">
        <div className="space-y-6">
          <SectionHeading
            actions={<InputField className="w-full sm:w-[320px]" onChange={(event) => setSearch(event.target.value)} placeholder="Filter history..." value={search} />}
            description="Queries, review submissions, and saved workspace actions stay visible in one clean operational feed."
            eyebrow="History"
            title={session.user?.role === "lawyer" ? "Queue visibility" : "Recent legal activity"}
          />

          {session.user?.role === "lawyer" ? (
            <ActivityFeed
              items={(reviewQueue.pending || []).map((item) => ({
                id: item.id,
                title: item.question,
                category: item.status,
                risk: "medium",
                createdAt: item.created_at
              }))}
              title="Review queue"
            />
          ) : filteredHistory.length ? (
            <ActivityFeed items={filteredHistory} />
          ) : (
            <EmptyState {...emptyStateCopy.history} />
          )}
        </div>

        <div className="space-y-6">
          <SectionHeading
            description="Bookmark high-value cases, references, and legal anchors to reuse them across workflows."
            eyebrow="Saved intelligence"
            title="Pinned cases"
          />
          {savedCases.length ? (
            <div className="grid gap-5">
              {savedCases.map((item) => (
                <div className="rounded-[32px] border border-border/70 bg-white/80 p-6 shadow-soft dark:bg-white/[0.03]" key={item.id}>
                  <p className="font-display text-[2rem] font-semibold leading-tight text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm font-medium text-brand">{item.court}</p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState {...emptyStateCopy.cases} />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
