export interface SeanceBloc {
  titre: string;
  duree: string;
  detail: string;
}

export interface Seance {
  id: string;
  moment: "matin" | "midi" | "soir";
  titre: string;
  accroche: string;
  dureeMin: number; // minutes
  dureeMax: number;
  heureDefaut: string; // HH:MM proposée
  intensite: "Aérobie" | "Douce" | "Tonique";
  blocs: SeanceBloc[];
  benefice: string;
}

/**
 * Trois séances quotidiennes complètes : chacune fait travailler
 * l'ensemble des articulations et des grands groupes musculaires.
 * Le matin est volontairement plus aérobie pour réveiller le corps.
 */
export const seances: Seance[] = [
  {
    id: "matin",
    moment: "matin",
    titre: "Réveil tonique",
    accroche: "Séance aérobie pour lancer la journée : cardio doux et mobilisation complète.",
    dureeMin: 10,
    dureeMax: 20,
    heureDefaut: "07:30",
    intensite: "Aérobie",
    blocs: [
      {
        titre: "Échauffement articulaire",
        duree: "2 min",
        detail:
          "Cercles de tête, rotations d'épaules, cercles de poignets, bassin en cercles, rotations de chevilles. Tout le corps se déverrouille en douceur.",
      },
      {
        titre: "Cardio réveil",
        duree: "4 à 8 min",
        detail:
          "Marche dynamique sur place ou montées de genoux, puis petits sauts sur place ou jumping jacks adaptés (sans saut si besoin). Le cœur accélère progressivement.",
      },
      {
        titre: "Renforcement global",
        duree: "3 à 6 min",
        detail:
          "Squats (jambes, fessiers), pompes contre un mur ou au sol (bras, épaules, poitrine), gainage debout avec genoux alternés vers la poitrine (abdominaux, dos).",
      },
      {
        titre: "Retour au calme",
        duree: "1 à 4 min",
        detail:
          "Grandes respirations, étirements des bras vers le ciel puis vers le sol, étirement des mollets contre un mur.",
      },
    ],
    benefice:
      "Une séance aérobie le matin stimule la circulation, réveille les muscles et améliore la concentration pour la journée.",
  },
  {
    id: "midi",
    moment: "midi",
    titre: "Pause active du midi",
    accroche: "Juste après le déjeuner : digestion facilitée et corps remis en mouvement.",
    dureeMin: 10,
    dureeMax: 15,
    heureDefaut: "13:00",
    intensite: "Douce",
    blocs: [
      {
        titre: "Marche digestive",
        duree: "5 à 8 min",
        detail:
          "Marche à bon pas, dehors si possible. C'est le cœur de la séance : elle aide la digestion et rompt la position assise du repas.",
      },
      {
        titre: "Mobilité dos et hanches",
        duree: "3 min",
        detail:
          "Rotations du buste debout, flexions latérales, cercles de hanches, étirement du dos en se grandissant.",
      },
      {
        titre: "Jambes et équilibre",
        duree: "2 à 4 min",
        detail:
          "Montées sur pointes de pieds (mollets), fentes arrière alternées douces, équilibre sur une jambe 20 secondes de chaque côté.",
      },
    ],
    benefice:
      "Bouger après le déjeuner limite le coup de fatigue de début d'après-midi et soulage le dos après la matinée assise.",
  },
  {
    id: "soir",
    moment: "soir",
    titre: "Décompression du soir",
    accroche: "Séance complète pour relâcher les tensions accumulées et bien terminer la journée.",
    dureeMin: 15,
    dureeMax: 30,
    heureDefaut: "18:30",
    intensite: "Tonique",
    blocs: [
      {
        titre: "Marche ou cardio léger",
        duree: "5 à 10 min",
        detail:
          "Marche rapide, escaliers ou vélo. On évacue les tensions de la journée en faisant circuler le sang.",
      },
      {
        titre: "Renforcement complet",
        duree: "5 à 10 min",
        detail:
          "Squats, fentes, pompes adaptées, gainage (planche ou sur les genoux), oiseau debout penché en avant pour le dos. Chaque grand groupe musculaire est sollicité.",
      },
      {
        titre: "Étirements et souplesse",
        duree: "5 à 10 min",
        detail:
          "Étirements de la nuque, des épaules, du dos (posture de l'enfant), des hanches, des ischio-jambiers et des mollets. Respiration lente et profonde.",
      },
    ],
    benefice:
      "Une séance complète le soir améliore la souplesse, renforce les muscles posturaux et favorise un meilleur sommeil.",
  },
];

export function seanceDuMoment(date = new Date()): Seance {
  const h = date.getHours();
  if (h < 11) return seances[0];
  if (h < 15) return seances[1];
  return seances[2];
}
