import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  FileSignature,
  Gauge,
  Layers,
  Leaf,
  Lock,
  Network,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { CongoMotif } from "@/components/CongoMotif";

const demoAccounts = [
  { role: "Demandeur", email: "requester@tsc.demo" },
  { role: "Manager Approbateur", email: "manager@tsc.demo" },
  { role: "Officier Achats", email: "procurement@tsc.demo" },
  { role: "Approbateur Finance", email: "finance@tsc.demo" },
  { role: "Auditeur (lecture)", email: "auditor@tsc.demo" },
  { role: "Administrateur", email: "admin@tsc.demo" },
];

const trustBadges = [
  { icon: ShieldCheck, text: "Conforme TDR OEM43610" },
  { icon: Lock, text: "Conforme audit · journal infalsifiable" },
  { icon: Network, text: "Hébergeable en RDC · infonuage souverain" },
  { icon: Sparkles, text: "Conformité bailleurs internationaux" },
];

const valueProps = [
  {
    icon: Workflow,
    title: "Circuit de validation institutionnel",
    description:
      "Cycle Manager → Achats → Finance verrouillé côté serveur, retours et rejets motivés, visa Direction au-delà de 10 000 USD.",
  },
  {
    icon: ShieldCheck,
    title: "Traçabilité prête pour l'audit",
    description:
      "Chaque action est consignée — acteur, rôle, horodatage, ancienne et nouvelle valeur — exportable pour contrôle interne ou bailleur.",
  },
  {
    icon: Gauge,
    title: "Pilotage temps réel",
    description:
      "Tableau de bord exécutif et rapports filtrés : cycle, valeur engagée, retards, exceptions budgétaires, respect des SLA.",
  },
  {
    icon: Lock,
    title: "Séparation des fonctions",
    description:
      "Six rôles fonctionnels avec matrice de droits explicite, infalsifiable sur les évènements critiques. Pré-intégration Keycloak SSO / authentification forte.",
  },
];

const circuitSteps = [
  { n: 1, label: "Réquisition saisie par le demandeur", icon: FileSignature },
  { n: 2, label: "Validation managériale", icon: ShieldCheck },
  { n: 3, label: "Revue achats et sélection fournisseur", icon: ClipboardList },
  { n: 4, label: "Approbation finance et engagement budgétaire", icon: Lock },
  { n: 5, label: "Émission du bon de commande", icon: Workflow },
  { n: 6, label: "Réception biens / services (GRN / SAN)", icon: ShieldCheck },
  { n: 7, label: "Clôture, archivage et reporting", icon: ScrollText },
];

const proposalLinks = [
  { href: "/proof", title: "Conformité TDR §4", desc: "Carte exigence par exigence" },
  { href: "/architecture", title: "Architecture technique", desc: "Pile, sécurité, topologie" },
  { href: "/methodologie", title: "Méthodologie 12 semaines", desc: "Phases, livrables, Gantt" },
];

export default function DemoPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-ink-50 to-wwf-50">
      <div className="pointer-events-none absolute -right-32 -top-20 h-[520px] w-[520px] opacity-90">
        <CongoMotif className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] opacity-60">
        <CongoMotif className="h-full w-full" />
      </div>

      {/* Top bar with credibility band */}
      <div className="relative border-b border-wwf-100 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-2 text-[11px] text-ink-600 sm:flex sm:items-center sm:justify-between">
          <span>
            <span className="font-semibold text-ink-800">Tech Solutions Congo</span>{" "}
            · Réponse au marché{" "}
            <span className="font-mono">OEM43610 — WWF-RDC</span> · 30 avril 2026
          </span>
          <span className="hidden text-ink-500 sm:inline">
            Date limite de soumission : 21 mai 2026, 17h00 (Kinshasa)
          </span>
        </div>
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-wwf-600 to-wwf-800 text-white shadow-sm">
            <Leaf className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <div className="text-base font-semibold leading-tight text-ink-900">
              TSC ProcureFlow
            </div>
            <div className="text-xs text-ink-500">
              Plateforme institutionnelle de gestion des achats — WWF-RDC
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/proof"
            className="hidden text-sm font-medium text-wwf-700 hover:text-wwf-800 sm:inline"
          >
            Conformité TDR
          </Link>
          <Link
            href="/architecture"
            className="hidden text-sm font-medium text-ink-600 hover:text-wwf-700 sm:inline"
          >
            Architecture
          </Link>
          <Link
            href="/methodologie"
            className="hidden text-sm font-medium text-ink-600 hover:text-wwf-700 sm:inline"
          >
            Méthodologie
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-wwf-800"
          >
            Accéder à la plateforme
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-12 pt-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-wwf-200 bg-white px-3 py-1 text-xs font-medium text-wwf-700 shadow-sm">
              Plateforme institutionnelle · prête à déployer
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-[3.25rem]">
              La gestion électronique des achats,{" "}
              <span className="text-wwf-700">à la hauteur</span>{" "}
              de WWF-RDC.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-700">
              Circuit institutionnel verrouillé. Traçabilité de bout en
              bout. Restitution bailleur prête à l&apos;export. Une plateforme
              conçue pour répondre intégralement aux Termes de Référence
              OEM43610 — et pour aller au-delà.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-md bg-wwf-700 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-wwf-800"
              >
                Se connecter à la plateforme
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/proof"
                className="inline-flex items-center gap-1 rounded-md border border-ink-300 bg-white/80 px-5 py-3 text-sm font-medium text-ink-800 shadow-sm backdrop-blur transition hover:bg-white"
              >
                Voir la conformité TDR §4
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Trust band */}
            <div className="mt-10 flex flex-wrap gap-2 border-t border-ink-200 pt-5">
              {trustBadges.map((b) => {
                const Icon = b.icon;
                return (
                  <span
                    key={b.text}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white/80 px-3 py-1 text-[11.5px] font-medium text-ink-700 shadow-sm backdrop-blur"
                  >
                    <Icon className="h-3.5 w-3.5 text-wwf-700" />
                    {b.text}
                  </span>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <BigStat label="Étapes du circuit" value="7" />
              <BigStat label="Rôles fonctionnels" value="6" />
              <BigStat label="Évènements audités" value="100 %" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-ink-200 bg-white/90 p-6 shadow-card backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink-900">
                  Cycle d&apos;achat couvert
                </h2>
                <span className="rounded-full bg-wwf-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-wwf-700">
                  Bout en bout
                </span>
              </div>
              <ol className="mt-4 space-y-2.5">
                {circuitSteps.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li
                      key={s.n}
                      className="flex items-center gap-3 rounded-md bg-white px-3 py-2 ring-1 ring-ink-100"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-wwf-50 text-wwf-700">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="text-sm text-ink-800">{s.label}</div>
                      <span className="ml-auto text-[11px] font-mono text-ink-400">
                        {String(s.n).padStart(2, "0")}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>

        {/* Value props */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-xl border border-ink-200 bg-white/90 p-5 shadow-card backdrop-blur"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-ink-900">
                  {v.title}
                </h3>
                <p className="mt-1 text-xs text-ink-600">{v.description}</p>
              </div>
            );
          })}
        </div>

        {/* Proposal artefacts */}
        <div className="mt-12 rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">
              Dossier technique
            </h2>
            <span className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
              Livrables §6
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-600">
            Trois pages dédiées à l&apos;évaluation technique : conformité TDR,
            architecture cible, méthodologie de mise en œuvre.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {proposalLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group flex items-center justify-between gap-3 rounded-lg border border-ink-200 bg-white px-4 py-3 transition hover:border-wwf-300 hover:bg-wwf-50/40"
              >
                <span>
                  <div className="text-sm font-semibold text-ink-900">
                    {l.title}
                  </div>
                  <div className="text-[11.5px] text-ink-500">{l.desc}</div>
                </span>
                <ChevronRight className="h-4 w-4 text-ink-400 group-hover:text-wwf-700" />
              </Link>
            ))}
          </div>
        </div>

        {/* Demo accounts + architecture sidebar */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-ink-200 bg-white/90 p-6 shadow-card backdrop-blur">
            <h2 className="text-sm font-semibold text-ink-900">
              Comptes de démonstration
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Six profils — chaque rôle voit une interface adaptée à ses
              responsabilités. Mot de passe commun :{" "}
              <span className="font-mono text-ink-800">demo123</span>.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {demoAccounts.map((a) => (
                <div
                  key={a.email}
                  className="flex items-center justify-between rounded-md border border-ink-100 bg-white px-3 py-2 text-sm"
                >
                  <span className="font-medium text-ink-800">{a.role}</span>
                  <span className="font-mono text-[11px] text-ink-500">
                    {a.email}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-wwf-200 bg-gradient-to-br from-wwf-50 via-white to-white p-6 text-sm text-wwf-900 shadow-card">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Architecture cible</h2>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li>• Keycloak — SSO et authentification forte (MFA)</li>
              <li>• Camunda BPMN/DMN — orchestration des circuits</li>
              <li>• PostgreSQL durci · sauvegardes chiffrées</li>
              <li>• MinIO — stockage objet sécurisé</li>
              <li>• Grafana / Prometheus / Loki — observabilité</li>
              <li>• Audit externe et journalisation immuable</li>
            </ul>
            <Link
              href="/architecture"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3 py-2 text-xs font-medium text-white hover:bg-wwf-800"
            >
              Voir l&apos;architecture détaillée
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative mx-auto max-w-6xl border-t border-ink-200 px-6 py-6 text-xs text-ink-500">
        © 2026 Tech Solutions Congo · Réponse au marché OEM43610 · WWF-RDC
      </footer>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-200 bg-white/70 px-3 py-2 backdrop-blur">
      <div className="text-2xl font-semibold tracking-tight text-wwf-800">
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-ink-500">
        {label}
      </div>
    </div>
  );
}
