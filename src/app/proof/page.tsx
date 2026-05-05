import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Leaf,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { CongoMotif } from "@/components/CongoMotif";

const cards: Array<{
  title: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
}> = [
  {
    title: "1. Réquisition",
    icon: ClipboardList,
    description:
      "Saisie structurée d'une demande d'achat avec département, projet, description, quantité, budget, ligne budgétaire, justificatifs et numéro auto — sans choix fournisseur ni méthode d'achat côté Demandeur.",
    bullets: [
      "Brouillon ou soumission immédiate",
      "Numéro unique automatique",
      "Quantité, unité de mesure et contrôle budgétaire",
    ],
  },
  {
    title: "2. Circuit de validation",
    icon: Workflow,
    description:
      "Cycle Demandeur → Approbateur hiérarchique → Achats → Fournisseurs → Achats → Réception → Audit/Reporting, avec retour pour révision, rejet motivé et seuil renforcé au-delà des montants configurés.",
    bullets: [
      "Transitions verrouillées côté serveur",
      "Notifications automatiques (TDR §4.2)",
      "Suivi des délais par étape + détection des retards",
    ],
  },
  {
    title: "3. Tableau de bord",
    icon: Gauge,
    description:
      "Vision exécutive consolidée : volumes par statut, valeur engagée, cycle moyen, retards d'approbation, exceptions budgétaires.",
    bullets: [
      "Indicateurs temps réel multi-départements",
      "Analyse des offres comparée (TDR §4.4)",
      "Exports CSV / Excel / PDF (TDR §4.8)",
    ],
  },
  {
    title: "4. Audit trail",
    icon: ShieldCheck,
    description:
      "Traçabilité de bout en bout : chaque action est consignée avec acteur, rôle, horodatage, ancien et nouvel état, et commentaire associé.",
    bullets: [
      "Filtres par acteur, entité, action, période",
      "Recherche rapide des documents (TDR §4.7)",
      "Pré-câblage pour journalisation immuable",
    ],
  },
];

// Conformance map TDR §4 ↔ features delivered, with the role responsible.
const conformance: Array<{
  tdr: string;
  role: string;
  status: "done" | "exceed";
  evidence: string;
  link?: string;
}> = [
  {
    tdr: "§4.1 Création/soumission électronique",
    role: "Demandeur",
    status: "done",
    evidence: "Formulaire /requisitions/new",
    link: "/requisitions",
  },
  {
    tdr: "§4.1 Numéro unique automatique",
    role: "Système",
    status: "done",
    evidence: "Format PR-AAAA-NNNN généré côté serveur",
  },
  {
    tdr: "§4.1 Saisie infos clés (dépt, projet, quantité, budget, ligne)",
    role: "Demandeur (saisit) · Admin (référentiels)",
    status: "done",
    evidence: "Champs + listes peuplées par /admin/projects, /admin/budget-lines, /admin/departments",
  },
  {
    tdr: "§4.1 Pièces justificatives",
    role: "Demandeur + tous les rôles du circuit",
    status: "done",
    evidence: "Zone de dépôt sur réquisition · MinIO en production",
  },
  {
    tdr: "§4.1 Sécurité des accès",
    role: "Admin",
    status: "done",
    evidence: "Matrice des droits + Keycloak en production",
    link: "/admin/settings",
  },
  {
    tdr: "§4.2 Validation hiérarchique selon seuils",
    role: "Approbateur hiérarchique · Achats · seuil renforcé (>10k USD)",
    status: "done",
    evidence: "3 paliers (<1k, 1k–10k, >10k USD)",
    link: "/admin/settings",
  },
  {
    tdr: "§4.2 Acheminement automatique",
    role: "Système",
    status: "done",
    evidence: "currentApproverRole calculé après chaque décision",
  },
  {
    tdr: "§4.2 Notifications automatiques",
    role: "Système (déclenche) · destinataire selon rôle",
    status: "done",
    evidence: "/notifications + cloche · SMTP / SMS en production",
    link: "/notifications",
  },
  {
    tdr: "§4.2 Historique complet des décisions",
    role: "Système (consigne) · lu par Auditeur",
    status: "done",
    evidence: "Table Approvals + journal d'audit immuable",
  },
  {
    tdr: "§4.2 Structuration obligatoire des étapes",
    role: "Système",
    status: "done",
    evidence: "Machine à états vérifiée par assertCan() + isValidTransition()",
  },
  {
    tdr: "§4.3 Identification des processus en cours/approuvés/rejetés/clôturés",
    role: "Tous (vue scopée par rôle)",
    status: "done",
    evidence: "11 statuts, badges colorés, filtres",
  },
  {
    tdr: "§4.3 Suivi des délais par étape",
    role: "Tous · alertes sur file pour Approbateur/Achats",
    status: "exceed",
    evidence: "Panneau dédié sur chaque réquisition + SLA paramétrable",
  },
  {
    tdr: "§4.3 Identification des retards",
    role: "Approbateur/Achats (à leur niveau) · Auditeur/Admin (vue globale)",
    status: "exceed",
    evidence: "Badge « SLA dépassé » par étape + KPI reporting",
  },
  {
    tdr: "§4.4 Classification automatique (5 types)",
    role: "Demandeur (choisit) · Achats (peut reclasser)",
    status: "done",
    evidence: "Direct, Préqualifié, Cotations, Appel d'offres, Source unique",
  },
  {
    tdr: "§4.4 Définition étapes & responsabilités",
    role: "Admin",
    status: "exceed",
    evidence: "Matrice des droits exposée dans /admin/settings",
    link: "/admin/settings",
  },
  {
    tdr: "§4.4 Analyse des offres",
    role: "Achats (saisit/compare) · Reporting (consulte)",
    status: "exceed",
    evidence: "Tableau comparatif technique + financier sur la réquisition",
  },
  {
    tdr: "§4.4 Attribution et suivi des marchés",
    role: "Achats (émet PO) · Reporting (consulte engagement)",
    status: "done",
    evidence: "Bons de commande + suivi statut + lien fournisseur",
    link: "/purchase-orders",
  },
  {
    tdr: "§4.5 Préqualification + diligence raisonnable",
    role: "Achats (exécute) · Auditeur (vérifie) · Admin (oversight)",
    status: "done",
    evidence: "Checklist + statut + Annexe B visible sur chaque fournisseur",
    link: "/suppliers",
  },
  {
    tdr: "§4.5 Suivi des fournisseurs et commandes",
    role: "Achats (op) · Audit/Reporting (consultation)",
    status: "done",
    evidence: "/suppliers, /purchase-orders, /receipts",
  },
  {
    tdr: "§4.6 Module GRN + Service Acceptance Note",
    role: "Achats (signe) · Demandeur (peut témoigner)",
    status: "done",
    evidence: "Réceptions GRN/SAN avec écarts documentés",
    link: "/receipts",
  },
  {
    tdr: "§4.6 Observations + justificatifs",
    role: "Achats (consigne) · Auditeur (consulte)",
    status: "done",
    evidence: "Champs notes + écart + pièces jointes par PV",
  },
  {
    tdr: "§4.7 Archivage sécurisé + droits d'accès",
    role: "Système (auto) · Admin (configure droits)",
    status: "done",
    evidence: "Documents par dossier, matrice de permissions",
  },
  {
    tdr: "§4.7 Recherche rapide des documents",
    role: "Tous (vue scopée)",
    status: "exceed",
    evidence: "Explorateur global avec recherche plein texte + facettes",
    link: "/documents",
  },
  {
    tdr: "§4.8 Tableau de bord interactif + KPI",
    role: "Tous · KPIs scopés par rôle",
    status: "exceed",
    evidence: "8 workspaces distincts (1 par rôle)",
    link: "/workspaces",
  },
  {
    tdr: "§4.8 Suivi des délais de traitement",
    role: "Approbateur/Achats (op) · Auditeur (compliance)",
    status: "done",
    evidence: "Tile « Respect des SLA » + cycle moyen sparkline",
  },
  {
    tdr: "§4.8 Export Excel + PDF",
    role: "Tous (selon contexte)",
    status: "done",
    evidence: "Exports CSV + 5 PDFs premium (PR, BC, GRN/SAN, Audit, Budget)",
    link: "/reports",
  },
  {
    tdr: "§4.9 Profils utilisateurs + droits d'accès",
    role: "Admin",
    status: "done",
    evidence: "/admin/users (CRUD complet) + matrice des droits",
    link: "/admin/users",
  },
  {
    tdr: "§4.9 Traçabilité des actions",
    role: "Système (auto) · Auditeur/Admin (consulte)",
    status: "done",
    evidence: "Journal d'audit immuable, hash chaîné en production",
    link: "/audit",
  },
];

const principles = [
  "Circuit institutionnel à étapes verrouillées",
  "Traçabilité complète et journal d'audit consultable",
  "Reporting agrégé exportable",
  "Séparation stricte des rôles fonctionnels",
  "Contrôle budgétaire au niveau de la ligne",
  "Conformité avec les exigences bailleur",
];

export default function ProofPage() {
  const doneCount = conformance.filter((c) => c.status === "done").length;
  const exceedCount = conformance.filter((c) => c.status === "exceed").length;
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-ink-50 to-wwf-50">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] opacity-80">
        <CongoMotif className="h-full w-full" />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/demo" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-wwf-600 to-wwf-800 text-white shadow-sm">
            <Leaf className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight text-ink-900">
              ProcureFlow — WWF-RDC
            </div>
            <div className="text-[11px] text-ink-500">
              Tech Solutions Congo · Présentation projet
            </div>
          </div>
        </Link>
        <div className="flex gap-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-600 hover:text-wwf-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Page d&apos;accueil
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-wwf-800"
          >
            Tester la démonstration
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-12 pt-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-wwf-200 bg-white px-3 py-1 text-xs font-medium text-wwf-700 shadow-sm">
          <Sparkles className="h-3 w-3" />
          Prototype fonctionnel illustratif — couvre l&apos;intégralité des TDR
        </span>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
          Conformité aux Termes de Référence WWF-RDC
        </h1>
        <p className="mt-3 max-w-3xl text-base text-ink-600">
          Cette démonstration met en œuvre l&apos;intégralité des
          fonctionnalités décrites au point 4 des TDR du marché « Recrutement
          d&apos;un consultant IT pour le développement d&apos;une application
          web de gestion électronique du processus d&apos;achat » (Projets OD
          40001336 / 403725).
        </p>

        <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-wwf-200 bg-white px-4 py-2 text-sm shadow-sm">
          <span className="font-semibold text-ink-900">
            {conformance.length} exigences TDR couvertes
          </span>
          <span className="text-ink-300">·</span>
          <span className="text-emerald-700">{doneCount} livrées</span>
          <span className="text-ink-300">·</span>
          <span className="text-wwf-700">{exceedCount} renforcées au-delà</span>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <article
                key={c.title}
                className="flex flex-col gap-4 rounded-xl border border-ink-200 bg-white p-6 shadow-card transition hover:shadow-md"
              >
                <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-wwf-50 via-white to-ink-50 ring-1 ring-ink-100">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 opacity-40">
                    <CongoMotif className="h-full w-full" />
                  </div>
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-wwf-700 shadow-sm ring-1 ring-wwf-100">
                    <Icon className="h-6 w-6" />
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-ink-900">
                    {c.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-600">{c.description}</p>
                </div>
                <ul className="space-y-1.5 text-xs text-ink-700">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wwf-600" />
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-xl border border-ink-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">
              Carte de conformité TDR §4
            </h2>
            <span className="text-[11px] uppercase tracking-wider text-ink-500">
              Référence : OEM43610 · 30 avril 2026
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="px-3 py-2 font-medium">Exigence TDR</th>
                  <th className="px-3 py-2 font-medium">Rôle responsable</th>
                  <th className="px-3 py-2 font-medium">Statut</th>
                  <th className="px-3 py-2 font-medium">Preuve dans le prototype</th>
                </tr>
              </thead>
              <tbody>
                {conformance.map((c) => (
                  <tr
                    key={c.tdr}
                    className="border-b border-ink-50 last:border-none"
                  >
                    <td className="px-3 py-2 text-ink-800">{c.tdr}</td>
                    <td className="px-3 py-2 text-xs text-ink-700">{c.role}</td>
                    <td className="px-3 py-2">
                      {c.status === "exceed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-wwf-50 px-2 py-0.5 text-[11px] font-medium text-wwf-700 ring-1 ring-wwf-100">
                          ★ Renforcé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                          ✓ Livré
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-ink-600">
                      {c.link ? (
                        <Link
                          href={c.link}
                          className="text-wwf-700 hover:underline"
                        >
                          {c.evidence}
                        </Link>
                      ) : (
                        c.evidence
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-ink-200 bg-white p-6 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">
              Principes illustrés par le prototype
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {principles.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-2 rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-700"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-wwf-600" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-wwf-200 bg-gradient-to-br from-wwf-700 via-wwf-800 to-wwf-900 p-6 text-sm text-white shadow-card">
            <h2 className="text-sm font-semibold">Architecture cible</h2>
            <p className="mt-2 text-wwf-100">
              La version production s&apos;appuiera sur Keycloak (SSO/MFA),
              Camunda BPMN/DMN pour l&apos;orchestration des circuits,
              PostgreSQL durci, MinIO pour le stockage objet, et une pile
              d&apos;observabilité Grafana / Prometheus / Loki.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/25"
            >
              Lancer la démonstration
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative mx-auto max-w-6xl border-t border-ink-200 px-6 py-6 text-xs text-ink-500">
        © 2026 Tech Solutions Congo · Démonstration WWF-RDC · Prototype
        fonctionnel illustratif · Réf. TDR OEM43610
      </footer>
    </div>
  );
}
