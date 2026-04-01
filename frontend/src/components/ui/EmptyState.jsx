import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslatedText } from "@/hooks/useTranslatedText";

export function EmptyState({ actionLabel, description, onAction, title }) {
  const [translatedTitle, translatedDescription, translatedActionLabel] = useTranslatedText([title, description, actionLabel]);

  return (
    <Card className="flex min-h-[220px] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <Inbox className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold text-foreground">{translatedTitle}</h3>
        <p className="mx-auto max-w-md text-sm leading-7 text-muted-foreground">{translatedDescription}</p>
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction} type="button" variant="secondary">
          {translatedActionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
