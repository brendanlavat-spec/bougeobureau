import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useHealth } from "@/lib/health-store";
import { exercices } from "@/lib/exercices";
import { contextHours, dayContext } from "@/lib/day-context";

function inWorkHours(start: string, end: string) {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return m >= (sh ?? 0) * 60 + (sm ?? 0) && m <= (eh ?? 0) * 60 + (em ?? 0);
}

/** Rappel de pause : se déclenche N minutes après la dernière pause active, pendant les heures de travail. */
export function SedentaryWatcher() {
  const { data, lastActiveAt, logBreak } = useHealth();
  const { alertsEnabled } = data.profile;
  const [date, setDate] = useState(() => new Date());
  useEffect(() => {
    const clock = setInterval(() => setDate(new Date()), 60_000);
    return () => clearInterval(clock);
  }, []);
  const context = dayContext(data.profile, date);
  const { start, end, interval } = contextHours(data.profile, context);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!alertsEnabled) return;
    const delay = Math.max(5, interval) * 60_000;
    const fire = () => {
      if (inWorkHours(start, end)) {
        const options = exercices.filter((e) => context === "travail" ? e.lieu === "Bureau" : e.lieu !== "Bureau");
        const ex = options[Math.floor(Math.random() * options.length)] ?? exercices[0];
        if (!ex) return;
        toast("C'est l'heure de bouger", {
          description: `Une occasion de bouger : ${ex.titre} (${ex.duree}).`,
          duration: 60_000,
          action: { label: "C'est fait", onClick: () => logBreak(ex.id) },
        });
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("C'est l'heure de bouger", { body: `${ex.titre} — ${ex.duree}` });
        }
      }
      timer.current = setTimeout(fire, delay);
    };
    const remaining = Math.max(1000, lastActiveAt + delay - Date.now());
    timer.current = setTimeout(fire, remaining);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [alertsEnabled, interval, start, end, context, lastActiveAt, logBreak]);

  return null;
}
