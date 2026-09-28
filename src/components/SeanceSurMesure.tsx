import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Clock, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { useHealth } from "@/lib/health-store";
import { MODE_PRESETS, type ActivityMode } from "@/lib/health-types";
import { LIMITATIONS, proposerSeance } from "@/lib/seance-ia.functions";
import type { SeanceIA } from "@/lib/seance-ia.server";
import { cn } from "@/lib/utils";

export function SeanceSurMesure() {
  const { data, logBreak } = useHealth();
  const [duree, setDuree] = useState(15);
  const [mode, setMode] = useState<ActivityMode>(data.profile.mode);
  const [lims, setLims] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [seance, setSeance] = useState<SeanceIA | null>(null);
  const [faite, setFaite] = useState(false);
  const generer = useServerFn(proposerSeance);

  const lancer = async () => {
    setLoading(true);
    try {
      const r = await generer({ data: { duree, mode, limitations: lims as (typeof LIMITATIONS)[number][] } });
      if (r.ok) {
        setSeance(r.seance);
        setFaite(false);
      } else toast.error(r.error);
    } catch {
      toast.error("La génération a échoué, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="rounded-3xl bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-azur-soft text-azur">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-card-foreground">Séance sur mesure</h3>
          <p className="text-xs text-muted-foreground">Proposée par l'IA selon votre temps, votre profil et vos limites</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="flex justify-between text-sm font-semibold">
            Temps disponible <span className="text-primary">{duree} min</span>
          </p>
          <Slider className="mt-3" min={10} max={30} step={5} value={[duree]} onValueChange={(v) => setDuree(v[0])} aria-label="Temps disponible" />
        </div>

        <div>
          <p className="text-sm font-semibold">Profil d'activité</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.keys(MODE_PRESETS) as ActivityMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn("rounded-2xl border px-2 py-2 text-xs font-semibold", mode === m ? "border-primary bg-secondary text-primary" : "border-border text-muted-foreground")}
              >
                {MODE_PRESETS[m].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Limitations éventuelles</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {LIMITATIONS.map((l) => {
              const on = lims.includes(l);
              return (
                <button
                  key={l}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setLims(on ? lims.filter((x) => x !== l) : [...lims, l])}
                  className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", on ? "border-coral bg-coral-soft text-coral" : "border-border text-muted-foreground")}
                >
                  {l}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Ces choix servent uniquement à générer la séance : ils ne sont ni enregistrés ni associés à votre identité.
          </p>
        </div>

        <button
          type="button"
          onClick={lancer}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-card disabled:opacity-70"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {loading ? "Préparation de votre séance…" : seance ? "Proposer une autre séance" : "Proposer ma séance"}
        </button>
      </div>

      {seance && (
        <div className="mt-5 border-t border-border pt-4">
          <h4 className="text-base font-bold text-card-foreground">{seance.titre}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{seance.resume}</p>
          <ol className="mt-4 space-y-3">
            {seance.blocs.map((b, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-azur-soft text-xs font-bold text-azur">{i + 1}</span>
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-card-foreground">
                    {b.titre}
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                      <Clock className="size-3" /> {b.duree}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{b.detail}</p>
                  {b.zones && <p className="mt-1 text-xs font-medium text-primary">{b.zones}</p>}
                </div>
              </li>
            ))}
          </ol>
          {seance.conseil && <p className="mt-4 rounded-2xl bg-accent/50 p-3 text-xs text-accent-foreground">{seance.conseil}</p>}
          <button
            type="button"
            disabled={faite}
            onClick={() => {
              logBreak("seance-ia");
              setFaite(true);
              toast.success("Bravo, séance terminée !");
            }}
            className={cn("mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold", faite ? "bg-muted text-muted-foreground" : "bg-coral text-coral-foreground")}
          >
            <Check className="size-4" /> {faite ? "Séance enregistrée" : "J'ai fait cette séance"}
          </button>
        </div>
      )}
    </article>
  );
}
