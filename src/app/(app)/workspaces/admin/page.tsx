import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";
import { getPermissionMatrix, ROLE_DISPLAY } from "@/lib/permissions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { WorkspaceHeader } from "../_shared";

export const dynamic = "force-dynamic";

export default async function AdminWorkspacePage() {
  await requireWorkspaceRole(Role.ADMIN);
  const workspace = WORKSPACE_BY_ROLE.ADMIN;
  const [users, departments, projects, budgetLines, settings] = await Promise.all([
    prisma.user.findMany({ orderBy: { fullName: "asc" }, take: 10 }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { projectCode: "asc" } }),
    prisma.budgetLine.findMany({ orderBy: { code: "asc" }, take: 10 }),
    prisma.setting.findMany(),
  ]);
  const matrix = getPermissionMatrix();

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader title="Left · Admin menu" />
          <CardBody className="space-y-2 text-sm">
            {workspace.primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-md border border-ink-100 px-3 py-2 font-medium text-ink-800 hover:border-wwf-200 hover:bg-wwf-50/30">
                {link.label}
              </Link>
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Center · Selected config table" description="Users, roles, departments, projects, budget lines." />
          <CardBody className="space-y-5">
            <section>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Users + roles</div>
              <div className="space-y-1.5">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-md border border-ink-100 px-3 py-2 text-xs">
                    <span className="font-medium text-ink-900">{user.fullName}</span>
                    <Badge className="bg-ink-100 text-ink-700">{ROLE_DISPLAY[user.role as Role]}</Badge>
                  </div>
                ))}
              </div>
            </section>
            <section className="grid gap-3 sm:grid-cols-3">
              <ConfigCount label="Departments" value={departments.length} href="/admin/departments" />
              <ConfigCount label="Projects" value={projects.length} href="/admin/projects" />
              <ConfigCount label="Budget lines" value={budgetLines.length} href="/admin/budget-lines" />
            </section>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Right · Permission/rule editor" description="No audit deletion or completed-record tampering." />
          <CardBody className="space-y-3 text-xs">
            <div>
              <div className="font-medium text-ink-900">Approval thresholds</div>
              <ul className="mt-1 space-y-1 text-ink-600">
                {settings.filter((setting) => setting.id.startsWith("threshold.")).map((setting) => (
                  <li key={setting.id} className="flex justify-between gap-2"><span>{setting.id}</span><span>{setting.value}</span></li>
                ))}
              </ul>
            </div>
            <div className="border-t border-ink-100 pt-3">
              <div className="font-medium text-ink-900">Workflow rules</div>
              <p className="mt-1 text-ink-600">Configured in /admin/settings; all changes are audited.</p>
              <Link href="/admin/settings" className="mt-2 inline-flex rounded-md bg-wwf-700 px-3 py-1.5 font-medium text-white">Edit rules</Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Access rights" description="Server-enforced permission matrix snapshot." />
        <CardBody className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {matrix.slice(0, 12).map((row) => (
            <div key={`${row.entity}-${row.action}`} className="rounded-md border border-ink-100 px-3 py-2 text-xs">
              <div className="font-medium text-ink-900">{row.entityLabel} · {row.actionLabel}</div>
              <div className="mt-1 text-ink-500">{row.cells.filter((cell) => cell.verdict.kind !== "no").map((cell) => ROLE_DISPLAY[cell.role]).join(" · ") || "No role"}</div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function ConfigCount({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-3 text-center hover:border-wwf-200 hover:bg-wwf-50/30">
      <div className="text-2xl font-semibold text-ink-900">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </Link>
  );
}
