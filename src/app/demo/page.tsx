import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck } from "lucide-react";

const workspaces = [
  "Requester",
  "Approver",
  "Procurement",
  "Supplier Manager",
  "Receiver",
  "Archive & Audit",
  "Reporting",
  "Admin",
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white text-ink-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/demo" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-wwf-700 text-white">
            <Leaf className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-semibold leading-tight">
              TSC ProcureFlow
            </span>
            <span className="block text-xs text-ink-500">WWF-RDC Procurement</span>
          </span>
        </Link>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white hover:bg-wwf-800"
        >
          Sign in
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-wwf-100 bg-wwf-50 px-3 py-1 text-xs font-medium text-wwf-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            8 separate workspaces · server-side access control
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
            Simple procurement workflow for WWF-RDC.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-600">
            Create requisitions, approve by threshold, classify purchases, manage
            suppliers, receive goods or services, archive every action, and report
            on performance.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-wwf-700 px-5 py-3 text-sm font-medium text-white hover:bg-wwf-800"
            >
              Open platform
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/proof"
              className="inline-flex items-center rounded-md border border-ink-200 px-5 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              View TDR match
            </Link>
          </div>

          <p className="mt-5 text-xs text-ink-500">
            Demo password: <span className="font-mono text-ink-800">demo123</span>
          </p>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-ink-50/50 p-6">
          <h2 className="text-sm font-semibold text-ink-900">Workspaces</h2>
          <div className="mt-4 grid gap-2">
            {workspaces.map((workspace, index) => (
              <div
                key={workspace}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-ink-100"
              >
                <span className="font-medium text-ink-800">{workspace}</span>
                <span className="font-mono text-xs text-ink-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl border-t border-ink-100 px-6 py-6 text-xs text-ink-500">
        © 2026 Tech Solutions Congo · TSC ProcureFlow
      </footer>
    </main>
  );
}
