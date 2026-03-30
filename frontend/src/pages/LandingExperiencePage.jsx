import { ArrowRight, CheckCircle2, MessageSquareQuote } from "lucide-react";
import { Link } from "react-router-dom";

import { FeatureCard } from "@/components/marketing/FeatureCard";
import { PricingCard } from "@/components/marketing/PricingCard";
import { PremiumHeroShowcase } from "@/components/marketing/PremiumHeroShowcase";
import { StepCard } from "@/components/marketing/StepCard";
import { TestimonialCard } from "@/components/marketing/TestimonialCard";
import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { landingFeatures, planCards, steps, testimonials } from "@/data/mock";

export default function LandingExperiencePage() {
  return (
    <PageTransition className="space-y-24 pb-24">
      <PremiumHeroShowcase />

      <section className="page-shell" id="features">
        <SectionHeading
          description="Every part of the interface is designed to make complex legal workflows feel trustworthy, calm, and operationally useful."
          eyebrow="Product surface"
          title="A premium UI for legal questions, risk, and action"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {landingFeatures.map((feature, index) => (
            <FeatureCard description={feature.description} index={index} key={feature.title} title={feature.title} />
          ))}
        </div>
      </section>

      <section className="page-shell" id="workflow">
        <SectionHeading
          description="From intake to action, the workflow is tuned for confidence, speed, and human-readable clarity."
          eyebrow="Workflow"
          title="How LexGuard works in three clean steps"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <StepCard description={step.description} index={index} key={step.title} title={step.title} />
          ))}
        </div>
      </section>

      <section className="page-shell">
        <SectionHeading
          description="Mock testimonials that tell the right story for judges, recruiters, and early users."
          eyebrow="Social proof"
          title="Built to impress both demos and real operators"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard item={item} key={item.name} />
          ))}
        </div>
      </section>

      <section className="page-shell">
        <SectionHeading
          actions={
            <Link to="/pricing">
              <Button variant="secondary">
                View detailed pricing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
          description="Structured pricing that makes the product feel commercially credible from day one."
          eyebrow="Pricing"
          title="Plans that already feel production-ready"
        />
        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {planCards.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </section>

      <section className="page-shell">
        <div className="overflow-hidden rounded-[36px] border border-border/60 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-secondary p-8 text-white shadow-glow sm:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr,0.8fr] lg:items-center">
            <div className="space-y-5">
              <Badge className="border-white/15 bg-white/10 text-white" variant="neutral">
                Ready for hackathons, portfolios, and launch demos
              </Badge>
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                Make your legal AI platform feel like a startup-grade product.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/75">
                Move from "interesting concept" to "this looks deployable" with a frontend that communicates trust,
                structure, and premium product maturity.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg">Get started</Button>
                </Link>
                <Link to="/legal-advisor">
                  <Button size="lg" variant="secondary">
                    Open the AI workspace
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="font-medium">Modern legal chat experience</p>
                    <p className="mt-1 text-sm leading-7 text-white/70">
                      Query intake, interpretation, risk class, and next actions in one polished response flow.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <MessageSquareQuote className="mt-1 h-5 w-5 text-sky-300" />
                  <div>
                    <p className="font-medium">Built to tell a better product story</p>
                    <p className="mt-1 text-sm leading-7 text-white/70">
                      The UI reinforces the value of the backend instead of competing with it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
