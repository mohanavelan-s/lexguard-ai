export const platformStats = [
  { label: "Queries analyzed", value: "12.8k" },
  { label: "Risk checks automated", value: "96%" },
  { label: "Median response time", value: "4.2s" },
  { label: "Human review SLA", value: "< 3 hrs" }
];

export const landingFeatures = [
  {
    title: "AI legal interpretation",
    description:
      "Transform plain-language legal questions into structured guidance with confidence, intent classification, and actionable next steps."
  },
  {
    title: "Clause and risk analysis",
    description:
      "Upload agreements and instantly surface clause-level risk scoring, risk heatmaps, and suggested negotiation language."
  },
  {
    title: "Case intelligence workflow",
    description:
      "Track precedent, saved cases, and workflow approvals from a single dashboard designed for founders, freelancers, and operators."
  },
  {
    title: "Human review loop",
    description:
      "Escalate sensitive legal output to approved reviewers, monitor review queues, and keep a complete audit trail for decisions."
  }
];

export const steps = [
  {
    title: "Capture the legal signal",
    description: "Ask a question, upload a document, or start from a reusable scenario prompt."
  },
  {
    title: "Score the risk instantly",
    description: "LexGuard classifies urgency, interprets likely exposure, and summarizes the issue in business-friendly language."
  },
  {
    title: "Move with confidence",
    description: "Follow suggested actions, escalate to a reviewer, save the query, or share a polished export."
  }
];

export const testimonials = [
  {
    name: "Aditi Menon",
    role: "Startup Operations Lead",
    quote:
      "LexGuard feels like the missing layer between raw legal text and the decisions my team actually needs to make every day."
  },
  {
    name: "Rahul Verma",
    role: "Independent Consultant",
    quote:
      "The risk cards and action recommendations make it look like a real SaaS product, not just another chatbot wrapped in a dashboard."
  },
  {
    name: "Nikhil S",
    role: "Hackathon Judge",
    quote:
      "The polished UX changed the whole story. It reads like a deployable legal intelligence platform, not a prototype."
  }
];

export const planCards = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    badge: "Starter",
    description: "For demos, lightweight legal discovery, and limited usage.",
    features: ["20 AI legal queries", "Case lookup access", "Basic document scan", "Community support"],
    cta: "Start free"
  },
  {
    name: "Pro",
    price: "₹1,499",
    period: "/month",
    badge: "Most popular",
    description: "For individuals and startups who need faster guidance and saved workflows.",
    features: [
      "Unlimited AI legal workspace",
      "Saved cases and exports",
      "Priority queue review requests",
      "Advanced usage analytics"
    ],
    cta: "Upgrade to Pro",
    featured: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    badge: "Scale",
    description: "For teams that need role controls, custom workflows, and human review ops.",
    features: ["Reviewer dashboard", "Custom onboarding", "SLA support", "API and compliance support"],
    cta: "Talk to sales"
  }
];

export const pricingMatrix = [
  ["Monthly AI legal analysis", "20 runs", "Unlimited", "Unlimited"],
  ["Saved legal history", "Basic", "Full", "Full + audit trail"],
  ["Human reviewer workflows", "No", "Add-on", "Included"],
  ["Billing & analytics", "Basic", "Advanced", "Team-wide"],
  ["Custom integrations", "No", "No", "Yes"]
];

export const chatSuggestions = [
  "My landlord wants me to vacate without written notice. What should I ask for?",
  "A contract includes a non-compete clause. How risky is it for a freelancer?",
  "My employer delayed salary for two months. What are my first legal options?",
  "A friend posted false allegations online. Is this defamation?"
];

export const starterQueries = [
  {
    title: "Rental dispute",
    body: "Summarize tenant rights, notice requirements, and the safest next step."
  },
  {
    title: "Employment issue",
    body: "Explain the likely employment law angle, risk severity, and negotiation strategy."
  },
  {
    title: "Police interaction",
    body: "Highlight rights during arrest or detention and mention escalation options."
  }
];

export const sampleHistory = [
  {
    id: "history-1",
    title: "Rental notice without written agreement",
    category: "Property rights",
    risk: "medium",
    createdAt: Date.now() - 1000 * 60 * 50
  },
  {
    id: "history-2",
    title: "Termination clause review",
    category: "Employment law",
    risk: "high",
    createdAt: Date.now() - 1000 * 60 * 60 * 9
  },
  {
    id: "history-3",
    title: "False allegations on social media",
    category: "Defamation",
    risk: "medium",
    createdAt: Date.now() - 1000 * 60 * 60 * 26
  }
];

export const savedCases = [
  {
    id: "case-1",
    title: "Kesavananda Bharati v. State of Kerala",
    court: "Supreme Court of India",
    note: "Referenced for constitutional structure and rights framing."
  },
  {
    id: "case-2",
    title: "Maneka Gandhi v. Union of India",
    court: "Supreme Court of India",
    note: "Useful for liberty and due process narratives."
  }
];

export const mockAnalytics = {
  activity: [
    { label: "High-risk queries this week", value: 14, tone: "danger" },
    { label: "Contracts scanned", value: 41, tone: "warning" },
    { label: "Reviewer approvals", value: 19, tone: "success" },
    { label: "Conversion to paid plan", value: 32, tone: "brand" }
  ],
  trend: [
    { day: "Mon", value: 42 },
    { day: "Tue", value: 58 },
    { day: "Wed", value: 63 },
    { day: "Thu", value: 81 },
    { day: "Fri", value: 73 },
    { day: "Sat", value: 48 },
    { day: "Sun", value: 39 }
  ]
};

export const billingHistory = [
  { id: "inv-2031", amount: "₹1,499", date: "2026-03-12", status: "Paid" },
  { id: "inv-1984", amount: "₹1,499", date: "2026-02-12", status: "Paid" }
];

export const emptyStateCopy = {
  history: {
    title: "No saved history yet",
    description: "New legal analyses will appear here automatically after your first query."
  },
  cases: {
    title: "No cases saved",
    description: "Bookmark case intelligence from search and case lookup to build a reusable workspace."
  }
};
