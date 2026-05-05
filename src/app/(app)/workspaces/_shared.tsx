import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/Card";
import type { WorkspaceDefinition } from "@/lib/workspaces";

export function WorkspaceHeader({ workspace }: { workspace: WorkspaceDefinition }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-wwf-700">
          Workspace {workspace.number} · separate route
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
          {workspace.title}
        </h1>
        <p className="text-sm text-ink-500">Purpose: {workspace.purpose}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {workspace.primaryLinks.slice(0, 2).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-sm hover:border-wwf-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ContractStrip({ workspace }: { workspace: WorkspaceDefinition }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader title="Layout contract" />
        <CardBody>
          <ul className="space-y-1.5 text-xs text-ink-700">
            {workspace.layout.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-wwf-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Must show" />
        <CardBody>
          <div className="flex flex-wrap gap-1.5">
            {workspace.mustShow.map((item) => (
              <span
                key={item}
                className="rounded-full bg-wwf-50 px-2 py-0.5 text-[11px] font-medium text-wwf-800 ring-1 ring-wwf-100"
              >
                {item}
              </span>
            ))}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="No access" />
        <CardBody>
          <ul className="space-y-1.5 text-xs text-ink-700">
            {workspace.noAccess.map((item) => (
              <li key={item} className="flex gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
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
