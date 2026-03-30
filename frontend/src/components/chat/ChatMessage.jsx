import { Bot, User2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function ChatMessage({ answer, role, title }) {
  const isUser = role === "user";

  return (
    <Card className={isUser ? "rounded-[30px] bg-brand/10" : "rounded-[30px]"}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background dark:bg-white dark:text-slate-950">
          {isUser ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <p className="font-medium text-foreground">{isUser ? "You" : "LexGuard AI"}</p>
            {!isUser && title ? <Badge variant="brand">{title}</Badge> : null}
          </div>
          <p className="text-sm leading-7 text-muted-foreground">{answer}</p>
        </div>
      </div>
    </Card>
  );
}
