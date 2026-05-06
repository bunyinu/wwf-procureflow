import Link from "next/link";
import { ArrowRight, CheckCircle2, Leaf, ShieldCheck } from "lucide-react";
import { WWF_TDR, WWF_TECHNICAL_SCORE, WWF_FINANCIAL_SCORE } from "@/lib/tdr";

const promises = [
  "8 espaces de travail séparés",
  "Circuit achat verrouillé côté serveur",
  "Audit, GRN/SAN et exports prêts",
];

export default function DemoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7faf6] text-ink-900">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(46,109,60,0.18),transparent_32rem),radial-gradient(circle_at_85%_0%,rgba(180,133,51,0.12),transparent_28rem)]" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/demo" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-wwf-900 text-white shadow-soft">
            <Leaf className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-semibold leading-tight">
              ProcureFlow
            </span>
            <span className="block text-xs text-ink-500">WWF-RDC procurement platform</span>
          </span>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-wwf-900 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-wwf-800"
        >
          Accéder
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="relative mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-wwf-100 bg-white/70 px-3 py-1 text-xs font-semibold text-wwf-800 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            TDR WWF-RDC · dépôt {WWF_TDR.submissionDeadline}
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-ink-950 sm:text-6xl">
            Gestion des achats institutionnels.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-600">
            Une plateforme claire pour créer, valider, acheter, recevoir,
            archiver et reporter — avec séparation réelle des rôles.
          </p>

          <div className="mt-7 space-y-3">
            {promises.map((promise) => (
              <div key={promise} className="flex items-center gap-3 text-sm font-medium text-ink-800">
                <CheckCircle2 className="h-4 w-4 text-wwf-700" />
                {promise}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-wwf-900 px-5 py-3 text-sm font-semibold text-white shadow-elevated hover:bg-wwf-800"
            >
              Accéder à la plateforme
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/proof"
              className="inline-flex items-center rounded-xl border border-ink-200 bg-white/70 px-5 py-3 text-sm font-semibold text-ink-800 shadow-sm hover:bg-white"
            >
              Conformité TDR
            </Link>
          </div>

          <p className="mt-5 text-xs text-ink-500">
            Demo password: <span className="font-mono text-ink-800">demo123</span>
          </p>
        </div>

        <div className="executive-panel rounded-[2rem] p-6">
          <div className="rounded-3xl bg-[#101811] p-5 text-white shadow-elevated">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/45">Live pilot</div>
                <div className="mt-1 text-lg font-semibold">TSC ProcureFlow</div>
              </div>
              <div className="rounded-full bg-wwf-400/15 px-3 py-1 text-xs text-wwf-100">8 workspaces</div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <Metric label="Technique" value={WWF_TECHNICAL_SCORE} />
              <Metric label="Finance" value={WWF_FINANCIAL_SCORE} />
              <Metric label="Cycle" value="7" />
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/74">
              Requester → Approver → Procurement → Supplier due diligence →
              Award → Receiver → Audit → Reporting.
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-white/70 p-4 text-xs leading-5 text-ink-600 ring-1 ring-ink-100">
            Objet : {WWF_TDR.offerObject}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl border-t border-ink-100 px-6 py-6 text-xs text-ink-500">
        © 2026 Tech Solutions Congo · TSC ProcureFlow
      </footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/45">{label}</div>
    </div>
  );
}
