import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, LockKeyhole, Target, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marquerBienvenueVue } from "@/lib/bienvenue";
import logo from "@/assets/logo.png";

type Destination = "/reglages" | "/";

const steps = [
  {
    icon: Target,
    tag: "Départ",
    titre: "Bouger à votre rythme",
    detail: "Moins de temps assis, sans pression.",
    color: "bg-welcome-teal text-welcome-teal-foreground",
    labelColor: "text-welcome-teal",
  },
  {
    icon: Timer,
    tag: "Action",
    titre: "Des pauses actives",
    detail: "Quelques minutes pour se lever.",
    color: "bg-welcome-sky text-welcome-sky-foreground",
    labelColor: "text-welcome-sky-label",
  },
  {
    icon: CalendarDays,
    tag: "Routine",
    titre: "Vos séances du jour",
    detail: "Matin, midi ou soir : à vous de choisir.",
    color: "bg-welcome-sun text-welcome-sun-foreground",
    labelColor: "text-welcome-sun-label",
  },
  {
    icon: Trophy,
    tag: "Progression",
    titre: "Vos points",
    detail: "Chaque mouvement compte.",
    color: "bg-welcome-pink text-welcome-pink-foreground",
    labelColor: "text-welcome-pink-label",
  },
];

export function BienvenueParcours({ onTermine }: { onTermine: (destination: Destination) => void }) {
  const navigate = useNavigate();

  const terminer = (destination: Destination) => {
    marquerBienvenueVue();
    onTermine(destination);
    navigate({ to: destination });
  };

  return (
    <main className="welcome-screen flex min-h-dvh items-center justify-center bg-welcome-canvas px-3 py-4 text-welcome-ink sm:py-7">
      <div className="welcome-sheet flex w-full max-w-md flex-col overflow-hidden rounded-[32px] border border-welcome-line bg-card px-6 pb-5 pt-6 shadow-card sm:px-8 sm:pt-8">
        <header className="flex items-start justify-between gap-4">
          <img src={logo} alt="Bouge au bureau" className="size-11 rounded-xl object-cover shadow-card" />
          <span className="mt-1 shrink-0 rounded-full bg-welcome-sky/15 px-3 py-1 text-xs font-semibold text-welcome-teal">En un coup d’œil</span>
        </header>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-welcome-ink">
          Votre parcours<br /><span className="text-welcome-teal">en mouvement</span>
        </h1>

        <div className="relative mt-5 flex flex-col gap-4 sm:gap-6">
          <svg className="pointer-events-none absolute inset-0 h-full w-full text-welcome-line" viewBox="0 0 320 340" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 48 34 L 275 122 L 48 214 L 275 304" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 8" />
          </svg>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.titre} className={`relative flex min-h-18 items-center gap-3 ${index % 2 ? "justify-end text-right" : "justify-start"}`}>
                {index % 2 === 1 && (
                  <div className="max-w-[70%]">
                    <p className={`text-[11px] font-bold uppercase ${step.labelColor}`}>{step.tag}</p>
                    <h2 className="text-lg font-bold leading-tight text-welcome-ink">{step.titre}</h2>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{step.detail}</p>
                  </div>
                )}
                <span className={`flex size-15 shrink-0 items-center justify-center rounded-2xl border-4 border-card shadow-card ${step.color} ${index % 2 ? "rotate-3" : "-rotate-3"}`}>
                  <Icon className="size-6" strokeWidth={2.3} />
                </span>
                {index % 2 === 0 && (
                  <div className="max-w-[70%]">
                    <p className={`text-[11px] font-bold uppercase ${step.labelColor}`}>{step.tag}</p>
                    <h2 className="text-lg font-bold leading-tight text-welcome-ink">{step.titre}</h2>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{step.detail}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Button className="h-12 w-full rounded-2xl bg-welcome-teal text-welcome-teal-foreground shadow-card hover:bg-welcome-teal/90" onClick={() => terminer("/reglages")}>
            Personnaliser mes réglages <ArrowRight className="size-4" />
          </Button>
          <Button variant="ghost" className="mt-1 h-9 w-full text-xs text-muted-foreground" onClick={() => terminer("/")}>
            Explorer l’application d’abord
          </Button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
            <LockKeyhole className="size-3.5" /> Vos données restent sur cet appareil
          </p>
        </div>
      </div>
    </main>
  );
}
