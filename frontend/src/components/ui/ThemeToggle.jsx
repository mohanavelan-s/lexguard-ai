import { MoonStar, SunMedium } from "lucide-react";

import { useUiStore } from "@/store/ui-store";

export function ThemeToggle() {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <button
      aria-label="Toggle theme"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-white/70 text-foreground transition hover:-translate-y-0.5 hover:border-brand/30 dark:bg-white/[0.05]"
      onClick={toggleTheme}
      type="button"
    >
      {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </button>
  );
}
