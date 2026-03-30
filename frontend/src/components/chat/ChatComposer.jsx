import { Mic, SendHorizonal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/InputField";

export function ChatComposer({ input, listening, onChange, onSubmit, onVoice, suggestions }) {
  return (
    <div className="space-y-4 rounded-[30px] border border-border/70 bg-white/80 p-4 shadow-soft dark:bg-white/[0.03]">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            className="rounded-full border border-border/70 px-3 py-2 text-left text-xs font-medium text-muted-foreground transition hover:border-brand/30 hover:bg-brand/10 hover:text-foreground"
            key={suggestion}
            onClick={() => onChange(suggestion)}
            type="button"
          >
            {suggestion}
          </button>
        ))}
      </div>
      <TextAreaField
        className="min-h-[130px] border-none bg-transparent px-1 py-1 shadow-none focus:ring-0"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Describe your legal issue in plain language. LexGuard will interpret it, score the risk, and suggest next actions."
        value={input}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-brand" />
          NLP interpretation, risk scoring, and action recommendations
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onVoice} type="button" variant="secondary">
            <Mic className="h-4 w-4" />
            {listening ? "Listening..." : "Voice"}
          </Button>
          <Button onClick={onSubmit} type="button">
            <SendHorizonal className="h-4 w-4" />
            Analyze query
          </Button>
        </div>
      </div>
    </div>
  );
}
