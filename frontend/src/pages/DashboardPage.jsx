import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { FileSearch, FileText, MessageSquareText, ShieldAlert, Siren, UserRoundSearch } from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PlanStatusCard } from "@/components/dashboard/PlanStatusCard";
import { WorkspaceCard } from "@/components/dashboard/WorkspaceCard";
import { PageTransition } from "@/components/layout/PageTransition";
import { EmptyState } from "@/components/ui/EmptyState";
import { InputField } from "@/components/ui/InputField";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
    <PageTransition className="space-y-8">
      <SectionHeading
        description={
          session.authenticated
            ? `Welcome back ${session.user?.name}. Your workspace is designed to turn legal complexity into clean operational decisions.`
            : "Explore a polished legal AI workspace with guided analytics, saved history, and billing-ready product states."
        }
        eyebrow="Workspace overview"
        title={session.user?.role === "lawyer" ? "Reviewer control center" : "Legal intelligence dashboard"}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr,0.9fr]">
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} meta={metric.meta} value={metric.value} />
          ))}
        </div>
        <PlanStatusCard authenticated={session.authenticated} role={session.user?.role} />
      </div>

      <section className="space-y-5">
        <SectionHeading
          description="Every core feature is now surfaced as a first-class SaaS workflow."
          eyebrow="Core platform"
          title="Launch the workflows"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaceCards.map((card) => (
            <WorkspaceCard description={card.description} href={card.href} icon={card.icon} key={card.href} title={card.title} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-5">
          <SectionHeading
            actions={<InputField className="w-full sm:w-[280px]" onChange={(event) => setSearch(event.target.value)} placeholder="Filter history..." value={search} />}
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

        <div className="space-y-5">
          <SectionHeading
            description="Bookmark high-value cases, references, and legal anchors to reuse them across workflows."
            eyebrow="Saved intelligence"
            title="Pinned cases"
          />
          {savedCases.length ? (
            <div className="grid gap-4">
              {savedCases.map((item) => (
                <div className="rounded-[30px] border border-border/70 bg-white/80 p-5 shadow-soft dark:bg-white/[0.03]" key={item.id}>
                  <p className="font-display text-2xl font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 text-sm font-medium text-brand">{item.court}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.note}</p>
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
