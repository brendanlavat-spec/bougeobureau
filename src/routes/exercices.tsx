import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Filter, MapPin, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ExerciseHelp } from "@/components/ExerciseHelp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exercices, exerciceDuJour, type Exercice } from "@/lib/exercices";
import { dayContext } from "@/lib/day-context";
import { useHealth } from "@/lib/health-store";

export const Route = createFileRoute("/exercices")({
  head: () => ({
    meta: [
      { title: "Exercices anti-sédentarité | Prévention Santé" },
      { name: "description", content: "Exercices courts à faire au bureau, à domicile ou dehors pour rompre la sédentarité." },
      { property: "og:title", content: "Exercices anti-sédentarité" },
      { property: "og:description", content: "Des séquences de 2 à 10 minutes pour bouger plus chaque jour." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExercicesPage,
});

const lieux = ["Tous", "Bureau", "Domicile", "Extérieur"] as const;

function Carte({ ex, highlight }: { ex: Exercice; highlight?: boolean }) {
  return (
    <article className={`rounded-3xl bg-card p-5 shadow-card ${highlight ? "ring-2 ring-primary" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="rounded-full">
          <Clock className="mr-1 size-3" /> {ex.duree}
        </Badge>
        <Badge variant="outline" className="rounded-full">
          <MapPin className="mr-1 size-3" /> {ex.lieu}
        </Badge>
        <Badge variant="outline" className="rounded-full">{ex.intensite}</Badge>
      </div>
      <h3 className="mt-3 text-lg font-bold text-card-foreground">{ex.titre}</h3>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-card-foreground">{ex.resume}</p>
        <ExerciseHelp exercice={ex} />
      </div>
    </article>
  );
}

function ExercicesPage() {
  const { data } = useHealth();
  const context = dayContext(data.profile);
  const [lieu, setLieu] = useState<(typeof lieux)[number] | null>(null);
  const selected = lieu ?? (context === "travail" ? "Bureau" : "Domicile");
  const suggestions = exercices.filter((e) => context === "travail" ? e.lieu === "Bureau" : e.lieu !== "Bureau");
  const jour = suggestions[new Date().getDate() % suggestions.length] ?? exerciceDuJour(new Date().getDate());
  const liste = exercices.filter((e) => selected === "Tous" || e.lieu === selected);

  return (
    <AppShell title="Bouger" subtitle="Des séquences courtes pour rompre les périodes assises prolongées.">
      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl bg-sun-gradient p-5 text-sun-foreground shadow-float">
          <div className="pointer-events-none absolute -top-6 -right-4 size-24 rounded-full bg-white/20" aria-hidden />
          <p className="relative flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-80">
            <span className="flex size-6 items-center justify-center rounded-full bg-white/25">
              <Sparkles className="size-3.5" />
            </span>
            Suggestion du jour
          </p>
          <h2 className="relative mt-2 text-xl font-bold">{jour.titre}</h2>
          <p className="relative mt-1 text-sm opacity-85">
            {jour.duree} · {jour.lieu} · Intensité {jour.intensite.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          {lieux.map((l) => (
            <Button
              key={l}
              size="sm"
              variant={selected === l ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setLieu(l)}
            >
              {l}
            </Button>
          ))}
        </div>

        <div className="grid gap-4">
          {liste.map((ex) => (
            <Carte key={ex.id} ex={ex} highlight={ex.id === jour.id} />
          ))}
        </div>

        <p className="rounded-2xl border border-border p-4 text-xs text-muted-foreground">
          Arrêtez tout exercice en cas de douleur thoracique, d'essoufflement inhabituel, de vertige ou de palpitations,
          et contactez votre médecin.
        </p>
      </section>
    </AppShell>
  );
}