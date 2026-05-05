import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Inbox,
  PackageCheck,
  ShieldCheck,
  Truck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { ROLE_LABELS } from "@/lib/workflow";
import type { Role } from "@/lib/enums";

export const dynamic = "force-dynamic";

type Section = {
  icon: LucideIcon;
  title: string;
  body: string;
  steps: string[];
};

const COMMON: Section[] = [
  {
    icon: BookOpen,
    title: "Se repérer dans la plateforme",
    body: "Le menu de gauche donne accès à votre espace de travail, aux outils achats, au pilotage et à l'aide. Le bandeau du haut indique votre rôle, vos notifications et permet de vous déconnecter.",
    steps: [
      "Cliquez sur le logo pour revenir au tableau de bord",
      "L'icône cloche signale les nouvelles notifications",
      "Votre rôle est affiché à gauche du bandeau",
    ],
  },
];

const BY_ROLE: Record<Role, Section[]> = {
  REQUESTER: [
    {
      icon: FileText,
      title: "Créer une réquisition",
      body: "Démarrez une demande d'achat depuis « Nouvelle réquisition ». Les champs marqués sont obligatoires : objet, département, projet, ligne budgétaire, quantité, montant et justification.",
      steps: [
        "Renseignez l'objet et la justification de manière précise",
        "Sélectionnez la ligne budgétaire — le solde restant est affiché",
        "Indiquez la quantité et l'unité de mesure",
        "Choisissez le type de procédure (devis, appel d'offres…)",
        "Enregistrez en brouillon ou soumettez pour validation",
      ],
    },
    {
      icon: Eye,
      title: "Suivre vos dossiers",
      body: "L'onglet « Mes réquisitions » liste tous vos dossiers avec leur statut. Cliquez sur un dossier pour consulter le cycle d'approbation, les commentaires et les documents associés.",
      steps: [
        "Filtrez par statut, projet ou priorité",
        "La frise indique l'étape en cours",
        "Vous recevez une notification à chaque décision",
      ],
    },
  ],
  APPROVER: [
    {
      icon: Inbox,
      title: "Traiter votre file d'approbation",
      body: "L'onglet « File d'approbation » regroupe les dossiers en attente de votre validation hiérarchique, triés par priorité puis par ancienneté.",
      steps: [
        "Examinez les informations clés et la justification",
        "Vérifiez la cohérence avec la ligne budgétaire",
        "Approuvez, retournez pour révision (avec motif) ou rejetez",
        "Le commentaire est obligatoire pour un retour ou un rejet",
      ],
    },
  ],
  PROCUREMENT: [
    {
      icon: Truck,
      title: "Gérer les fournisseurs",
      body: "L'onglet « Fournisseurs » contient le registre. Vous pouvez créer une fiche, mettre à jour le statut, et consigner la diligence raisonnable.",
      steps: [
        "Renseignez l'identité fiscale et les coordonnées",
        "Mettez à jour le statut (Préqualifié, Suspendu…)",
        "Renseignez la diligence raisonnable étape par étape",
      ],
    },
    {
      icon: ClipboardList,
      title: "Émettre un bon de commande",
      body: "Une fois la réquisition validée par le seuil hiérarchique, sélectionnez le fournisseur retenu et émettez le bon de commande. Le PO est numéroté automatiquement et lié à la réquisition.",
      steps: [
        "Ouvrez la réquisition au statut « BC émis »",
        "Sélectionnez le fournisseur retenu (issu de l'analyse des offres)",
        "Le PO peut être imprimé pour signature",
      ],
    },
    {
      icon: PackageCheck,
      title: "Constater une réception",
      body: "Pour les biens : Bon de Réception (GRN). Pour les services : Constat d'Acceptation (SAN). Signalez tout écart afin de tracer la non-conformité.",
      steps: [
        "Choisissez le type de réception adapté",
        "Notez les observations et joignez les pièces si nécessaire",
        "Cochez « Écart constaté » et décrivez le problème le cas échéant",
      ],
    },
  ],
  SUPPLIER_MANAGER: [
    {
      icon: Truck,
      title: "Gérer le registre fournisseurs",
      body: "Tenez le registre à jour : préqualification, diligence raisonnable, attestation Annexe B et performance.",
      steps: [
        "Créez ou mettez à jour les fiches fournisseurs",
        "Suivez les vérifications de diligence raisonnable",
        "Enregistrez la signature de l'Annexe B (anti-corruption)",
      ],
    },
  ],
  RECEIVER: [
    {
      icon: PackageCheck,
      title: "Constater une réception",
      body: "Pour les biens : Bon de Réception (GRN). Pour les services : Constat d'Acceptation (SAN).",
      steps: [
        "Choisissez le type de réception adapté",
        "Notez les observations et joignez les pièces si nécessaire",
        "Cochez « Écart constaté » et décrivez le problème le cas échéant",
      ],
    },
  ],
  REPORTING: [
    {
      icon: BarChart3,
      title: "Produire les rapports",
      body: "Tableau de bord exécutif, indicateurs de performance, exports Excel/PDF.",
      steps: [
        "Filtrez par projet, statut, période",
        "Téléchargez les exports CSV",
        "Imprimez les éditions PDF officielles",
      ],
    },
  ],
  AUDITOR: [
    {
      icon: Eye,
      title: "Lecture seule",
      body: "Votre profil donne accès à l'ensemble des dossiers, du journal d'audit et des rapports, sans possibilité de modification. Aucune action n'altère les données.",
      steps: [
        "Filtrez le journal d'audit par acteur, action ou période",
        "Exportez les rapports au format CSV pour analyse",
        "Toutes vos consultations sont elles-mêmes auditées",
      ],
    },
  ],
  ADMIN: [
    {
      icon: Workflow,
      title: "Configurer la plateforme",
      body: "Depuis l'espace Administration vous gérez les utilisateurs, les rôles, les seuils d'approbation, les SLA et la matrice des droits.",
      steps: [
        "Créez ou désactivez les comptes utilisateurs",
        "Ajustez les seuils des paliers d'approbation",
        "Visualisez la matrice des droits — source unique de vérité",
      ],
    },
  ],
};

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Comment savoir où en est mon dossier ?",
    a: "Ouvrez la réquisition : la frise du cycle d'approbation indique l'étape en cours. Le panneau « Suivi des délais par étape » détaille la durée passée à chaque étape.",
  },
  {
    q: "Puis-je modifier une réquisition après soumission ?",
    a: "Non. Une fois soumise, la réquisition est verrouillée. Le validateur peut la « retourner pour révision » : elle redevient alors modifiable.",
  },
  {
    q: "Pourquoi mon e-mail ne reçoit-il rien ?",
    a: "Le prototype affiche les notifications dans l'application uniquement (icône cloche). En production, les notifications sont aussi envoyées par e-mail (SMTP) et SMS.",
  },
  {
    q: "Comment exporter mes données ?",
    a: "Les pages Réquisitions, Rapports et Journal d'audit proposent un bouton « Export CSV » qui télécharge un fichier compatible Excel.",
  },
  {
    q: "Qui peut annuler une réquisition ?",
    a: "Seul l'administrateur peut annuler une réquisition active, avec un motif obligatoire consigné au journal d'audit. Personne ne peut supprimer un dossier.",
  },
];

export default async function AidePage() {
  const user = await requireUser();
  const role = user.role as Role;
  const sections = [...COMMON, ...BY_ROLE[role]];

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-wwf-700">
          Manuel utilisateur
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          Aide & manuel utilisateur
        </h1>
        <p className="text-sm text-ink-500">
          Guide adapté à votre rôle ({ROLE_LABELS[role]}). Toutes les
          fonctionnalités sont décrites ; un guide PDF imprimable est
          également remis à la livraison.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title}>
              <CardHeader
                title={
                  <span className="inline-flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {s.title}
                  </span>
                }
              />
              <CardBody>
                <p className="text-sm text-ink-700">{s.body}</p>
                <ul className="mt-3 space-y-1.5 text-xs text-ink-700">
                  {s.steps.map((st) => (
                    <li key={st} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wwf-600" />
                      {st}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader title="Questions fréquentes" />
        <CardBody className="space-y-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="rounded-md border border-ink-100 bg-white px-3 py-2 open:border-wwf-200 open:bg-wwf-50/30"
            >
              <summary className="cursor-pointer text-sm font-medium text-ink-800">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-ink-700">{f.a}</p>
            </details>
          ))}
        </CardBody>
      </Card>

      <div className="rounded-lg border border-dashed border-wwf-200 bg-wwf-50/40 px-4 py-3 text-xs text-wwf-900">
        Besoin d&apos;assistance ? Contactez votre administrateur, ou écrivez
        à <span className="font-mono">support-procureflow@wwfdrc.org</span>.
      </div>
    </div>
  );
}
