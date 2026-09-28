import { useState } from "react";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Exercice } from "@/lib/exercices";

export function ExerciseHelp({ exercice, contrast = false }: { exercice: Exercice; contrast?: boolean }) {
  const [open, setOpen] = useState(false);
  const helpId = `aide-${exercice.id}`;

  return (
    <div className="contents">
      <Button
        type="button"
        size="icon"
        variant={contrast ? "secondary" : "outline"}
        className="size-9 rounded-full"
        aria-label={`${open ? "Masquer" : "Afficher"} l’aide pour ${exercice.titre}`}
        aria-expanded={open}
        aria-controls={helpId}
        title={`Aide : ${exercice.titre}`}
        onClick={() => setOpen((value) => !value)}
      >
        <CircleHelp className="size-5" />
      </Button>
      {open && (
        <div id={helpId} className={contrast ? "w-full text-sm leading-relaxed text-sun-foreground" : "w-full text-sm leading-relaxed text-muted-foreground"}>
          <ol className="list-decimal space-y-1 pl-5">
            {exercice.consignes.map((consigne) => <li key={consigne}>{consigne}</li>)}
          </ol>
          <p className="mt-2">{exercice.benefice}</p>
        </div>
      )}
    </div>
  );
}