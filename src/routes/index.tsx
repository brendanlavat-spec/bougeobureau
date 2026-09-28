import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Check, Dumbbell, Flame, Footprints, Heart, Lightbulb, TrendingUp, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { ExerciseHelp } from "@/components/ExerciseHelp";
import { Button } from "@/components/ui/button";
import { localDay, todayIso, useHealth } from "@/lib/health-store";
import { exerciceDuJour } from "@/lib/exercices";
import { exercices } from "@/lib/exercices";
import { dayContext, defaultContext } from "@/lib/day-context";
import type { DayContext } from "@/lib/health-types";
import { computeProgression } from "@/lib/gamification";
import { usePedometer } from "@/lib/use-pedometer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bouge au bureau — rappels anti-sédentarité" },
      { name: "description", content: "Encouragements adaptés à vos pauses actives et exercices courts pour bouger au travail." },
      { property: "og:title", content: "Bouge au bureau — rappels anti-sédentarité" },
      { property: "og:description", content: "Levez-vous régulièrement : rappels, exercices de bureau et suivi de vos pauses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data, logBreak, addSteps, updateProfile } = useHealth();
  const pedometer = usePedometer(data.profile.pedometerEnabled, addSteps);

  const { breakGoal, alertsEnabled, stepGoal, pedometerEnabled } = data.profile;
  const stepsToday = data.steps[todayIso()] ?? 0;
  const today = todayIso();
  const todayCount = data.breaks.filter((b) => localDay(b.at) === today).length;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayCount = data.breaks.filter((b) => localDay(b.at) === todayIso(yesterday)).length;
  const encouragement = todayCount === 0
    ? yesterdayCount > 0
      ? { title: "Chaque journée est une nouvelle occasion de bouger.", detail: "Vous avez pris des pauses hier. Reprenez à votre rythme, même une seule pause compte." }
      : { title: "Un petit mouvement, c'est déjà un bon départ.", detail: "Quand vous en avez envie, prenez quelques minutes pour vous lever et bouger." }
    : todayCount >= breakGoal
      ? { title: "Bravo, vous avez atteint votre objectif !", detail: "Vos pauses d'aujourd'hui montrent que vous prenez du temps pour bouger. Continuez à votre rythme." }
      : todayCount > yesterdayCount && yesterdayCount > 0
        ? { title: "Vous avancez à votre rythme, et ça se voit.", detail: "Vous avez déjà pris plus de pauses qu'hier. Chaque mouvement compte." }
        : todayCount >= Math.ceil(breakGoal / 2)
          ? { title: "Vous avez déjà bien avancé aujourd'hui.", detail: "Continuez si vous en avez envie : quelques pauses de plus vous rapprochent de votre objectif." }
          : { title: "Bien joué pour cette pause !", detail: "Pas besoin d'en faire trop : chaque occasion de bouger compte dans votre journée." };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = todayIso(d);
    return {
      jour: d.toLocaleDateString("fr-FR", { weekday: "short" }),
      pauses: data.breaks.filter((b) => localDay(b.at) === iso).length,
    };
  });
  let streak = 0;
  for (let i = days.length - 1; i >= 0 && days[i]!.pauses >= breakGoal; i--) streak++;
  const context = dayContext(data.profile);
  const suggestions = exercices.filter((e) => context === "travail" ? e.lieu === "Bureau" : e.lieu !== "Bureau");
  const suggestion = suggestions[new Date().getDate() % suggestions.length] ?? exerciceDuJour(new Date().getDate());
  const chooseContext = (value: DayContext) => {
    const key = todayIso();
    const overrides = { ...data.profile.dayOverrides };
    if (value === defaultContext(data.profile)) delete overrides[key];
    else overrides[key] = value;
    updateProfile({ dayOverrides: overrides });
  };

  const ringPct = Math.min(1, breakGoal > 0 ? todayCount / breakGoal : 0);
  const ringC = 2 * Math.PI * 34;
  const prog = computeProgression(data);

  return (
    <AppShell title="Vos pauses actives" subtitle="Levez-vous régulièrement : quelques minutes suffisent à rompre la sédentarité.">
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 shadow-card">
        <span className="text-sm font-semibold text-foreground">Aujourd'hui</span>
        <div className="flex rounded-xl bg-muted p-1" role="group" aria-label="Lieu de la journée">
          {(["travail", "domicile"] as const).map((value) => (
            <Button key={value} size="sm" variant={context === value ? "default" : "ghost"}
              aria-pressed={context === value} className="h-9 rounded-lg px-3"
              onClick={() => chooseContext(value)}>{value === "travail" ? "Travail" : "Domicile"}</Button>
          ))}
        </div>
      </div>
      <div className="grid animate-rise-in gap-4 md:grid-cols-3">
        <section className="relative overflow-hidden rounded-3xl bg-card p-6 shadow-card md:col-span-2" aria-live="polite">
          <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-sun-soft" aria-hidden />
          <p className="relative flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="flex size-7 items-center justify-center rounded-full bg-coral-soft">
              <Heart className="size-4 text-coral" />
            </span>
            Votre élan du jour
          </p>
          <h2 className="relative mt-4 max-w-xl font-display text-2xl font-bold leading-snug text-card-foreground sm:text-3xl">
            {encouragement.title}
          </h2>
          <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{encouragement.detail}</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Button className="h-12 rounded-2xl px-6 text-base shadow-float transition-transform active:scale-95" onClick={() => logBreak()}>
              <Check className="size-5" strokeWidth={2.6} /> J'ai bougé
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl">
              <Link to="/exercices">
                <Dumbbell className="size-5 text-sun" /> Choisir un exercice
              </Link>
            </Button>
          </div>
          {!alertsEnabled ? (
            <p className="relative mt-4 text-sm text-warning">Rappels désactivés — réactivez-les dans Réglages.</p>
          ) : null}
        </section>

        <section className="rounded-3xl bg-card p-6 shadow-card">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Aujourd'hui</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative size-24 shrink-0" role="img" aria-label={`${todayCount} pauses sur ${breakGoal}`}>
              <svg viewBox="0 0 80 80" className="size-full -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" strokeWidth="9" className="stroke-sun-soft" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${ringC} ${ringC}`}
                  strokeDashoffset={ringC * (1 - ringPct)}
                  className="stroke-sun transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-card-foreground">
                {todayCount}
                <span className="text-sm text-muted-foreground">/{breakGoal}</span>
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-card-foreground">pauses actives</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-sun">
                <Flame className="size-4" /> {streak} jour{streak > 1 ? "s" : ""} d'objectif atteint
              </p>
            </div>
          </div>
        </section>

        <Link to="/progression" className="group relative block overflow-hidden rounded-3xl bg-card p-6 shadow-card transition-transform active:scale-[0.98]">
          <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-sun-soft" aria-hidden />
          <p className="relative flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="flex size-7 items-center justify-center rounded-full bg-sun-soft">
              <Trophy className="size-4 text-sun" />
            </span>
            Vos points
          </p>
          <p className="relative mt-3 text-4xl font-bold tabular-nums text-card-foreground">
            {prog.total.toLocaleString("fr-FR")}
            <span className="ml-1.5 text-base font-semibold text-muted-foreground">pts</span>
          </p>
          <p className="relative mt-1 text-sm text-muted-foreground">
            Niveau <span className="font-semibold text-card-foreground">{prog.niveau.nom}</span>
            {prog.serie > 0 ? ` · ${prog.serie} jour${prog.serie > 1 ? "s" : ""} d'affilée` : ""}
          </p>
          <p className="relative mt-3 text-xs font-semibold text-sun group-hover:underline">Voir ma progression →</p>
        </Link>

        <section className="rounded-3xl bg-card p-6 shadow-card">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="flex size-7 items-center justify-center rounded-full bg-azur-soft">
              <Footprints className="size-4 text-azur" />
            </span>
            Podomètre
          </p>
          {pedometerEnabled && pedometer.running ? (
            <>
              <PedometerStatusBadge p={pedometer} />
              <p className="mt-3 text-4xl font-bold tabular-nums text-card-foreground sm:text-5xl">
                {stepsToday.toLocaleString("fr-FR")}
                <span className="text-xl text-muted-foreground"> / {stepGoal.toLocaleString("fr-FR")}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">pas aujourd'hui</p>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-azur-soft">
                <div
                  className="h-full rounded-full bg-azur transition-all duration-700"
                  style={{ width: `${Math.min(100, (stepsToday / stepGoal) * 100)}%` }}
                />
              </div>
              {pedometer.recovered && Date.now() - pedometer.recovered.at < 5 * 60_000 && (
                <p className="mt-3 rounded-xl bg-accent px-3 py-2 text-xs text-accent-foreground">
                  +{pedometer.recovered.steps.toLocaleString("fr-FR")} pas récupérés pendant que l'application était fermée.
                </p>
              )}
              {pedometer.lastGap && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-foreground">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="flex-1">
                    Mesure suspendue par le système de {fmtTime(pedometer.lastGap.from)} à {fmtTime(pedometer.lastGap.to)} : les pas de
                    cette période n'ont pas été comptés.
                  </p>
                  <button className="font-semibold underline" onClick={pedometer.dismissGap}>OK</button>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {pedometer.platform === "web"
                  ? "Dans le navigateur, les pas ne sont comptés que lorsque cette page est ouverte. Installez l'application pour un suivi en arrière-plan."
                  : pedometer.platform === "ios"
                    ? "L'iPhone continue de compter vos pas en arrière-plan ; ils sont ajoutés à votre retour."
                    : "Les pas sont comptés en arrière-plan tant qu'Android ne ferme pas l'application. Désactivez l'optimisation de batterie pour un suivi fiable."}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Comptez vos pas grâce au capteur de mouvement du téléphone. Les pas restent sur l'appareil.
              </p>
              <Button
                className="mt-4 h-11 rounded-2xl transition-transform active:scale-95"
                onClick={async () => {
                  if (!pedometer.supported) return;
                  const ok = await pedometer.requestAndStart();
                  if (ok) updateProfile({ pedometerEnabled: true });
                }}
                disabled={!pedometer.supported}
              >
                <Footprints className="size-4" />
                {pedometer.supported ? "Activer le podomètre" : "Capteur indisponible"}
              </Button>
            </>
          )}
        </section>

        <section className="rounded-3xl bg-card p-6 shadow-card md:col-span-2">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <span className="flex size-7 items-center justify-center rounded-full bg-secondary">
              <TrendingUp className="size-4 text-primary" />
            </span>
            7 derniers jours
          </p>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="jour" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: "12px" }}
                />
                <Bar dataKey="pauses" radius={[8, 8, 0, 0]}>
                  {days.map((d, i) => (
                    <Cell key={i} fill={i === days.length - 1 ? "var(--sun)" : "var(--primary)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-sun-gradient p-6 text-sun-foreground shadow-float">
          <div className="pointer-events-none absolute -top-8 -right-6 size-28 rounded-full bg-white/20" aria-hidden />
          <p className="relative flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-80">
            <span className="flex size-7 items-center justify-center rounded-full bg-white/25">
              <Lightbulb className="size-4" />
            </span>
            Idée de pause
          </p>
          <h2 className="relative mt-3 text-xl font-bold">{suggestion.titre}</h2>
          <p className="relative mt-1 text-sm opacity-85">{suggestion.resume}</p>
          <div className="relative mt-4 flex flex-wrap items-start gap-3">
            <Button
              variant="secondary"
              className="h-11 rounded-2xl transition-transform active:scale-95"
              onClick={() => logBreak(suggestion.id)}
            >
              <Check className="size-4" strokeWidth={2.6} /> Fait
            </Button>
            <ExerciseHelp exercice={suggestion} contrast />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function fmtTime(t: number) {
  const d = new Date(t);
  const sameDay = d.toDateString() === new Date().toDateString();
  return d.toLocaleString("fr-FR", sameDay ? { hour: "2-digit", minute: "2-digit" } : { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

function PedometerStatusBadge({ p }: { p: ReturnType<typeof usePedometer> }) {
  const map = {
    active: { label: "Mesure en cours", cls: "bg-azur-soft text-azur", dot: "bg-azur animate-pulse" },
    background: { label: "Mesure en arrière-plan", cls: "bg-azur-soft text-azur", dot: "bg-azur" },
    suspended: { label: "Mesure suspendue par le système", cls: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  } as const;
  const s = map[p.status as keyof typeof map];
  if (!s) return null;
  return (
    <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`} role="status">
      <span className={`size-2 rounded-full ${s.dot}`} />
      {s.label}
      {p.status === "suspended" && p.suspendedSince ? ` depuis ${fmtTime(p.suspendedSince)}` : ""}
    </div>
  );
}
