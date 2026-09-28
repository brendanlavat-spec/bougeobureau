import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Download, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useHealth } from "@/lib/health-store";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Protection des données | Prévention Santé" },
      { name: "description", content: "Politique de confidentialité RGPD : stockage local, aucune donnée nominative, export et effacement à la demande." },
      { property: "og:title", content: "Protection des données" },
      { property: "og:description", content: "Comment vos données de santé sont traitées, conservées et effacées." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfidentialitePage,
});

const sections = [
  {
    titre: "Responsable de traitement",
    contenu:
      "Le médecin qui vous a remis cette application est responsable du traitement. Il vous communique ses coordonnées lors de la remise de l'application. Toute question relative à vos données peut lui être adressée directement.",
  },
  {
    titre: "Données collectées",
    contenu:
      "Uniquement l'horodatage de vos pauses actives, l'exercice éventuellement réalisé et vos réglages (fréquence des rappels, horaires de travail et de domicile, choix du lieu du jour, objectif de pauses). Aucune mesure médicale (tension, biologie, poids, questionnaire de santé) n'est collectée : l'application ne traite pas de données de santé et ne relève donc pas de l'hébergement HDS.",
  },
  {
    titre: "Absence de données nominatives",
    contenu:
      "Aucun nom, prénom, date de naissance, adresse, numéro de téléphone ou e-mail n'est demandé. Votre suivi est identifié par un code pseudonyme généré aléatoirement sur votre appareil.",
  },
  {
    titre: "Où sont stockées vos données",
    contenu:
      "Exclusivement dans la mémoire locale de votre appareil. Aucune donnée n'est transmise à un serveur, à un hébergeur ou à un tiers. Il n'existe donc aucune copie de vos données ailleurs que sur votre téléphone.",
  },
  {
    titre: "Finalité et base légale",
    contenu:
      "Les données servent uniquement à vous rappeler de bouger et à afficher vos statistiques de pauses. La base légale est votre consentement (article 6.1.a du RGPD), recueilli au premier lancement et révocable à tout moment.",
  },
  {
    titre: "Durée de conservation",
    contenu:
      "Les données sont conservées tant que vous utilisez l'application. Elles sont supprimées immédiatement et définitivement si vous utilisez le bouton d'effacement ci-dessous ou si vous désinstallez l'application.",
  },
  {
    titre: "Vos droits",
    contenu:
      "Vous disposez des droits d'accès, de rectification, d'effacement, de limitation et de portabilité. L'export ci-dessous vous permet d'exercer votre droit à la portabilité dans un format lisible. Vous pouvez introduire une réclamation auprès de la CNIL.",
  },
];

function ConfidentialitePage() {
  const { data, eraseAll, exportJson, setConsent } = useHealth();

  const download = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prevention-sante-${data.profile.code || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-hero-gradient px-5 pt-8 pb-14 text-primary-foreground">
        <div className="mx-auto w-full max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm opacity-80 hover:opacity-100">
            <ArrowLeft className="size-4" /> Retour
          </Link>
          <div className="mt-6 inline-flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="mt-4 text-3xl font-bold">Protection des données</h1>
          <p className="mt-2 text-sm opacity-80">Politique de confidentialité conforme au RGPD.</p>
        </div>
      </header>

      <main className="mx-auto -mt-8 w-full max-w-3xl space-y-4 px-4">
        <div className="space-y-5 rounded-3xl bg-card p-6 shadow-card">
          {sections.map((s) => (
            <section key={s.titre}>
              <h2 className="text-sm font-bold text-card-foreground">{s.titre}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.contenu}</p>
            </section>
          ))}
        </div>

        <div className="space-y-3 rounded-3xl bg-card p-5 shadow-card">
          <h2 className="text-sm font-bold text-card-foreground">Exercer vos droits</h2>
          <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={download}>
            <Download className="size-4" /> Exporter mes données (JSON)
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="h-12 w-full rounded-2xl">
                <Trash2 className="size-4" /> Effacer toutes mes données
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Effacer définitivement vos données ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Votre historique de pauses et vos réglages seront supprimés de cet appareil. Cette action est
                  irréversible et retire également votre consentement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    eraseAll();
                    setConsent(null);
                    toast.success("Données effacées");
                  }}
                >
                  Tout effacer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {data.consent?.accepted ? (
            <p className="pt-1 text-xs text-muted-foreground">
              Consentement (version {data.consent.version}) donné le{" "}
              {new Date(data.consent.acceptedAt).toLocaleDateString("fr-FR")}. Code patient :{" "}
              <span className="font-semibold">{data.profile.code}</span>.
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}