import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import type { WorkspaceDefinition } from "@/lib/workspaces";

export function WorkspaceHeader({ workspace }: { workspace: WorkspaceDefinition }) {
  return (
    <div className="executive-panel relative overflow-hidden rounded-3xl px-6 py-6">
      <div className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-wwf-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-16 h-52 w-52 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-wwf-900 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white">
              Workspace {workspace.number}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-ink-600 ring-1 ring-ink-100">
              <ShieldCheck className="h-3 w-3 text-wwf-700" />
              Server enforced
            </span>
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-ink-950 sm:text-4xl">
            {workspace.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">{workspace.purpose}</p>
          <div className="brand-rule mt-5 max-w-sm" />
        </div>
        <div className="min-w-[260px] rounded-2xl border border-ink-100 bg-white/68 p-3 shadow-soft">
          <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-500">
            <LockKeyhole className="h-3.5 w-3.5 text-wwf-700" />
            Available actions
          </div>
          <div className="flex flex-wrap gap-2">
            {workspace.primaryLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-800 shadow-sm transition hover:border-wwf-300 hover:bg-wwf-50/70 hover:text-wwf-800"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActionList({ actions }: { actions: string[] }) {
  return (
    <ul className="space-y-1.5 text-xs text-ink-700">
      {actions.map((action) => (
        <li key={action} className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wwf-600" />
          <span>{action}</span>
        </li>
      ))}
    </ul>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-ink-800">{value}</div>
    </div>
  );
}
