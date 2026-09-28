import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const LIMITATIONS = [
  "Dos fragile",
  "Genoux sensibles",
  "Épaules sensibles",
  "Poignets sensibles",
  "Équilibre à surveiller",
  "Pas de sauts",
  "Travail assis uniquement",
] as const;

export const proposerSeance = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        duree: z.number().int().min(10).max(30),
        mode: z.enum(["sedentaire", "enforme", "sportif"]),
        limitations: z.array(z.enum(LIMITATIONS)).max(LIMITATIONS.length),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { genererSeance } = await import("./seance-ia.server");
    try {
      return { ok: true as const, seance: await genererSeance(data) };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/429/.test(msg)) return { ok: false as const, error: "Trop de demandes, patientez un instant." };
      if (/402|credit/i.test(msg)) return { ok: false as const, error: "Crédits IA épuisés pour le moment." };
      return { ok: false as const, error: msg.length < 120 ? msg : "La génération a échoué, réessayez." };
    }
  });
