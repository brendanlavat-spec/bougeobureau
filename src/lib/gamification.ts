import { localDay, todayIso } from "./health-store";
import type { HealthData } from "./health-types";

/**
 * Système de points anti-sédentarité, entièrement dérivé des données locales
 * (pauses, séances, pas). Aucune donnée supplémentaire n'est stockée.
 */

export const POINTS = {
  pause: 10,
  exercice: 20, // pause avec exercice choisi
  seance: 40, // séance planifiée (matin / midi / soir ou sur mesure)
  objectifJour: 30, // bonus quotidien : objectif de pauses atteint
  objectifPas: 20, // bonus quotidien : objectif de pas atteint
} as const;

export interface Level {
  nom: string;
  seuil: number;
  description: string;
}

export const LEVELS: Level[] = [
  { nom: "Premier pas", seuil: 0, description: "L'aventure commence." },
  { nom: "En mouvement", seuil: 100, description: "La régularité s'installe." },
  { nom: "Bonne habitude", seuil: 300, description: "Bouger devient un réflexe." },
  { nom: "Anti-sédentaire", seuil: 600, description: "La position assise prolongée recule." },
  { nom: "Actif confirmé", seuil: 1000, description: "Un rythme durable et solide." },
  { nom: "Exemple à suivre", seuil: 1800, description: "Une hygiène de vie remarquable." },
  { nom: "Capitaine vitalité", seuil: 3000, description: "Le mouvement fait partie de vous." },
];

export type GainCategorie = "coeur" | "dos" | "jambes" | "equilibre" | "circulation";

export interface GainsSante {
  /** Minutes d'espérance de vie en bonne santé gagnées (estimation indicative). */
  esperanceMinutes: number;
  parCategorie: Record<GainCategorie, number>;
  /** Minutes estimées par catégorie, d'après les données publiées (GAIN_EVIDENCE). */
  minutesParCategorie: Record<GainCategorie, number>;
}

/** Classement des exercices par bénéfice principal. */
const EXERCICE_GAINS: Record<string, GainCategorie[]> = {
  "leve-toi": ["circulation", "coeur"],
  "squats-chaise": ["jambes", "equilibre"],
  mollets: ["circulation", "jambes"],
  "etirement-dos": ["dos"],
  "marche-rapide": ["coeur", "circulation"],
  escaliers: ["coeur", "jambes"],
  gainage: ["dos", "jambes"],
  equilibre: ["equilibre", "jambes"],
};

export const GAIN_LABELS: Record<GainCategorie, { label: string; detail: string }> = {
  coeur: { label: "Cœur et souffle", detail: "Endurance cardiaque entretenue" },
  dos: { label: "Dos et nuque", detail: "Prévention des douleurs dorsales liées à l'écran" },
  jambes: { label: "Genoux et jambes", detail: "Renforcement qui protège les genoux" },
  equilibre: { label: "Équilibre", detail: "Prévention des chutes" },
  circulation: { label: "Circulation", detail: "Contre les jambes lourdes et la position assise" },
};

/**
 * Données publiées utilisées pour les estimations, par catégorie.
 * minutesParSeance : minutes d'espérance de vie en bonne santé estimées
 * par séance/exercice de la catégorie (ordres de grandeur prudents,
 * dérivés des études citées — voir SOURCES).
 */
export const GAIN_EVIDENCE: Record<GainCategorie, { minutesParSeance: number; constat: string }> = {
  coeur: {
    minutesParSeance: 5,
    constat: "15 min d'activité modérée par jour : +3 ans d'espérance de vie et -14 % de mortalité.",
  },
  dos: {
    minutesParSeance: 3,
    constat: "L'exercice régulier réduit de 25 à 40 % le risque de récidive de lombalgie.",
  },
  jambes: {
    minutesParSeance: 3,
    constat: "Le renforcement des quadriceps réduit douleurs et progression de l'arthrose du genou.",
  },
  equilibre: {
    minutesParSeance: 4,
    constat: "Les exercices d'équilibre réduisent d'environ 23 % le risque de chute après 60 ans.",
  },
  circulation: {
    minutesParSeance: 4,
    constat: "Interrompre la position assise toutes les 30 min réduit le risque cardiovasculaire et la mortalité.",
  },
};

/** Sources des estimations (études publiées, affichées à l'utilisateur). */
export const SOURCES_GAINS: string[] = [
  "Wen CP et al., The Lancet, 2011 — 15 min/jour d'activité modérée : +3 ans d'espérance de vie.",
  "Moore SC et al., PLoS Medicine, 2012 — l'activité physique de loisir allonge l'espérance de vie jusqu'à +4,5 ans.",
  "Sherrington C et al., British Journal of Sports Medicine, 2019 — les exercices d'équilibre réduisent les chutes de ~23 %.",
  "Fransen M et al., Cochrane, 2015 — l'exercice soulage la douleur et améliore la fonction dans l'arthrose du genou.",
  "Hayden JA et al., Cochrane, 2021 — l'exercice réduit les récidives de lombalgie.",
  "Diaz KM et al., Annals of Internal Medicine, 2017 — rompre les longues périodes assises est associé à une moindre mortalité.",
];

function pointsOfBreak(exerciceId: string | null): number {
  if (!exerciceId) return POINTS.pause;
  if (exerciceId.startsWith("seance-")) return POINTS.seance;
  return POINTS.exercice;
}

export function computeProgression(data: HealthData) {
  const { breaks, steps, profile } = data;

  // Points par jour
  const parJour = new Map<string, number>();
  let total = 0;
  for (const b of breaks) {
    const day = localDay(b.at);
    const pts = pointsOfBreak(b.exerciceId);
    parJour.set(day, (parJour.get(day) ?? 0) + pts);
    total += pts;
  }

  // Bonus quotidiens
  const pausesParJour = new Map<string, number>();
  for (const b of breaks) {
    const day = localDay(b.at);
    pausesParJour.set(day, (pausesParJour.get(day) ?? 0) + 1);
  }
  for (const [day, count] of pausesParJour) {
    if (count >= profile.breakGoal) {
      parJour.set(day, (parJour.get(day) ?? 0) + POINTS.objectifJour);
      total += POINTS.objectifJour;
    }
  }
  for (const [day, n] of Object.entries(steps)) {
    if (n >= profile.stepGoal) {
      parJour.set(day, (parJour.get(day) ?? 0) + POINTS.objectifPas);
      total += POINTS.objectifPas;
    }
  }

  // Niveau
  let niveau = LEVELS[0]!;
  for (const l of LEVELS) if (total >= l.seuil) niveau = l;
  const suivant = LEVELS[LEVELS.indexOf(niveau) + 1] ?? null;
  const progressionNiveau = suivant ? (total - niveau.seuil) / (suivant.seuil - niveau.seuil) : 1;

  // Série de jours actifs (au moins 1 pause)
  let serie = 0;
  const cursor = new Date();
  if ((pausesParJour.get(todayIso()) ?? 0) === 0) cursor.setDate(cursor.getDate() - 1); // aujourd'hui pas encore compté
  while ((pausesParJour.get(todayIso(cursor)) ?? 0) > 0) {
    serie++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Points des 7 derniers jours
  const semaine = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = todayIso(d);
    return { jour: d.toLocaleDateString("fr-FR", { weekday: "short" }), points: parJour.get(iso) ?? 0 };
  });
  const pointsSemaine = semaine.reduce((s, d) => s + d.points, 0);

  // Gains santé
  const parCategorie: Record<GainCategorie, number> = { coeur: 0, dos: 0, jambes: 0, equilibre: 0, circulation: 0 };
  for (const b of breaks) {
    if (!b.exerciceId) continue;
    if (b.exerciceId.startsWith("seance-")) {
      // Une séance complète mobilise tout
      parCategorie.coeur++;
      parCategorie.dos++;
      parCategorie.jambes++;
      parCategorie.equilibre++;
      parCategorie.circulation++;
      continue;
    }
    for (const cat of EXERCICE_GAINS[b.exerciceId] ?? []) parCategorie[cat]++;
  }
  // Minutes d'espérance de vie en bonne santé estimées par catégorie,
  // à partir des coefficients prudents de GAIN_EVIDENCE (études publiées).
  const minutesParCategorie: Record<GainCategorie, number> = { coeur: 0, dos: 0, jambes: 0, equilibre: 0, circulation: 0 };
  let esperanceMinutes = 0;
  for (const cat of Object.keys(minutesParCategorie) as GainCategorie[]) {
    minutesParCategorie[cat] = parCategorie[cat] * GAIN_EVIDENCE[cat].minutesParSeance;
    esperanceMinutes += minutesParCategorie[cat];
  }
  // Pauses simples (sans exercice) : comptées en circulation (rompre la position assise).
  const pausesSimples = breaks.filter((b) => !b.exerciceId).length;
  minutesParCategorie.circulation += pausesSimples * 2;
  esperanceMinutes += pausesSimples * 2;
  // Marche : ~2 min gagnées par tranche de 1 000 pas (ordre de grandeur Wen 2011 / Moore 2012).
  const minutesPas = Object.values(steps).reduce((s, n) => s + Math.floor(n / 1000), 0) * 2;
  minutesParCategorie.coeur += minutesPas;
  esperanceMinutes += minutesPas;

  return { total, niveau, suivant, progressionNiveau, serie, semaine, pointsSemaine, gains: { esperanceMinutes, parCategorie, minutesParCategorie } };
}
