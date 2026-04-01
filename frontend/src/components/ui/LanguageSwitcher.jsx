import { Languages } from "lucide-react";

import { useSession } from "@/context/SessionContext";

const languageOptions = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "ta", label: "Tamil" }
];

export function LanguageSwitcher() {
  const { session, updateLanguage } = useSession();

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-3 py-2 text-sm text-muted-foreground dark:bg-white/[0.03]">
      <Languages className="h-4 w-4 text-brand" />
      <select
        className="min-w-[96px] bg-transparent text-sm text-foreground outline-none"
        onChange={(event) => updateLanguage(event.target.value)}
        value={session.lang || "en"}
      >
        {languageOptions.map((option) => (
          <option className="text-slate-950" key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
