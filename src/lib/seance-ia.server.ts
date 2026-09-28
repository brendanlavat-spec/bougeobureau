import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type SeanceIA = {
  titre: string;
  resume: string;
  blocs: { titre: string; duree: string; detail: string; zones: string }[];
  conseil: string;
};

export async function genererSeance(input: { duree: number; mode: string; limitations: string[] }): Promise<SeanceIA> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("Service IA non configuré.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const modeTxt = { sedentaire: "sédentaire (débutant, reprise en douceur)", enforme: "en forme (activité modérée)", sportif: "sportif (habitué à l'effort)" }[input.mode] ?? input.mode;
  const lim = input.limitations.length ? input.limitations.join(", ") : "aucune";

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system:
      "Tu es un coach en activité physique adaptée, travaillant pour un médecin. Tu proposes des séances sûres, réalisables au bureau ou à domicile sans matériel, en français, au ton chaleureux et rassurant. Tu ne poses aucun diagnostic. Réponds UNIQUEMENT par un objet JSON valide, sans texte autour.",
    prompt: `Crée une séance de exactement ${input.duree} minutes pour une personne au profil ${modeTxt}.
Limitations à respecter (éviter ou adapter les mouvements concernés) : ${lim}.
La séance doit mobiliser toutes les grandes articulations (cou, épaules, coudes, poignets, colonne, hanches, genoux, chevilles) et les grands groupes musculaires, avec échauffement, corps de séance et retour au calme. 4 à 6 blocs, durées dont la somme = ${input.duree} min.
Format JSON : {"titre": string, "resume": string (1 phrase), "blocs": [{"titre": string, "duree": string ex "3 min", "detail": string (consignes concrètes, répétitions), "zones": string (articulations/muscles)}], "conseil": string (1 phrase de sécurité ou motivation)}`,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Réponse IA illisible, réessayez.");
  const parsed = JSON.parse(match[0]) as SeanceIA;
  if (!Array.isArray(parsed.blocs) || !parsed.blocs.length) throw new Error("Séance incomplète, réessayez.");
  return parsed;
}
