import { CalendarDays, Coffee, MoonStar, Sun, Sunrise } from "lucide-react";
import { useEffect, useState } from "react";
import { useHealth } from "@/lib/health-store";
import { planningDuJour, toMin } from "@/lib/planning";
import { contextHours, dayContext } from "@/lib/day-context";
import type { DayContext } from "@/lib/health-types";
import { cn } from "@/lib/utils";

const icones = { matin: Sunrise, midi: Sun, soir: MoonStar } as const;
const couleurs = {
  matin: "bg-sun-soft text-sun",
  midi: "bg-azur-soft text-azur",
  soir: "bg-coral-soft text-coral",
} as const;

export function PlanningJour({ context }: { context?: DayContext }) {
  const { data } = useHealth();
  const activeContext = context ?? dayContext(data.profile);
  const hours = contextHours(data.profile, activeContext);
  const items = planningDuJour(data.profile, activeContext);
  const [maintenant, setMaintenant] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setMaintenant(d.getHours() * 60 + d.getMinutes());
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);
  const prochainId = maintenant === null ? null : items.find((i) => toMin(i.heure) >= maintenant)?.id;

  return (
    <section className="rounded-3xl bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
          <CalendarDays className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-card-foreground">Mon emploi du temps du jour</h2>
          <p className="text-xs text-muted-foreground">
             {activeContext === "travail" ? "Travail" : "Domicile"} · séances et pauses actives, de {hours.start} à {hours.end}
          </p>
        </div>
      </div>

      <ol className="relative mt-5 space-y-2 border-l-2 border-border pl-5">
        {items.map((i) => {
          const passe = maintenant !== null && toMin(i.heure) + i.dureeMin < maintenant;
          const Icon = i.moment ? icones[i.moment] : Coffee;
          return (
            <li key={i.id} className={cn("relative flex items-center gap-3 rounded-2xl p-2", i.id === prochainId && "bg-secondary", passe && "opacity-50")}>
              <span className="absolute -left-[27px] size-3 rounded-full border-2 border-card bg-primary" />
              <span className="w-12 font-mono text-sm font-bold text-foreground">{i.heure}</span>
              <span className={cn("flex size-8 items-center justify-center rounded-xl", i.moment ? couleurs[i.moment] : "bg-muted text-muted-foreground")}>
                <Icon className="size-4" />
              </span>
              <span className="flex-1">
                <span className={cn("block text-sm", i.type === "seance" ? "font-bold" : "font-medium")}>{i.titre}</span>
                <span className="text-xs text-muted-foreground">{i.type === "seance" ? `${i.dureeMin} min et plus` : "2-3 min"}</span>
              </span>
              {i.id === prochainId && <span className="text-xs font-semibold text-primary">À venir</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
