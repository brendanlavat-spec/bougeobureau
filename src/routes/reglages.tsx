import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHealth } from "@/lib/health-store";
import { MODE_PRESETS, type ActivityMode } from "@/lib/health-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reglages")({
  head: () => ({
    meta: [
      { title: "Réglages des rappels | Bouge au bureau" },
      { name: "description", content: "Fréquence des rappels, horaires de travail et objectif quotidien de pauses actives." },
      { property: "og:title", content: "Réglages des rappels" },
      { property: "og:description", content: "Personnalisez vos rappels anti-sédentarité." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reglages,
});

function Reglages() {
  const { data, updateProfile } = useHealth();
  const p = data.profile;

  const chooseMode = (mode: ActivityMode) => {
    const preset = MODE_PRESETS[mode];
    updateProfile({
      mode,
      sedentaryAlertMinutes: preset.sedentaryAlertMinutes,
      breakGoal: preset.breakGoal,
      stepGoal: preset.stepGoal,
    });
    toast.success(`Profil « ${preset.label} » appliqué : objectifs adaptés`);
  };

  const askNotif = async () => {
    if (typeof Notification === "undefined") return toast.error("Notifications non disponibles sur ce navigateur");
    const r = await Notification.requestPermission();
    toast[r === "granted" ? "success" : "error"](r === "granted" ? "Notifications activées" : "Notifications refusées");
  };

  return (
    <AppShell title="Réglages" subtitle="Adaptez les rappels à votre journée de travail.">
      <div className="space-y-5 rounded-3xl bg-card p-6 shadow-card">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Votre profil d'activité</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(MODE_PRESETS) as ActivityMode[]).map((mode) => {
              const preset = MODE_PRESETS[mode];
              const active = p.mode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => chooseMode(mode)}
                  className={cn(
                    "rounded-2xl border-2 p-4 text-left transition-colors",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <p className="font-semibold">{preset.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>
                  <p className="mt-2 text-xs font-medium text-primary">
                    Rappel {preset.sedentaryAlertMinutes} min · {preset.breakGoal} pauses · {preset.stepGoal.toLocaleString("fr-FR")} pas
                  </p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="alerts" className="text-sm font-semibold">Rappels de pause</Label>
          <Switch id="alerts" checked={p.alertsEnabled} onCheckedChange={(v) => updateProfile({ alertsEnabled: v })} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="pedometer" className="text-sm font-semibold">Podomètre (capteur de mouvement)</Label>
          <Switch id="pedometer" checked={p.pedometerEnabled} onCheckedChange={(v) => updateProfile({ pedometerEnabled: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rappel toutes les (minutes)">
            <Input type="number" min={5} max={180} value={p.sedentaryAlertMinutes}
              onChange={(e) => updateProfile({ sedentaryAlertMinutes: Math.max(5, Number(e.target.value) || 5) })} />
          </Field>
          <Field label="Objectif de pauses par jour">
            <Input type="number" min={1} max={30} value={p.breakGoal}
              onChange={(e) => updateProfile({ breakGoal: Math.max(1, Number(e.target.value) || 1) })} />
          </Field>
          <Field label="Objectif de pas par jour">
            <Input type="number" min={500} max={30000} step={500} value={p.stepGoal}
              onChange={(e) => updateProfile({ stepGoal: Math.max(500, Number(e.target.value) || 500) })} />
          </Field>
          <Field label="Début de journée">
            <Input type="time" value={p.workStart} onChange={(e) => updateProfile({ workStart: e.target.value })} />
          </Field>
          <Field label="Fin de journée">
            <Input type="time" value={p.workEnd} onChange={(e) => updateProfile({ workEnd: e.target.value })} />
          </Field>
        </div>
        <Button variant="outline" className="h-11 rounded-2xl" onClick={askNotif}>
          <Bell className="size-4" /> Autoriser les notifications du système
        </Button>
        <p className="text-xs text-muted-foreground">Le week-end, le mode Domicile est proposé automatiquement. Horaires et fréquence à domicile se règlent dans Agenda ; vous pouvez changer le lieu du jour sur Pauses.</p>
        <p className="text-xs text-muted-foreground">
          Recommandation : se lever au moins toutes les 30 à 60 minutes en position assise.
        </p>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
