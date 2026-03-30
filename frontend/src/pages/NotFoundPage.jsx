import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function NotFoundPage() {
  return (
    <PageTransition className="flex min-h-[70vh] items-center justify-center">
      <Card className="max-w-xl rounded-[36px] text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">404</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-foreground">This route isn&apos;t part of the legal map.</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          The page you tried to open does not exist in the current frontend shell. Head back to the landing page or open the workspace.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button>Open workspace</Button>
          </Link>
        </div>
      </Card>
    </PageTransition>
  );
}
