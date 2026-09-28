import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Check, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useHealth, generatePatientCode } from "@/lib/health-store";
import { CONSENT_VERSION } from "@/lib/health-types";
import { bienvenueVue } from "@/lib/bienvenue";
import { BienvenueParcours } from "@/components/BienvenueParcours";
import logo from "@/assets/logo.png";

const guarantees = [
  { icon: Smartphone, text: "Vos données restent stockées sur votre téléphone, elles ne sont envoyées à aucun serveur." },
  { icon: Lock, text: "Aucun nom, aucune adresse, aucun e-mail : seul un code anonyme identifie votre suivi." },
  { icon: ShieldCheck, text: "Vous pouvez exporter ou effacer l'intégralité de vos données à tout moment." },
];

export function ConsentGate({ children }: { children: ReactNode }) {
  const { data, hydrated, setConsent, updateProfile } = useHealth();
  const [checked, setChecked] = useState(false);
  const [bienvenueVu, setBienvenueVu] = useState(bienvenueVue);

  if (!hydrated) {
    return <div className="min-h-screen bg-background" aria-hidden />;
  }

  if (data.consent?.accepted) {
    if (!bienvenueVu) {
      return <BienvenueParcours onTermine={() => setBienvenueVu(true)} />;
    }
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-soft-gradient px-4 py-10">
      <div className="mx-auto w-full max-w-xl animate-rise-in">
        <div className="rounded-3xl bg-card p-7 shadow-card">
          <img src={logo} alt="Logo Bouge au bureau" className="size-14 rounded-2xl shadow-card" />
          <h1 className="mt-5 text-2xl font-bold text-card-foreground">Avant de commencer</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Cette application de bureau, proposée par votre médecin, vous rappelle de vous lever régulièrement et vous
            propose des exercices courts. Elle enregistre uniquement l'heure de vos pauses actives et vos réglages :
            aucune mesure médicale, aucune donnée de santé.
          </p>

          <ul className="mt-6 space-y-3">
            {guarantees.map((g) => (
              <li key={g.text} className="flex gap-3 rounded-2xl bg-secondary/60 p-3.5">
                <g.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-sm text-secondary-foreground">{g.text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-4 rounded-2xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Checkbox id="consent" checked={checked} onCheckedChange={(v) => setChecked(v === true)} className="mt-0.5" />
              <Label htmlFor="consent" className="text-sm leading-relaxed font-normal">
                J'ai lu la{" "}
                <Link to="/confidentialite" className="font-semibold text-primary underline underline-offset-4">
                  politique de confidentialité
                </Link>{" "}
                et j'accepte l'enregistrement local de mes pauses actives.
              </Label>
            </div>
          </div>

          <Button
            className="mt-6 h-12 w-full rounded-2xl text-base"
            disabled={!checked}
            onClick={() => {
              if (!data.profile.code) updateProfile({ code: generatePatientCode() });
              setConsent({
                accepted: true,
                version: CONSENT_VERSION,
                acceptedAt: new Date().toISOString(),
              });
            }}
          >
            <Check className="size-5" />
            Je consens et je commence
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Consentement révocable à tout moment depuis l'onglet « Données ». Version {CONSENT_VERSION}.
          </p>
        </div>
      </div>
    </div>
  );
}