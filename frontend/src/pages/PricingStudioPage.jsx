import { CheckCircle2, CreditCard, Sparkles } from "lucide-react";

import { PageTransition } from "@/components/layout/PageTransition";
import { PricingCard } from "@/components/marketing/PricingCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { billingHistory, planCards, pricingMatrix } from "@/data/mock";

function formatCurrency(value) {
  return value?.replace?.("â‚¹", "Rs. ") || value;
}

export default function PricingStudioPage() {
  return (
    <PageTransition className="space-y-8">
      <SectionHeading
        description="A premium SaaS-style pricing experience with clear packaging, billing confidence, and payment-ready UI."
        eyebrow="Pricing and billing"
        title="Simple plans, clear value, production-ready billing design"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        {planCards.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="rounded-[32px]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Feature comparison</p>
                <h3 className="font-display text-3xl font-semibold text-foreground">What each plan unlocks</h3>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-border/70">
              <div className="grid grid-cols-4 bg-foreground/5 text-sm font-semibold text-foreground">
                <div className="px-4 py-3">Capability</div>
                <div className="px-4 py-3">Free</div>
                <div className="px-4 py-3">Pro</div>
                <div className="px-4 py-3">Enterprise</div>
              </div>
              {pricingMatrix.map((row) => (
                <div className="grid grid-cols-4 border-t border-border/70 text-sm" key={row[0]}>
                  {row.map((cell) => (
                    <div className="px-4 py-4 text-muted-foreground" key={cell}>
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-[32px] bg-gradient-to-br from-brand/10 via-white/90 to-white/80 dark:via-slate-950/40 dark:to-slate-950/30">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment UI</p>
                  <h3 className="font-display text-3xl font-semibold text-foreground">Checkout preview</h3>
                </div>
              </div>

              <div className="grid gap-4">
                <InputField placeholder="Cardholder name" />
                <InputField placeholder="1234 1234 1234 1234" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField placeholder="MM / YY" />
                  <InputField placeholder="CVC" />
                </div>
              </div>

              <div className="rounded-[28px] border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Pro plan</span>
                  <span className="font-medium text-foreground">Rs. 1,499/month</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Stripe / Razorpay-ready frontend slot
                </div>
              </div>

              <Button className="w-full">Continue to secure payment</Button>
            </div>
          </Card>

          <Card className="rounded-[32px]">
            <div className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Billing activity</p>
                <h3 className="font-display text-3xl font-semibold text-foreground">Recent invoices</h3>
              </div>
              <div className="space-y-3">
                {billingHistory.map((invoice) => (
                  <div className="flex items-center justify-between rounded-3xl border border-border/70 bg-white/70 px-4 py-4 dark:bg-white/[0.03]" key={invoice.id}>
                    <div>
                      <p className="font-medium text-foreground">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{formatCurrency(invoice.amount)}</p>
                      <Badge variant="success">{invoice.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
