import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  ClipboardCheck,
  Code2,
  GraduationCap,
  Headphones,
  Leaf,
  PlayCircle,
  Rocket,
  Sparkles,
} from "lucide-react";
import { CongoMotif } from "@/components/CongoMotif";

const phases = [
  {
    n: 1,
    name: "Analyse des besoins",
    icon: ClipboardCheck,
    weeks: [1, 2],
    deliverables: [
      "Ateliers utilisateurs (Programmes, Achats, Reporting, Audit)",
      "Cartographie du processus actuel",
      "Cahier des charges fonctionnel signé",
    ],
  },
  {
    n: 2,
    name: "Conception (architecture & design)",
    icon: PlayCircle,
    weeks: [3, 4],
    deliverables: [
      "Modèle BPMN/DMN du circuit de validation",
      "Maquettes UI haute fidélité validées",
      "Architecture technique & schéma de base",
    ],
  },
  {
    n: 3,
    name: "Développement & tests",
    icon: Code2,
    weeks: [5, 6, 7, 8, 9],
    deliverables: [
      "Itérations hebdomadaires",
      "Tests unitaires + tests d'intégration automatisés",
      "Recette utilisateur progressive",
    ],
  },
  {
    n: 4,
    name: "Déploiement",
    icon: Rocket,
    weeks: [10],
    deliverables: [
      "Déploiement en environnement de pré-production",
      "Bascule production accompagnée",
      "Migration des données existantes",
    ],
  },
  {
    n: 5,
    name: "Formation des utilisateurs",
    icon: GraduationCap,
    weeks: [11],
    deliverables: [
      "Formation par rôle (5 sessions)",
      "Manuel utilisateur + capsules vidéo",
      "Référents internes formés",
    ],
  },
  {
    n: 6,
    name: "Assistance technique post-déploiement",
    icon: Headphones,
    weeks: [12],
    deliverables: [
      "Support 4 semaines incluses",
      "SLA Hot-fix < 24 h",
      "Rapport final & recommandations d'évolution",
    ],
  },
];

const TOTAL_WEEKS = 12;

export default function MethodologyPage() {
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
              Tech Solutions Congo · Méthodologie de mise en œuvre
            </div>
          </div>
        </Link>
        <div className="flex gap-3">
          <Link href="/architecture" className="text-sm font-medium text-ink-600 hover:text-wwf-700">
            Architecture
          </Link>
          <Link href="/proof" className="text-sm font-medium text-ink-600 hover:text-wwf-700">
            Conformité TDR
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
          <Sparkles className="h-3 w-3" />
          TDR §5 + §7 · Méthodologie · 12 semaines (3 mois max)
        </span>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-5xl">
          Méthodologie de mise en œuvre
        </h1>
        <p className="mt-3 max-w-3xl text-base text-ink-600">
          Six phases structurées sur la durée maximale de la mission, adaptées
          au calendrier institutionnel de WWF-RDC. Approche itérative,
          jalonnée par des recettes utilisateurs et formellement clôturée par
          un transfert de compétences.
        </p>

        {/* Gantt-style timeline */}
        <div className="mt-10 overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card">
          <div className="border-b border-ink-100 bg-ink-50 px-5 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              Calendrier de mise en œuvre
            </div>
            <div className="text-sm font-semibold text-ink-900">
              Vue Gantt synthétique — 12 semaines
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/40 text-left text-[10.5px] uppercase tracking-wider text-ink-500">
                <th className="px-5 py-2 font-medium">Phase</th>
                {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                  <th
                    key={i}
                    className="border-l border-ink-100 px-1 py-2 text-center font-mono text-[10px] font-medium text-ink-500"
                  >
                    S{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {phases.map((p) => {
                const Icon = p.icon;
                return (
                  <tr key={p.n} className="border-b border-ink-50 last:border-none">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span>
                          <div className="text-[10.5px] font-mono text-ink-400">
                            P{p.n}
                          </div>
                          <div className="text-sm font-medium text-ink-800">
                            {p.name}
                          </div>
                        </span>
                      </div>
                    </td>
                    {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                      const week = i + 1;
                      const active = p.weeks.includes(week);
                      return (
                        <td
                          key={i}
                          className="border-l border-ink-100 px-1 py-3 text-center align-middle"
                        >
                          {active ? (
                            <div className="mx-auto h-3 rounded-sm bg-gradient-to-r from-wwf-500 to-wwf-700" />
                          ) : (
                            <div className="mx-auto h-3 rounded-sm bg-ink-50" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Per-phase deliverables */}
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {phases.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.n}
                className="rounded-xl border border-ink-200 bg-white p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-[11px] font-mono text-ink-400">
                        Phase {p.n} · {p.weeks.length} semaine
                        {p.weeks.length > 1 ? "s" : ""}
                      </div>
                      <h3 className="text-sm font-semibold text-ink-900">
                        {p.name}
                      </h3>
                    </div>
                  </div>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10.5px] font-medium text-ink-600">
                    S{p.weeks[0]}
                    {p.weeks.length > 1 ? `–S${p.weeks[p.weeks.length - 1]}` : ""}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-ink-700">
                  {p.deliverables.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span className="text-wwf-600">▸</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Livrables map */}
        <div className="mt-10 rounded-xl border border-ink-200 bg-white p-6 shadow-card">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-wwf-700" />
            <h2 className="text-sm font-semibold text-ink-900">
              Livrables (TDR §6)
            </h2>
          </div>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {[
              "Rapport d'analyse des besoins",
              "Architecture technique du système",
              "Prototype ou version pilote",
              "Version finale du logiciel web",
              "Manuel utilisateur (simple)",
              "Manuel technique du système",
              "Rapport final de mission",
            ].map((l) => (
              <li
                key={l}
                className="flex items-start gap-2 rounded-md border border-ink-100 bg-white px-3 py-2 text-ink-700"
              >
                <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-wwf-600 text-[10px] font-bold text-white">
                  ✓
                </span>
                {l}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/aide"
            className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-wwf-800"
          >
            Voir le manuel utilisateur
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
        © 2026 Tech Solutions Congo · Méthodologie §5 · TDR OEM43610
      </footer>
    </div>
  );
}
