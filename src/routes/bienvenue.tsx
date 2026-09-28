import { createFileRoute } from "@tanstack/react-router";
import { BienvenueParcours } from "@/components/BienvenueParcours";

export const Route = createFileRoute("/bienvenue")({
  head: () => ({
    meta: [
      { title: "Bienvenue | Bouge au bureau" },
      { name: "description", content: "Découvrez en un coup d’œil vos pauses actives, séances et points pour bouger à votre rythme." },
      { property: "og:title", content: "Bienvenue | Bouge au bureau" },
      { property: "og:description", content: "Un parcours rapide pour découvrir pauses, séances et progression." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BienvenuePage,
});

function BienvenuePage() {
  return <BienvenueParcours onTermine={() => {}} />;
}
