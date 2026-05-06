import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Cloud,
  Database,
  KeyRound,
  Layers,
  Leaf,
  Lock,
  Network,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import { CongoMotif } from "@/components/CongoMotif";

const layers = [
  {
    title: "Présentation",
    icon: Boxes,
    desc: "Next.js 14 (App Router) · TypeScript · Tailwind · accessible WCAG 2.1 AA, français / anglais, prêt pour le mobile.",
    bullets: [
      "Rendu côté serveur + cache HTTP pour une latence < 150 ms",
      "Composants React isolés et testables",
      "Thème institutionnel WWF, charte graphique respectée",
    ],
  },
  {
    title: "Application",
    icon: TerminalSquare,
    desc: "Server Actions Next.js + routes API pour mutations / exports · validation Zod systématique aux frontières.",
    bullets: [
      "Contrôle d'accès strict via assertCan() (matrice unique de droits)",
      "Idempotence des opérations critiques",
      "Pagination, recherche plein texte, filtrage côté serveur",
    ],
  },
  {
    title: "Orchestration des circuits",
    icon: Workflow,
    desc: "Camunda 8 (BPMN/DMN) en production · machine à états TypeScript auditable côté pilote.",
    bullets: [
      "Modèle BPMN versionné dans Git",
      "Règles d'approbation modélisées en DMN",
      "Évolutions métier possibles sans redéploiement",
    ],
  },
  {
    title: "Identité & accès",
    icon: KeyRound,
    desc: "Keycloak en production : authentification unique (SSO), authentification forte (MFA), fédération AD/LDAP, groupes et rôles synchronisés.",
    bullets: [
      "Authentification forte (TOTP, WebAuthn)",
      "Jetons OIDC à courte durée + renouvellement",
      "Audit des connexions et des tentatives échouées",
    ],
  },
  {
    title: "Données structurées",
    icon: Database,
    desc: "PostgreSQL 16 durci · réplication streaming · sauvegardes chiffrées multi-régions.",
    bullets: [
      "RPO ≤ 15 min, RTO ≤ 60 min",
      "PITR (point-in-time recovery)",
      "Tests de restauration mensuels",
    ],
  },
  {
    title: "Stockage objet",
    icon: Cloud,
    desc: "MinIO (compatible S3) · chiffrement au repos · versionnage · politiques d'accès par dossier.",
    bullets: [
      "Indexation et reconnaissance optique (Apache Tika) pour les pièces scannées",
      "Liens signés à expiration courte",
      "Quotas et alertes sur la volumétrie",
    ],
  },
  {
    title: "Observabilité",
    icon: Network,
    desc: "Prometheus, Grafana, Loki · alertes opérationnelles · traces OpenTelemetry.",
    bullets: [
      "Tableaux de bord d'engagements de service publics",
      "Astreintes 24/7 cadrées dans le dispositif d'exploitation",
      "Détection d'anomalies par règles et seuils",
    ],
  },
  {
    title: "Conformité & journalisation",
    icon: ScrollText,
    desc: "Journal infalsifiable · chaînage cryptographique · contre-signature · export bailleur.",
    bullets: [
      "Conservation de 10 ans minimum",
      "Procédure de droit d'accès et droit à l'oubli",
      "Politique de classification des données",
    ],
  },
];

const integrations = [
  { name: "Notifications par courriel", system: "SMTP transactionnel (Mailjet / Sendgrid)" },
  { name: "Notifications par SMS", system: "Passerelle locale RDC (Africa's Talking)" },
  { name: "Signature électronique", system: "DocuSign / Adobe Sign" },
  { name: "Comptabilité bailleur", system: "Connecteurs ERP (CSV / REST / SAP B1)" },
  { name: "Paiements", system: "Banques partenaires + monnaie électronique" },
  { name: "Référentiels", system: "Liste OFAC, sanctions UE, RCCM RDC" },
];

const securityControls = [
  "Chiffrement TLS 1.3 obligatoire (HSTS pré-chargé)",
  "Chiffrement au repos AES-256 sur la base et le stockage objet",
  "Secrets gérés via Vault (rotation automatique)",
  "Politique de mots de passe + authentification forte imposée",
  "Audit annuel : test d'intrusion externe + programme de chasse aux vulnérabilités",
  "Conformité RGPD-équivalente : registre, DPO, droits",
  "Sauvegardes 3-2-1, exercice de restauration mensuel",
  "Plan de continuité (PCA) et de reprise (PRA) documentés",
];

export default function ArchitecturePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-ink-50 to-wwf-50">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] opacity-70">
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
              Tech Solutions Congo · Architecture technique
            </div>
          </div>
        </Link>
        <div className="flex gap-3">
          <Link href="/proof" className="text-sm font-medium text-ink-600 hover:text-wwf-700">
            Conformité TDR
          </Link>
          <Link href="/methodologie" className="text-sm font-medium text-ink-600 hover:text-wwf-700">
            Méthodologie
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-wwf-800"
          >
            Démonstration
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-12 pt-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-wwf-200 bg-white px-3 py-1 text-xs font-medium text-wwf-700 shadow-sm">
          <Layers className="h-3 w-3" />
          Livrable §6 · Architecture technique du système
        </span>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
          Architecture technique de la plateforme
        </h1>
        <p className="mt-3 max-w-3xl text-base text-ink-600">
          Architecture par couches, ouverte, hébergeable en RDC ou en cloud
          souverain, conçue pour répondre aux exigences de sécurité, de
          traçabilité et de continuité d&apos;activité d&apos;une organisation
          internationale opérant en République Démocratique du Congo.
        </p>

        {/* Layered diagram */}
        <div className="mt-10 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
          <div className="border-b border-ink-100 bg-ink-50 px-5 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Vue d&apos;ensemble
            </div>
            <div className="text-sm font-semibold text-ink-900">
              Pile applicative et infrastructure cible
            </div>
          </div>
          <div className="grid divide-y divide-ink-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
            {layers.map((l, i) => {
              const Icon = l.icon;
              return (
                <div key={l.title} className="flex gap-4 px-5 py-4">
                  <div className="shrink-0">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10.5px] text-ink-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-sm font-semibold text-ink-900">
                        {l.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-ink-600">{l.desc}</p>
                    <ul className="mt-2 space-y-0.5 text-[11px] text-ink-700">
                      {l.bullets.map((b) => (
                        <li key={b} className="flex gap-1.5">
                          <span className="text-wwf-600">▸</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-column: integrations + security */}
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-wwf-700" />
              <h2 className="text-sm font-semibold text-ink-900">
                Intégrations externes
              </h2>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              Connecteurs prévus pour s&apos;insérer dans l&apos;écosystème
              opérationnel de WWF-RDC.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {integrations.map((i) => (
                <li
                  key={i.name}
                  className="flex justify-between gap-3 rounded-md border border-ink-100 px-3 py-2"
                >
                  <span className="font-medium text-ink-800">{i.name}</span>
                  <span className="text-xs text-ink-500">{i.system}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-wwf-200 bg-gradient-to-br from-wwf-50 via-white to-white p-6 shadow-card">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-wwf-700" />
              <h2 className="text-sm font-semibold text-wwf-900">
                Posture de sécurité
              </h2>
            </div>
            <p className="mt-1 text-xs text-wwf-900/80">
              Contrôles applicables à la plateforme cible — alignés sur les
              attentes des bailleurs internationaux.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {securityControls.map((s) => (
                <li key={s} className="flex items-start gap-2 text-wwf-900">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wwf-700" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Topology */}
        <div className="mt-10 rounded-xl border border-ink-200 bg-white p-6 shadow-card">
          <h2 className="text-sm font-semibold text-ink-900">
            Topologie de déploiement cible
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            Architecture multi-zones — séparation stricte du frontend public,
            de l&apos;API métier, du moteur de circuits et du stockage durci.
          </p>
          <div className="mt-4 grid gap-3 text-xs lg:grid-cols-3">
            {[
              { tier: "Zone publique", items: ["CDN / pare-feu applicatif (WAF)", "Mandataire inverse", "Limitation de débit"] },
              { tier: "Zone applicative", items: ["Next.js (rendu serveur)", "API métier", "Camunda Operate"] },
              { tier: "Zone de données", items: ["PostgreSQL primaire + réplica", "MinIO", "Sauvegardes chiffrées"] },
            ].map((z) => (
              <div
                key={z.tier}
                className="rounded-md border border-ink-100 bg-ink-50/40 p-3"
              >
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-wwf-700">
                  {z.tier}
                </div>
                <ul className="mt-2 space-y-1 text-ink-700">
                  {z.items.map((it) => (
                    <li key={it}>• {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/methodologie"
            className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-wwf-800"
          >
            Voir la méthodologie de mise en œuvre
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-600 hover:text-wwf-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la page d&apos;accueil
          </Link>
        </div>
      </section>

      <footer className="relative mx-auto max-w-6xl border-t border-ink-200 px-6 py-6 text-xs text-ink-500">
        © 2026 Tech Solutions Congo · Architecture livrable §6 · TDR OEM43610
      </footer>
    </div>
  );
}
