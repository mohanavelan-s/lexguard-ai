import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  BriefcaseBusiness,
  CreditCard,
  FileSearch,
  FileText,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  UserCircle2
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSession } from "@/context/SessionContext";
import { useTranslatedText } from "@/hooks/useTranslatedText";
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
  {
    label: "Document scanner",
    description: "Upload contracts and review clause-level risk.",
    href: "/scanner",
    icon: FileText
  },
  {
    label: "Case intelligence",
    description: "Search precedent, summaries, and outcomes.",
    href: "/cases",
    icon: FileSearch
  },
  {
    label: "Lawyer connect",
    description: "Find counsel and route issues to experts.",
    href: "/lawyers",
    icon: BriefcaseBusiness
  },
  {
    label: "Case lookup",
    description: "Track status and email updates to the user.",
    href: "/case-lookup",
    icon: ShieldAlert
  },
  {
    label: "Protect mode",
    description: "Emergency routines, SOS, and live safety tools.",
    href: "/protect",
    icon: Siren
  }
];

export function ProductLayout() {
  const location = useLocation();
  const { session, signOut } = useSession();
  const mobileNavOpen = useUiStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const currentPathLabel = appNav.find((item) => item.href === location.pathname)?.label || workspaceNav.find((item) => item.href === location.pathname)?.label || "Workspace";
  const currentPath = useTranslatedText(currentPathLabel);
  const appNavLabels = useTranslatedText(appNav.map((item) => item.label));
  const workspaceLabels = useTranslatedText(workspaceNav.map((item) => item.label));
  const workspaceDescriptions = useTranslatedText(workspaceNav.map((item) => item.description));
  const [brandSubhead, coreLabel, workflowsLabel, deploymentLabel, deploymentStatus, signOutLabel, signInLabel, joinLabel, workspaceLabel, accountLabel, loginLabel] = useTranslatedText([
    "Cloud workspace",
    "Core",
    "Workflows",
    "Cloud deployed and Railway-ready",
    "Live service",
    "Sign out",
    "Sign in",
    "Join",
    "LexGuard workspace",
    "Account",
    "Login"
  ]);

  const sidebar = (
    <div className="pretty-scrollbar flex h-full flex-col gap-10 overflow-y-auto rounded-[40px] border border-border/60 bg-white/76 p-7 shadow-soft backdrop-blur-2xl dark:bg-slate-950/40">
      <Link className="flex items-center gap-4 rounded-[28px] px-3 py-3" to="/">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-secondary text-sm font-bold text-brand-foreground shadow-glow">
          LG
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-foreground">LexGuard AI</p>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{brandSubhead}</p>
        </div>
      </Link>

      <div className="space-y-2">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{coreLabel}</p>
        <nav className="space-y-1">
          {appNav.map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-white/70 hover:text-foreground dark:hover:bg-white/5",
                    isActive && "bg-gradient-to-r from-brand to-brand-secondary text-brand-foreground shadow-glow hover:text-brand-foreground"
                  )
                }
                key={item.href}
                onClick={() => setMobileNavOpen(false)}
                to={item.href}
              >
                <Icon className="h-4 w-4" />
                {appNavLabels[index]}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{workflowsLabel}</p>
        <div className="space-y-2">
          {workspaceNav.map((item, index) => {
            const Icon = item.icon;

            return (
            <NavLink
              className={({ isActive }) =>
                cn(
                  "rounded-[24px] border border-border/70 px-4 py-4 text-left transition hover:border-brand/30 hover:bg-white/70 dark:hover:bg-white/5",
                  isActive && "border-brand/35 bg-brand/10 shadow-soft"
                )
              }
              key={item.href}
              onClick={() => setMobileNavOpen(false)}
              to={item.href}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{workspaceLabels[index]}</p>
                  <p className="text-xs leading-5 text-muted-foreground">{workspaceDescriptions[index]}</p>
                </div>
              </div>
            </NavLink>
          );
          })}
        </div>
      </div>

      <div className="mt-auto rounded-[30px] border border-border/70 bg-gradient-to-br from-brand/12 via-white/85 to-transparent p-5 dark:from-brand/15 dark:via-white/[0.02]">
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
            {signOutLabel}
          </button>
        ) : (
          <div className="mt-4 flex gap-2">
            <Link className="flex-1" to="/login">
              <Button className="w-full" size="sm" variant="secondary">
                {signInLabel}
              </Button>
            </Link>
            <Link className="flex-1" to="/register">
              <Button className="w-full" size="sm">
                {joinLabel}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1760px] gap-6 lg:grid-cols-[352px,minmax(0,1fr)] 2xl:gap-8">
        <aside className="hidden lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)]">{sidebar}</aside>
        <div className="space-y-6">
          <header className="flex items-center justify-between gap-4 rounded-[40px] border border-border/60 bg-white/78 px-5 py-5 shadow-soft backdrop-blur-2xl dark:bg-slate-950/40 md:px-7">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 text-foreground transition hover:border-brand/30 lg:hidden"
                onClick={() => setMobileNavOpen(true)}
                type="button"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{workspaceLabel}</p>
                <p className="font-display text-[2rem] font-semibold leading-none text-foreground md:text-[2.2rem]">{currentPath}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2.5 text-sm text-muted-foreground dark:bg-white/[0.03] xl:flex">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span>{deploymentLabel}</span>
                <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">{deploymentStatus}</span>
              </div>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              <ThemeToggle />
              <Link to={session.authenticated ? "/settings" : "/login"}>
                <Button size="sm" variant="secondary">
                  <UserCircle2 className="h-4 w-4" />
                  {session.authenticated ? accountLabel : loginLabel}
                </Button>
              </Link>
            </div>
          </header>

          <div className="px-1 pb-8 md:px-2 xl:px-4">
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
