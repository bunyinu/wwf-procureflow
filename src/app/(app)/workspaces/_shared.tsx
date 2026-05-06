import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import type { WorkspaceDefinition } from "@/lib/workspaces";

export function WorkspaceHeader({ workspace }: { workspace: WorkspaceDefinition }) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-[#dbe3ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="bg-[#062c55] px-4 py-1.5 text-center text-[13px] font-bold uppercase tracking-wide text-white">
        Workspace {workspace.number}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-5 p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-[4px] bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
              {workspace.shortTitle}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[4px] bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
              <ShieldCheck className="h-3 w-3 text-blue-700" />
              Server enforced
            </span>
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-bold text-[#0f2945] sm:text-3xl">
            {workspace.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{workspace.purpose}</p>
        </div>
        <div className="min-w-[260px] rounded-[4px] border border-[#dbe3ef] bg-white p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <LockKeyhole className="h-3.5 w-3.5 text-blue-700" />
            Available actions
          </div>
          <div className="flex flex-wrap gap-2">
            {workspace.primaryLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-[4px] border border-[#dbe3ef] bg-white px-3 py-2 text-xs font-semibold text-[#0f2945] hover:border-blue-300 hover:text-blue-700"
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
    <ul className="space-y-1.5 text-xs text-slate-700">
      {actions.map((action) => (
        <li key={action} className="flex gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
          <span>{action}</span>
        </li>
      ))}
    </ul>
  );
}

export function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-[#0f2945]">{value}</div>
    </div>
  );
}
