import type { Profile } from "./health-types";
import type { DayContext } from "./health-types";
import { contextHours, dayContext } from "./day-context";
import { seances } from "./seances";

export interface Creneau {
  id: string;
  heure: string; // HH:MM
  dureeMin: number;
  titre: string;
  type: "seance" | "pause";
  moment?: "matin" | "midi" | "soir";
}

const toMin = (h: string) => {
  const [a, b] = h.split(":").map(Number);
  return (a || 0) * 60 + (b || 0);
};
const toHeure = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Emploi du temps du jour : 3 séances + pauses courtes réparties sur la journée de travail. */
export function planningDuJour(p: Profile, context: DayContext = dayContext(p)): Creneau[] {
  const items: Creneau[] = [];
  const heures = { matin: p.seanceMatin, midi: p.seanceMidi, soir: p.seanceSoir };
  const occupes: [number, number][] = [];
  for (const s of seances) {
    const h = heures[s.moment];
    if (!h) continue;
    items.push({ id: `seance-${s.id}`, heure: h, dureeMin: s.dureeMin, titre: s.titre, type: "seance", moment: s.moment });
    occupes.push([toMin(h) - 20, toMin(h) + s.dureeMax + 20]);
  }
  if (context === "domicile" && !occupes.some(([a, b]) => toMin("10:30") >= a && toMin("10:30") <= b)) {
    items.push({ id: "seance-domicile", heure: "10:30", dureeMin: 25, titre: "Bouger à domicile", type: "seance" });
    occupes.push([toMin("10:30") - 20, toMin("10:30") + 45]);
  }
  const hours = contextHours(p, context);
  const debut = toMin(hours.start || "09:00");
  const fin = toMin(hours.end || "18:00");
  const pas = Math.max(20, hours.interval || 45);
  for (let m = debut + pas; m < fin; m += pas) {
    if (occupes.some(([a, b]) => m >= a && m <= b)) continue;
    items.push({ id: `pause-${m}`, heure: toHeure(m), dureeMin: 3, titre: "Pause active", type: "pause" });
  }
  return items.sort((a, b) => toMin(a.heure) - toMin(b.heure));
}

export { toMin };
