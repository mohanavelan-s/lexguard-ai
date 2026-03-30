import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, CreditCard, LogOut, Menu, MessageSquareText, Settings, ShieldCheck, Sparkles, UserCircle2 } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSession } from "@/context/SessionContext";
import { cn, initials } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const appNav = [
  { label: "Dashboard", href: "/dashboard", icon: Sparkles },
  { label: "AI Workspace", href: "/legal-advisor", icon: MessageSquareText },
  { label: "Pricing", href: "/pricing", icon: CreditCard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings }
];

const workspaceNav = [
  { label: "Scanner", href: "/scanner" },
  { label: "Cases", href: "/cases" },
  { label: "Lawyers", href: "/lawyers" },
  { label: "Case lookup", href: "/case-lookup" },
  { label: "Protect", href: "/protect" }
];

export function ProductLayout() {
  const location = useLocation();
  const { session, signOut } = useSession();
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const currentPath = appNav.find((item) => item.href === location.pathname)?.label || "Workspace";

  const sidebar = (
    <div className="flex h-full flex-col gap-8 rounded-[32px] border border-border/60 bg-white/80 p-4 shadow-soft backdrop-blur-2xl dark:bg-slate-950/40">
      <Link className="flex items-center gap-3 rounded-3xl px-3 py-2" to="/">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-secondary text-sm font-bold text-brand-foreground shadow-glow">
          LG
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-foreground">LexGuard AI</p>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Cloud workspace</p>
        </div>
      </Link>

      <div className="space-y-2">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Core</p>
        <nav className="space-y-1">
          {appNav.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-white/70 hover:text-foreground dark:hover:bg-white/5",
                    isActive && "bg-foreground text-background shadow-soft hover:text-background dark:bg-white dark:text-slate-950"
                  )
                }
                key={item.href}
                onClick={() => setMobileNavOpen(false)}
                to={item.href}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Workflows</p>
        <div className="grid grid-cols-2 gap-2">
          {workspaceNav.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  "rounded-2xl border border-border/70 px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition hover:border-brand/30 hover:bg-white/70 hover:text-foreground dark:hover:bg-white/5",
                  isActive && "border-brand/30 bg-brand/10 text-foreground"
                )
              }
              key={item.href}
              onClick={() => setMobileNavOpen(false)}
              to={item.href}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-[28px] border border-border/70 bg-gradient-to-br from-brand/12 via-white/80 to-transparent p-4 dark:from-brand/15 dark:via-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/90 text-sm font-semibold text-background">
            {initials(session.user?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{session.user?.name || "Guest mode"}</p>
            <p className="truncate text-xs uppercase tracking-[0.18em] text-muted-foreground">{session.user?.role || "Explore"}</p>
          </div>
        </div>
        {session.authenticated ? (
          <button
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            onClick={signOut}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        ) : (
          <div className="mt-4 flex gap-2">
            <Link className="flex-1" to="/login">
              <Button className="w-full" size="sm" variant="secondary">
                Sign in
              </Button>
            </Link>
            <Link className="flex-1" to="/register">
              <Button className="w-full" size="sm">
                Join
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px,1fr]">
        <aside className="hidden lg:block">{sidebar}</aside>
        <div className="space-y-4">
          <header className="flex items-center justify-between gap-4 rounded-[32px] border border-border/60 bg-white/80 px-4 py-4 shadow-soft backdrop-blur-2xl dark:bg-slate-950/40">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 text-foreground transition hover:border-brand/30 lg:hidden"
                onClick={() => setMobileNavOpen(true)}
                type="button"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">LexGuard workspace</p>
                <p className="font-display text-2xl font-semibold text-foreground">{currentPath}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2 text-sm text-muted-foreground dark:bg-white/[0.03] sm:flex">
                <ShieldCheck className="h-4 w-4 text-success" />
                Cloud deployed and Railway-ready
              </div>
              <ThemeToggle />
              <Link to={session.authenticated ? "/settings" : "/login"}>
                <Button size="sm" variant="secondary">
                  <UserCircle2 className="h-4 w-4" />
                  {session.authenticated ? "Account" : "Login"}
                </Button>
              </Link>
            </div>
          </header>

          <div className="rounded-[32px] border border-border/60 bg-white/70 p-5 shadow-soft backdrop-blur-2xl dark:bg-slate-950/30 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-950/40 p-4 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
          >
            <motion.div
              animate={{ x: 0 }}
              className="h-full max-w-sm"
              initial={{ x: -24 }}
              onClick={(event) => event.stopPropagation()}
              transition={{ duration: 0.25 }}
            >
              {sidebar}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
