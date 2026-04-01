import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Languages, LoaderCircle } from "lucide-react";

import { useSession } from "@/context/SessionContext";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const languageOptions = [
  { value: "en", label: "English", nativeLabel: "English", description: "Default workspace copy" },
  { value: "hi", label: "Hindi", nativeLabel: "हिन्दी", description: "Fast Hindi interface" },
  { value: "ta", label: "Tamil", nativeLabel: "தமிழ்", description: "Fast Tamil interface" }
];

export function LanguageSwitcher() {
  const { session, updateLanguage, languageUpdating } = useSession();
  const pushToast = useUiStore((state) => state.pushToast);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const activeLanguage = languageOptions.find((option) => option.value === session.lang) || languageOptions[0];

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = async (nextLanguage) => {
    setOpen(false);
    if (nextLanguage === session.lang) {
      return;
    }

    try {
      await updateLanguage(nextLanguage);
    } catch (error) {
      pushToast({
        title: "Language update failed",
        description: "The workspace language could not be changed right now.",
        tone: "danger"
      });
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="group inline-flex h-12 items-center gap-3 rounded-full border border-border/70 bg-white/80 px-3.5 pr-4 text-left shadow-soft transition hover:border-brand/30 hover:bg-white/90 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/12 text-brand">
          <Languages className="h-4 w-4" />
        </span>
        <span className="min-w-[108px]">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Language</span>
          <span className="mt-0.5 flex items-center gap-2 text-sm font-medium text-foreground">
            {activeLanguage.nativeLabel}
            {languageUpdating ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-brand" /> : null}
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180 text-foreground")} />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-30 mt-3 w-[260px] rounded-[28px] border border-border/70 bg-white/92 p-2 shadow-soft backdrop-blur-2xl dark:bg-slate-950/88"
          role="menu"
        >
          <div className="px-3 pb-2 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">Workspace language</p>
            <p className="mt-1 text-sm text-muted-foreground">Instant UI updates with translated legal workflows.</p>
          </div>

          <div className="space-y-1">
            {languageOptions.map((option) => {
              const isActive = option.value === session.lang;

              return (
                <button
                  className={cn(
                    "flex w-full items-center justify-between rounded-[22px] px-3 py-3 text-left transition",
                    isActive
                      ? "bg-gradient-to-r from-brand/18 to-brand-secondary/12 text-foreground"
                      : "hover:bg-brand/8 text-foreground"
                  )}
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  role="menuitemradio"
                  type="button"
                >
                  <span>
                    <span className="block text-sm font-semibold">{option.nativeLabel}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border transition",
                      isActive ? "border-brand/30 bg-brand/12 text-brand" : "border-border/70 text-muted-foreground"
                    )}
                  >
                    {isActive ? <Check className="h-4 w-4" /> : option.label.slice(0, 2).toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
