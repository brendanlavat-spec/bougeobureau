import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, CalendarClock, Dumbbell, Settings, Shield, Timer, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { ConsentGate } from "./ConsentGate";
import { SedentaryWatcher } from "./SedentaryWatcher";

const nav = [
  { to: "/", label: "Pauses", icon: Timer, pastille: "bg-secondary text-primary" },
  { to: "/seances", label: "Séances", icon: CalendarClock, pastille: "bg-coral-soft text-coral" },
  { to: "/planning", label: "Agenda", icon: CalendarDays, pastille: "bg-azur-soft text-azur" },
  { to: "/progression", label: "Progression", icon: Trophy, pastille: "bg-sun-soft text-sun" },
  { to: "/exercices", label: "Exercices", icon: Dumbbell, pastille: "bg-sun-soft text-sun" },
] as const;

const navSecondaire = [
  { to: "/reglages", label: "Réglages", icon: Settings, pastille: "bg-azur-soft text-azur" },
  { to: "/confidentialite", label: "Données", icon: Shield, pastille: "bg-coral-soft text-coral" },
] as const;

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <ConsentGate>
      <SedentaryWatcher />
      <div className="min-h-screen bg-background pb-24 md:pb-0 md:pl-56">
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:inset-y-0 md:right-auto md:w-56 md:border-t-0 md:border-r">
          <div className="hidden px-6 pt-8 pb-6 md:block">
            <img src={logo} alt="Logo Bouge au bureau" className="size-12 rounded-2xl shadow-float" />
            <p className="mt-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Anti-sédentarité</p>
            <p className="mt-1 text-lg font-bold text-foreground">Bouge au bureau</p>
          </div>
          <div className="hidden flex-col gap-1.5 px-3 py-2 md:flex">
            {[...nav, ...navSecondaire].map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex flex-none flex-row items-center gap-3 rounded-2xl px-3 py-2 transition-transform active:scale-95",
                    !active && "opacity-80 hover:opacity-100",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl transition-colors",
                      active ? item.pastille + " shadow-card" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
                  </span>
                  <span className={cn("text-sm", active ? "text-foreground" : "text-muted-foreground")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Barre du bas — mobile uniquement */}
          <div className="mx-auto flex w-full max-w-3xl items-stretch justify-between px-2 py-2 md:hidden">
            {nav.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex flex-1 flex-col items-center gap-1.5 rounded-2xl px-1 py-2 transition-transform active:scale-95",
                    !active && "opacity-80 hover:opacity-100",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl transition-colors",
                      active ? item.pastille + " shadow-card" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 1.9} />
                  </span>
                  <span className={cn("text-[11px] font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <header className="relative overflow-hidden bg-hero-gradient px-5 pt-10 pb-16 text-primary-foreground">
          <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10" aria-hidden />
          <div className="pointer-events-none absolute top-14 right-24 size-14 rounded-full bg-sun/30 blur-md" aria-hidden />
          <div className="pointer-events-none absolute -bottom-8 right-4 size-24 rounded-full bg-coral/25 blur-lg" aria-hidden />
          {/* Accès Réglages / Données — mobile uniquement */}
          <div className="absolute top-4 right-4 flex gap-2 md:hidden">
            {navSecondaire.map((item) => {
              const active = pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-transform active:scale-95",
                    active && "bg-white/30",
                  )}
                >
                  <Icon className="size-5" strokeWidth={2} />
                </Link>
              );
            })}
          </div>
          <div className="relative mx-auto w-full max-w-4xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur md:hidden">
              <img src={logo} alt="" className="size-5 rounded-md" />
              <span className="text-xs font-bold tracking-widest uppercase">Bouge au bureau</span>
            </span>
            <h1 className="text-3xl font-bold">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-lg text-sm opacity-85">{subtitle}</p> : null}
          </div>
        </header>

        <main className="relative z-10 mx-auto -mt-10 w-full max-w-4xl px-4 pb-10">{children}</main>
      </div>
    </ConsentGate>
  );
}
