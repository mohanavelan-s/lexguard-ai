import { Link, NavLink, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { platformStats } from "@/data/mock";
import { useSession } from "@/context/SessionContext";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#workflow" },
  { label: "Pricing", href: "/pricing" }
];

export function MarketingLayout() {
  const { session } = useSession();

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" to="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-secondary text-sm font-bold text-brand-foreground shadow-glow">
              LG
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">LexGuard AI</p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Legal intelligence</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white/70 hover:text-foreground dark:hover:bg-white/5",
                    isActive && "bg-white/80 text-foreground shadow-soft dark:bg-white/10"
                  )
                }
                key={item.href}
                to={item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to={session.authenticated ? "/dashboard" : "/login"}>
              <Button size="sm" variant="secondary">
                {session.authenticated ? "Open workspace" : "Sign in"}
              </Button>
            </Link>
            <Link className="hidden sm:block" to={session.authenticated ? "/legal-advisor" : "/register"}>
              <Button size="sm">{session.authenticated ? "Start analysis" : "Get started"}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border/50">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr,0.8fr] lg:px-8">
          <div className="space-y-4">
            <p className="font-display text-2xl font-semibold text-foreground">Built for clarity under pressure.</p>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              LexGuard AI blends workflow design, legal intelligence, and trust-building UX into a single cloud-ready
              product surface.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {platformStats.map((stat) => (
              <div className="rounded-3xl border border-border/60 bg-white/70 p-4 shadow-soft dark:bg-white/[0.03]" key={stat.label}>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 font-display text-3xl font-semibold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
