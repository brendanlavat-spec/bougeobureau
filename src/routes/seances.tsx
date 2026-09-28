import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Clock, Sunrise, Sun, MoonStar, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SeanceSurMesure } from "@/components/SeanceSurMesure";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHealth, todayIso, localDay } from "@/lib/health-store";
import { seances, seanceDuMoment, type Seance } from "@/lib/seances";
import { cn } from "@/lib/utils";
import { dayContext } from "@/lib/day-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/seances")({
  head: () => ({
    meta: [
      { title: "Séances du jour | Bouge au bureau" },
      { name: "description", content: "Trois séances quotidiennes planifiables — matin aérobie, midi et soir — pour mobiliser toutes les articulations et tous les muscles." },
      { property: "og:title", content: "Séances du jour" },
      { property: "og:description", content: "Planifiez vos séances matin, midi et soir dans votre emploi du temps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SeancesPage,
});

const momentIcon = { matin: Sunrise, midi: Sun, soir: MoonStar } as const;
const momentPastille = {
  matin: "bg-sun-soft text-sun",
  midi: "bg-azur-soft text-azur",
  soir: "bg-coral-soft text-coral",
} as const;

function CarteSeance({ seance }: { seance: Seance }) {
  const { data, updateProfile, logBreak } = useHealth();
  const p = data.profile;
  const key = seance.moment === "matin" ? "seanceMatin" : seance.moment === "midi" ? "seanceMidi" : "seanceSoir";
  const heure = p[key];
  const active = heure !== "";
  const Icon = momentIcon[seance.moment];
  const today = todayIso();
  const faite = data.breaks.some((b) => b.exerciceId === `seance-${seance.id}` && localDay(b.at) === today);
  const estDuMoment = seanceDuMoment().id === seance.id;

  const toggle = (on: boolean) => {
    updateProfile({ [key]: on ? seance.heureDefaut : "" });
    toast.success(on ? `Séance « ${seance.titre} » planifiée à ${seance.heureDefaut}` : `Séance « ${seance.titre} » retirée de votre emploi du temps`);
  };

  return (
    <article className={cn("rounded-3xl bg-card p-5 shadow-card", estDuMoment && "ring-2 ring-primary")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("flex size-11 items-center justify-center rounded-2xl", momentPastille[seance.moment])}>
            <Icon className="size-5" strokeWidth={2.2} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-card-foreground">{seance.titre}</h3>
            <p className="text-xs text-muted-foreground">
              {seance.dureeMin} à {seance.dureeMax} min · Intensité {seance.intensite.toLowerCase()}
            </p>
          </div>
        </div>
        {estDuMoment && <Badge className="rounded-full">C'est le moment</Badge>}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{seance.accroche}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-muted/60 p-3">
        <Label htmlFor={`heure-${seance.id}`} className="flex items-center gap-1.5 text-sm font-semibold">
          <CalendarClock className="size-4 text-muted-foreground" /> Dans mon emploi du temps
        </Label>
        <Switch id={`heure-${seance.id}`} checked={active} onCheckedChange={toggle} />
        {active && (
          <Input
            type="time"
            value={heure}
            onChange={(e) => updateProfile({ [key]: e.target.value })}
            className="h-9 w-28 rounded-xl"
            aria-label={`Heure de la séance ${seance.titre}`}
          />
        )}
      </div>

      <ol className="mt-4 space-y-3">
        {seance.blocs.map((b, i) => (
          <li key={b.titre} className="flex gap-3">
            <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", momentPastille[seance.moment])}>
              {i + 1}
            </span>
            <div>
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-card-foreground">
                {b.titre}
                <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                  <Clock className="size-3" /> {b.duree}
                </span>
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{b.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-2xl bg-accent/50 p-3 text-xs text-accent-foreground">{seance.benefice}</p>

      <button
        type="button"
        disabled={faite}
        onClick={() => {
          logBreak(`seance-${seance.id}`);
          toast.success(`Bravo, séance « ${seance.titre} » terminée !`);
        }}
        className={cn(
          "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-transform active:scale-95",
          faite ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground shadow-card",
        )}
      >
        <Check className="size-4" />
        {faite ? "Séance faite aujourd'hui" : "J'ai fait cette séance"}
      </button>
    </article>
  );
}

function SeancesPage() {
  const { data, logBreak } = useHealth();
  const home = dayContext(data.profile) === "domicile";
  const faiteDomicile = data.breaks.some((b) => b.exerciceId === "seance-domicile" && localDay(b.at) === todayIso());
  return (
    <AppShell
      title="Séances du jour"
      subtitle="Trois rendez-vous à caler dans votre emploi du temps : chaque séance mobilise toutes les articulations et tous les grands muscles."
    >
      <section className="space-y-4">
        <div className="rounded-3xl bg-sun-gradient p-5 text-sun-foreground shadow-float">
          <p className="text-sm font-semibold">Le matin, on mise sur l'aérobie : marche dynamique, cardio doux et renforcement pour bien lancer la journée. Le midi et le soir complètent avec mobilité, renforcement et étirements.</p>
        </div>
        <SeanceSurMesure />
        {home && <article className="rounded-2xl bg-card p-5 shadow-card">
          <Badge variant="secondary">Domicile · 25 min</Badge>
          <h2 className="mt-3 text-xl font-bold">Bouger un peu plus aujourd'hui</h2>
          <p className="mt-2 text-sm text-muted-foreground">Un circuit souple, idéal pour profiter du week-end sans pression.</p>
          <ol className="mt-4 space-y-2 text-sm text-foreground">
            <li><strong>8 min</strong> · Marche active dehors ou dans la maison, à votre rythme.</li>
            <li><strong>7 min</strong> · Rotations des épaules, hanches et chevilles, puis squats sur chaise et montées sur pointes de pieds.</li>
            <li><strong>7 min</strong> · Marche plus vive ou escaliers, puis équilibre sur une jambe près d'un appui.</li>
            <li><strong>3 min</strong> · Retour au calme, étirements doux et respiration.</li>
          </ol>
          <Button className="mt-5 w-full" disabled={faiteDomicile} onClick={() => { logBreak("seance-domicile"); toast.success("Bravo pour cette séance à domicile !"); }}>
            <Check className="size-4" /> {faiteDomicile ? "Séance faite aujourd'hui" : "J'ai fait cette séance"}
          </Button>
        </article>}
        {seances.map((s) => (
          <CarteSeance key={s.id} seance={s} />
        ))}
        <p className="rounded-2xl border border-border p-4 text-xs text-muted-foreground">
          Adaptez l'intensité à votre forme du jour. Arrêtez tout exercice en cas de douleur thoracique, d'essoufflement
          inhabituel, de vertige ou de palpitations, et contactez votre médecin.
        </p>
      </section>
    </AppShell>
  );
}
