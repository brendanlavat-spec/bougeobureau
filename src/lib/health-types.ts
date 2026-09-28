export interface Consent {
  accepted: boolean;
  version: string;
  acceptedAt: string;
}

export type ActivityMode = "sedentaire" | "enforme" | "sportif";
export type DayContext = "travail" | "domicile";

export interface ModePreset {
  label: string;
  description: string;
  sedentaryAlertMinutes: number;
  breakGoal: number;
  stepGoal: number;
}

export const MODE_PRESETS: Record<ActivityMode, ModePreset> = {
  sedentaire: {
    label: "Sédentaire",
    description: "Je bouge peu aujourd'hui. Objectifs progressifs pour démarrer en douceur.",
    sedentaryAlertMinutes: 30,
    breakGoal: 10,
    stepGoal: 4000,
  },
  enforme: {
    label: "En forme",
    description: "Je marche régulièrement. Un rythme équilibré pour rester actif.",
    sedentaryAlertMinutes: 45,
    breakGoal: 8,
    stepGoal: 7000,
  },
  sportif: {
    label: "Sportif",
    description: "Je pratique une activité physique régulière. Des objectifs ambitieux.",
    sedentaryAlertMinutes: 60,
    breakGoal: 6,
    stepGoal: 10000,
  },
};

export interface Profile {
  code: string; // identifiant pseudonyme, non nominatif
  mode: ActivityMode;
  sedentaryAlertMinutes: number;
  alertsEnabled: boolean;
  breakGoal: number; // pauses actives visées par jour
  stepGoal: number; // pas visés par jour
  pedometerEnabled: boolean;
  workStart: string; // HH:MM
  workEnd: string; // HH:MM
  homeStart: string;
  homeEnd: string;
  homeAlertMinutes: number;
  weekendAtHome: boolean;
  dayOverrides: Record<string, DayContext>;
  /** Horaires des séances planifiées (HH:MM), chaîne vide = séance désactivée. */
  seanceMatin: string;
  seanceMidi: string;
  seanceSoir: string;
}

/** Une pause active réalisée (aucune donnée de santé). */
export interface BreakEntry {
  id: string;
  at: string; // ISO
  exerciceId: string | null;
}

export interface HealthData {
  consent: Consent | null;
  profile: Profile;
  breaks: BreakEntry[];
  /** Pas comptés par jour (clé AAAA-MM-JJ). Simple comptage, sans donnée de santé. */
  steps: Record<string, number>;
}

export const CONSENT_VERSION = "2.0";

export const emptyProfile: Profile = {
  code: "",
  mode: "enforme",
  sedentaryAlertMinutes: 45,
  alertsEnabled: true,
  breakGoal: 8,
  stepGoal: 6000,
  pedometerEnabled: false,
  workStart: "09:00",
  workEnd: "18:00",
  homeStart: "09:00",
  homeEnd: "19:00",
  homeAlertMinutes: 60,
  weekendAtHome: true,
  dayOverrides: {},
  seanceMatin: "07:30",
  seanceMidi: "13:00",
  seanceSoir: "18:30",
};

export const emptyData: HealthData = {
  consent: null,
  profile: emptyProfile,
  breaks: [],
  steps: {},
};
