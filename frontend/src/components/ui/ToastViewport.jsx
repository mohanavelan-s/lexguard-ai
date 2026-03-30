import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const toneMap = {
  neutral: { icon: Info, className: "border-border/70 bg-white/90 text-foreground dark:bg-slate-950/85" },
  success: { icon: CheckCircle2, className: "border-success/20 bg-success/10 text-success-foreground" },
  warning: { icon: AlertTriangle, className: "border-warning/20 bg-warning/10 text-warning-foreground" },
  danger: { icon: XCircle, className: "border-danger/20 bg-danger/10 text-danger-foreground" }
};

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto flex w-full max-w-3xl flex-col gap-3 px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const tone = toneMap[toast.tone] || toneMap.neutral;
          const Icon = tone.icon;

          return (
            <motion.button
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-3xl border px-4 py-4 text-left shadow-soft backdrop-blur-xl",
                tone.className
              )}
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              key={toast.id}
              onClick={() => dismissToast(toast.id)}
              type="button"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? <p className="text-sm opacity-80">{toast.description}</p> : null}
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
