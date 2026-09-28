import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Download, ExternalLink, Home, BriefcaseBusiness } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PlanningJour } from "@/components/PlanningJour";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHealth } from "@/lib/health-store";
import { planningDuJour } from "@/lib/planning";
import { seances } from "@/lib/seances";
import { lienGoogle, telechargerIcs } from "@/lib/calendar-export";
import type { DayContext, Profile } from "@/lib/health-types";
import { useState } from "react";
import { dayContext } from "@/lib/day-context";

export const Route = createFileRoute("/planning")({
  head: () => ({
    meta: [
      { title: "Emploi du temps | Bouge au bureau" },
      { name: "description", content: "Planifiez vos séances et pauses actives de la journée et importez-les dans Google Agenda." },
      { property: "og:title", content: "Mon emploi du temps anti-sédentarité" },
      { property: "og:description", content: "Horaires planifiables et import dans Google Agenda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanningPage,
});

const cles = { matin: "seanceMatin", midi: "seanceMidi", soir: "seanceSoir" } as const;

function PlanningPage() {
  const { data, updateProfile } = useHealth();
  const p = data.profile;
  const [view, setView] = useState<DayContext | null>(null);
  const context = view ?? dayContext(p);
  const items = planningDuJour(p, context);

  const importer = () => {
    telechargerIcs([
      ...planningDuJour(p, "travail").map((item) => ({ ...item, calendarContext: "travail" as const })),
      ...(p.weekendAtHome ? planningDuJour(p, "domicile").map((item) => ({ ...item, calendarContext: "domicile" as const })) : []),
    ]);
    toast.success("Fichier prêt : ouvrez-le pour l'ajouter à Google Agenda", {
      action: { label: "Ouvrir Google Agenda", onClick: () => window.open("https://calendar.google.com/calendar/r/settings/export", "_blank") },
    });
  };

  return (
    <AppShell title="Emploi du temps" subtitle="Calez vos pauses actives dans votre journée">
      <div className="space-y-5">
        <div className="flex rounded-xl bg-muted p-1" role="group" aria-label="Horaires à afficher">
          <Button className="flex-1 rounded-lg" variant={context === "travail" ? "default" : "ghost"} aria-pressed={context === "travail"} onClick={() => setView("travail")}><BriefcaseBusiness className="size-4" /> Travail</Button>
          <Button className="flex-1 rounded-lg" variant={context === "domicile" ? "default" : "ghost"} aria-pressed={context === "domicile"} onClick={() => setView("domicile")}><Home className="size-4" /> Domicile</Button>
        </div>
        <section className="rounded-3xl bg-card p-5 shadow-card">
          <h2 className="text-lg font-bold">Mes horaires · {context === "travail" ? "travail" : "domicile"}</h2>
          {context === "domicile" && <div className="mt-4 flex items-center justify-between gap-3"><Label htmlFor="weekend">Domicile le week-end</Label><Switch id="weekend" checked={p.weekendAtHome} onCheckedChange={(value) => updateProfile({ weekendAtHome: value })} /></div>}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ws">Début de journée</Label>
              <Input id="ws" type="time" value={context === "travail" ? p.workStart : p.homeStart} onChange={(e) => updateProfile(context === "travail" ? { workStart: e.target.value } : { homeStart: e.target.value })} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="we">Fin de journée</Label>
              <Input id="we" type="time" value={context === "travail" ? p.workEnd : p.homeEnd} onChange={(e) => updateProfile(context === "travail" ? { workEnd: e.target.value } : { homeEnd: e.target.value })} className="mt-1 rounded-xl" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="freq">Une pause courte toutes les (minutes)</Label>
              <Input id="freq" type="number" min={20} max={120} step={5} value={context === "travail" ? p.sedentaryAlertMinutes : p.homeAlertMinutes}
                onChange={(e) => updateProfile(context === "travail" ? { sedentaryAlertMinutes: Math.max(20, Number(e.target.value) || 45) } : { homeAlertMinutes: Math.max(20, Number(e.target.value) || 60) })}
                className="mt-1 rounded-xl" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {seances.map((s) => {
              const k = cles[s.moment];
              const h = p[k];
              return (
                <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
                  <Switch checked={h !== ""} onCheckedChange={(on) => updateProfile({ [k]: on ? s.heureDefaut : "" } as Partial<Profile>)} aria-label={s.titre} />
                  <span className="flex-1 text-sm font-semibold">{s.titre}</span>
                  {h !== "" && (
                    <Input type="time" value={h} onChange={(e) => updateProfile({ [k]: e.target.value } as Partial<Profile>)} className="h-9 w-28 rounded-xl" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <PlanningJour context={context} />

        <section className="rounded-3xl bg-sun-gradient p-5 text-sun-foreground shadow-float">
          <h2 className="flex items-center gap-2 text-lg font-bold"><CalendarPlus className="size-5" /> Importer dans Google Agenda</h2>
          <p className="mt-1 text-sm">Créneaux de travail du lundi au vendredi{p.weekendAtHome ? " et créneaux à domicile le week-end" : ""}, avec rappel à l'heure. Les changements ponctuels du jour ne sont pas exportés.</p>
          <Button onClick={importer} className="mt-4 w-full rounded-2xl" size="lg" variant="secondary">
            <Download className="size-4" /> Importer tous mes horaires
          </Button>
          <p className="mt-2 text-xs">Sur téléphone, ouvrez le fichier téléchargé. Sur ordinateur : Google Agenda → Paramètres → Importer.</p>
        </section>

        <section className="rounded-3xl bg-card p-5 shadow-card">
          <h2 className="text-base font-bold">Ou ajoutez un créneau à la fois · {context === "travail" ? "semaine" : "week-end"}</h2>
          <ul className="mt-3 space-y-2">
            {items.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                <span><span className="font-mono font-bold">{c.heure}</span> · {c.titre}</span>
                <a href={lienGoogle({ ...c, calendarContext: context })} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-semibold text-primary">
                  Ajouter <ExternalLink className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
