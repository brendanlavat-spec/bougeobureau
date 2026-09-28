import { createFileRoute } from "@tanstack/react-router";
import { Activity, Flame, Footprints, Heart, HeartPulse, Medal, PersonStanding, ShieldCheck, Trophy, Waves } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { useHealth } from "@/lib/health-store";
import { computeProgression, GAIN_EVIDENCE, GAIN_LABELS, POINTS, SOURCES_GAINS, type GainCategorie } from "@/lib/gamification";

export const Route = createFileRoute("/progression")({
  head: () => ({
    meta: [
      { title: "Ma progression — Bouge au bureau" },
      { name: "description", content: "Points anti-sédentarité, niveaux, séries de jours actifs et gains santé estimés." },
      { property: "og:title", content: "Ma progression — Bouge au bureau" },
      { property: "og:description", content: "Gagnez des points à chaque pause active et suivez vos gains santé." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Progression,
});

const GAIN_ICONS: Record<GainCategorie, typeof Heart> = {
  coeur: HeartPulse,
  dos: PersonStanding,
  jambes: Footprints,
  equilibre: Activity,
  circulation: Waves,
};

const GAIN_PASTILLES: Record<GainCategorie, string> = {
  coeur: "bg-coral-soft text-coral",
  dos: "bg-azur-soft text-azur",
  jambes: "bg-secondary text-primary",
  equilibre: "bg-sun-soft text-sun",
  circulation: "bg-accent text-accent-foreground",
};

function Progression() {
  const { data } = useHealth();
  const p = computeProgression(data);

  return (
    <AppShell title="Ma progression" subtitle="Chaque mouvement compte : gagnez des points et voyez vos efforts se traduire en gains santé.">
      <div className="grid animate-rise-in gap-4 md:grid-cols-3">
        {/* Niveau et points */}
        <section className="relative overflow-hidden rounded-3xl bg-hero-gradient p-6 text-primary-foreground shadow-float md:col-span-2">
          <div className="pointer-events-none absolute -top-10 -right-8 size-36 rounded-full bg-white/10" aria-hidden />
          <div className="pointer-events-none absolute bottom-4 right-20 size-12 rounded-full bg-sun/30 blur-md" aria-hidden />
          <p className="relative flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-80">
            <span className="flex size-7 items-center justify-center rounded-full bg-white/20">
              <Trophy className="size-4" />
            </span>
            Niveau actuel
          </p>
          <h2 className="relative mt-3 font-display text-3xl font-bold">{p.niveau.nom}</h2>
          <p className="relative mt-1 text-sm opacity-85">{p.niveau.description}</p>
          <p className="relative mt-5 text-5xl font-bold tabular-nums">
            {p.total.toLocaleString("fr-FR")}
            <span className="ml-2 text-lg font-semibold opacity-80">points</span>
          </p>
          {p.suivant ? (
            <div className="relative mt-4">
              <div className="flex justify-between text-xs font-semibold opacity-85">
                <span>Prochain niveau : {p.suivant.nom}</span>
                <span>{p.suivant.seuil.toLocaleString("fr-FR")} pts</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-sun transition-all duration-700" style={{ width: `${Math.min(100, p.progressionNiveau * 100)}%` }} />
              </div>
            </div>
          ) : (
            <p className="relative mt-4 text-sm font-semibold">Niveau maximal atteint, bravo !</p>
          )}
        </section>

        {/* Série de jours actifs */}
        <section className="rounded-3xl bg-card p-6 shadow-card">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="flex size-7 items-center justify-center rounded-full bg-sun-soft">
              <Flame className="size-4 text-sun" />
            </span>
            Série en cours
          </p>
          <p className="mt-4 text-5xl font-bold tabular-nums text-card-foreground">
            {p.serie}
            <span className="ml-2 text-lg font-semibold text-muted-foreground">jour{p.serie > 1 ? "s" : ""}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {p.serie > 0
              ? "Jours consécutifs avec au moins une pause active. Ne cassez pas la série !"
              : "Prenez une pause active aujourd'hui pour démarrer une série."}
          </p>
          <p className="mt-4 rounded-xl bg-accent px-3 py-2 text-xs text-accent-foreground">
            {p.pointsSemaine} point{p.pointsSemaine > 1 ? "s" : ""} gagné{p.pointsSemaine > 1 ? "s" : ""} sur les 7 derniers jours.
          </p>
        </section>

        {/* Gains santé */}
        <section className="rounded-3xl bg-card p-6 shadow-card md:col-span-3">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="flex size-7 items-center justify-center rounded-full bg-coral-soft">
              <Heart className="size-4 text-coral" />
            </span>
            Vos gains santé estimés
          </p>
          <div className="mt-4 flex flex-col items-start gap-3 rounded-2xl bg-sun-gradient p-5 text-sun-foreground sm:flex-row sm:items-center">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/25">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                +{p.gains.esperanceMinutes.toLocaleString("fr-FR")} min
              </p>
              <p className="text-sm opacity-90">
                d'espérance de vie en bonne santé gagnées depuis le début — estimation indicative basée sur vos pauses et vos pas.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {(Object.keys(GAIN_LABELS) as GainCategorie[]).map((cat) => {
              const Icon = GAIN_ICONS[cat];
              const count = p.gains.parCategorie[cat];
              return (
                <div key={cat} className="rounded-2xl border border-border p-4">
                  <span className={`flex size-9 items-center justify-center rounded-xl ${GAIN_PASTILLES[cat]}`}>
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-card-foreground">{GAIN_LABELS[cat].label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{GAIN_LABELS[cat].detail}</p>
                  <p className="mt-2 text-lg font-bold tabular-nums text-card-foreground">
                    {count}
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">fois</span>
                  </p>
                  <p className="mt-1 text-sm font-bold tabular-nums text-primary">
                    +{p.gains.minutesParCategorie[cat].toLocaleString("fr-FR")} min
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">de vie en bonne santé</span>
                  </p>
                  <p className="mt-2 rounded-xl bg-muted/60 p-2 text-[11px] leading-snug text-muted-foreground">
                    {GAIN_EVIDENCE[cat].constat}
                  </p>
                </div>
              );
            })}
          </div>
          <details className="mt-4 rounded-2xl border border-border p-4">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
              D'où viennent ces estimations ? (études publiées)
            </summary>
            <ul className="mt-3 space-y-1.5 text-[11px] leading-snug text-muted-foreground">
              {SOURCES_GAINS.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-1 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Ces chiffres sont des ordres de grandeur prudents, calculés à partir de moyennes de population :
              ils motivent, mais ne constituent pas une promesse médicale individuelle.
            </p>
          </details>
        </section>

        {/* Points de la semaine */}
        <section className="rounded-3xl bg-card p-6 shadow-card md:col-span-2">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="flex size-7 items-center justify-center rounded-full bg-azur-soft">
              <Medal className="size-4 text-azur" />
            </span>
            Points des 7 derniers jours
          </p>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={p.semaine}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="jour" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: "12px" }}
                />
                <Bar dataKey="points" radius={[8, 8, 0, 0]}>
                  {p.semaine.map((d, i) => (
                    <Cell key={i} fill={i === p.semaine.length - 1 ? "var(--sun)" : "var(--azur)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Comment gagner des points */}
        <section className="rounded-3xl bg-card p-6 shadow-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Comment gagner des points</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span className="text-card-foreground">Pause active</span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary">+{POINTS.pause}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-card-foreground">Exercice réalisé</span>
              <span className="rounded-full bg-sun-soft px-2.5 py-0.5 text-xs font-bold text-sun">+{POINTS.exercice}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-card-foreground">Séance complète</span>
              <span className="rounded-full bg-coral-soft px-2.5 py-0.5 text-xs font-bold text-coral">+{POINTS.seance}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-card-foreground">Objectif de pauses du jour</span>
              <span className="rounded-full bg-azur-soft px-2.5 py-0.5 text-xs font-bold text-azur">+{POINTS.objectifJour}</span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-card-foreground">Objectif de pas du jour</span>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">+{POINTS.objectifPas}</span>
            </li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
