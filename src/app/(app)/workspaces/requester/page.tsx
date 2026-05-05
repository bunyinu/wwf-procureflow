import Link from "next/link";
import { prisma } from "@/lib/db";
import { Priority, Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";
import { TIMELINE_STEPS, STATUS_LABELS } from "@/lib/workflow";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { AttachmentsZone } from "@/components/AttachmentsZone";
import { WorkspaceHeader } from "../_shared";
import { createRequisitionAction } from "../../requisitions/actions";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RequesterWorkspacePage() {
  const user = await requireWorkspaceRole(Role.REQUESTER);
  const workspace = WORKSPACE_BY_ROLE.REQUESTER;
  const [requests, departments, projects, budgetLines, lastReq] = await Promise.all([
    prisma.purchaseRequisition.findMany({
      where: { requesterId: user.id },
      include: { department: true, project: true, budgetLine: true, documents: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ where: { active: true }, orderBy: { projectCode: "asc" } }),
    prisma.budgetLine.findMany({ where: { active: true }, include: { project: true }, orderBy: { code: "asc" } }),
    prisma.purchaseRequisition.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const lastNumber = lastReq
    ? Number.parseInt(lastReq.requisitionNumber.split("-").pop() ?? "0", 10)
    : 0;
  const previewNumber = `PR-${new Date().getFullYear()}-${String(lastNumber + 1).padStart(4, "0")}`;

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="New Requisition" description="Requester creates drafts or submits. Supplier and offer fields are not available here." />
          <CardBody>
            <form action={createRequisitionAction} className="space-y-4">
              <div className="rounded-md bg-ink-50 px-3 py-2 text-xs text-ink-600 ring-1 ring-ink-100">
                Requisition number: <span className="font-mono text-ink-900">{previewNumber}</span> after save
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Select label="Department" name="departmentId" items={departments.map((d) => ({ value: d.id, label: d.name }))} />
                <Select label="Project" name="projectId" items={projects.map((p) => ({ value: p.id, label: p.projectCode }))} />
                <Select label="Budget line" name="budgetLineId" items={budgetLines.map((b) => ({ value: b.id, label: `${b.code} · ${b.project.projectCode}` }))} />
                <div>
                  <label className="text-xs font-medium text-ink-700">Quantity</label>
                  <div className="mt-1 grid grid-cols-[1fr_100px] gap-2">
                    <input name="quantity" type="number" min="1" required defaultValue="1" className="rounded-md border border-ink-200 px-3 py-2 text-sm" />
                    <input name="unit" defaultValue="unité" className="rounded-md border border-ink-200 px-3 py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-700">Budget</label>
                  <div className="mt-1 grid grid-cols-[1fr_90px] gap-2">
                    <input name="amount" type="number" min="1" step="0.01" required className="rounded-md border border-ink-200 px-3 py-2 text-sm" />
                    <input name="currency" defaultValue="USD" className="rounded-md border border-ink-200 px-3 py-2 text-sm" />
                  </div>
                </div>
                <Select
                  label="Priority"
                  name="priority"
                  items={[
                    { value: Priority.LOW, label: "Low" },
                    { value: Priority.NORMAL, label: "Normal" },
                    { value: Priority.HIGH, label: "High" },
                    { value: Priority.URGENT, label: "Urgent" },
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-700">Description</label>
                <textarea name="description" rows={3} required className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-700">Justification</label>
                <textarea name="justification" rows={3} required className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm" />
              </div>

              <AttachmentsZone hint="Upload justification/proof after the request is saved." />

              <div className="flex flex-wrap gap-2">
                <button name="intent" value="draft" type="submit" className="rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
                  Save draft
                </button>
                <button name="intent" value="submit" type="submit" className="rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white hover:bg-wwf-800">
                  Submit
                </button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Status timeline" />
          <CardBody>
            <ol className="space-y-2 text-xs">
              {TIMELINE_STEPS.map((status, index) => (
                <li key={status} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wwf-50 text-[10px] font-semibold text-wwf-700 ring-1 ring-wwf-100">
                    {index + 1}
                  </span>
                  <span className="text-ink-700">{STATUS_LABELS[status]}</span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="My requests" description="Editable only while draft or returned." />
        <CardBody className="px-0 py-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-2.5 font-medium">Number</th>
                  <th className="px-5 py-2.5 font-medium">Description</th>
                  <th className="px-5 py-2.5 font-medium">Department / Project</th>
                  <th className="px-5 py-2.5 font-medium">Quantity</th>
                  <th className="px-5 py-2.5 font-medium">Budget line</th>
                  <th className="px-5 py-2.5 font-medium text-right">Budget</th>
                  <th className="px-5 py-2.5 font-medium">Attachments</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-ink-50 hover:bg-ink-50/50">
                    <td className="px-5 py-3 font-mono text-xs text-ink-500">
                      <Link href={`/requisitions/${request.id}`} className="hover:text-wwf-700">{request.requisitionNumber}</Link>
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-700">{request.description}</td>
                    <td className="px-5 py-3 text-xs text-ink-600">{request.department.name} · {request.project.projectCode}</td>
                    <td className="px-5 py-3 text-xs text-ink-700">{request.quantity} {request.unit}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-600">{request.budgetLine.code}</td>
                    <td className="px-5 py-3 text-right font-medium text-ink-900">{formatCurrency(request.amount, request.currency)}</td>
                    <td className="px-5 py-3 text-xs text-ink-600">{request.documents.length}</td>
                    <td className="px-5 py-3"><StatusBadge status={request.status} /></td>
                    <td className="px-5 py-3 text-xs text-ink-500">{formatDate(request.updatedAt)}</td>
                  </tr>
                ))}
                {requests.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-6 text-sm text-ink-500">No requests yet.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Select({ label, name, items }: { label: string; name: string; items: Array<{ value: string; label: string }> }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-700">{label}</label>
      <select name={name} required className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm">
        {items.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </div>
  );
}
