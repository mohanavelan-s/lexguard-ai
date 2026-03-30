import { motion } from "framer-motion";

import { Card } from "@/components/ui/Card";

export function FeatureCard({ description, index, title }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 18 }} transition={{ delay: index * 0.06, duration: 0.3 }}>
      <Card className="h-full rounded-[30px]">
        <div className="flex h-full flex-col gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-sm font-semibold text-brand">
            0{index + 1}
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
            <p className="text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
