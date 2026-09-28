export interface Exercice {
  id: string;
  titre: string;
  duree: string;
  resume: string;
  intensite: "Douce" | "Modérée" | "Dynamique";
  lieu: "Bureau" | "Domicile" | "Extérieur";
  consignes: string[];
  benefice: string;
}

export const exercices: Exercice[] = [
  {
    id: "leve-toi",
    titre: "Lever et marche courte",
    duree: "3 min",
    resume: "Marche 2 à 3 min · 5 respirations",
    intensite: "Douce",
    lieu: "Bureau",
    consignes: [
      "Levez-vous de votre siège sans vous aider des mains.",
      "Marchez d'un pas régulier pendant 2 à 3 minutes.",
      "Terminez par 5 respirations profondes.",
    ],
    benefice: "Réactive la circulation et interrompt la position assise prolongée.",
  },
  {
    id: "squats-chaise",
    titre: "Squats sur chaise",
    duree: "2 min",
    resume: "Squats sur chaise · 2 × 10",
    intensite: "Modérée",
    lieu: "Bureau",
    consignes: [
      "Debout devant votre chaise, pieds écartés largeur de bassin.",
      "Descendez lentement jusqu'à effleurer l'assise, puis remontez.",
      "2 séries de 10 répétitions, dos droit.",
    ],
    benefice: "Renforce les cuisses et les fessiers, améliore l'équilibre.",
  },
  {
    id: "mollets",
    titre: "Élévations sur pointes de pieds",
    duree: "90 s",
    resume: "Pointes de pieds · 3 × 15",
    intensite: "Douce",
    lieu: "Bureau",
    consignes: [
      "Debout, appui léger sur un plan de travail.",
      "Montez sur la pointe des pieds, tenez 2 secondes, redescendez.",
      "3 séries de 15 répétitions.",
    ],
    benefice: "Stimule le retour veineux, limite les jambes lourdes.",
  },
  {
    id: "etirement-dos",
    titre: "Ouverture thoracique",
    duree: "2 min",
    resume: "Ouverture de poitrine · 8 respirations",
    intensite: "Douce",
    lieu: "Bureau",
    consignes: [
      "Mains croisées derrière la nuque, coudes ouverts.",
      "Inspirez en ouvrant la poitrine, expirez en relâchant.",
      "8 respirations lentes.",
    ],
    benefice: "Soulage les tensions cervicales et dorsales liées à l'écran.",
  },
  {
    id: "marche-rapide",
    titre: "Marche rapide",
    duree: "10 min",
    resume: "Marche rapide · 10 min",
    intensite: "Modérée",
    lieu: "Extérieur",
    consignes: [
      "Adoptez une allure où vous pouvez parler mais pas chanter.",
      "Bras actifs, regard à l'horizon.",
      "10 minutes en continu, idéalement après le repas.",
    ],
    benefice: "Améliore la glycémie post-prandiale et l'endurance cardiaque.",
  },
  {
    id: "escaliers",
    titre: "Montées d'escalier",
    duree: "3 min",
    resume: "Montées d’escalier · 3 fois",
    intensite: "Dynamique",
    lieu: "Domicile",
    consignes: [
      "Montez un étage à allure confortable.",
      "Redescendez lentement, puis répétez 3 fois.",
      "Arrêtez-vous en cas d'essoufflement inhabituel ou de douleur.",
    ],
    benefice: "Sollicite fortement le système cardio-respiratoire en peu de temps.",
  },
  {
    id: "gainage",
    titre: "Gainage au mur",
    duree: "2 min",
    resume: "Gainage au mur · 3 × 20 à 30 s",
    intensite: "Modérée",
    lieu: "Domicile",
    consignes: [
      "Dos contre le mur, glissez jusqu'à avoir les genoux à 90°.",
      "Tenez 20 à 30 secondes, respiration libre.",
      "3 répétitions avec 30 secondes de repos.",
    ],
    benefice: "Renforce les membres inférieurs et la sangle abdominale.",
  },
  {
    id: "equilibre",
    titre: "Équilibre unipodal",
    duree: "2 min",
    resume: "Équilibre sur une jambe · 3 × 20 s par côté",
    intensite: "Douce",
    lieu: "Domicile",
    consignes: [
      "Près d'un appui, tenez-vous sur une jambe 20 secondes.",
      "Alternez, 3 fois de chaque côté.",
      "Yeux ouverts, regard fixe devant vous.",
    ],
    benefice: "Prévention des chutes, travail proprioceptif.",
  },
];

export function exerciceDuJour(seed: number) {
  return exercices[seed % exercices.length]!;
}