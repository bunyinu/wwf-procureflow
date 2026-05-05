import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";
import { TIMELINE_STEPS, STATUS_LABELS } from "@/lib/workflow";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { ContractStrip, Field, WorkspaceHeader } from "../_shared";
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
      take: 8,
    }),
    prisma.department.findMany({ orderBy: { name: "asc" }, take: 4 }),
    prisma.project.findMany({ orderBy: { name: "asc" }, take: 4 }),
    prisma.budgetLine.findMany({ orderBy: { code: "asc" }, take: 4 }),
    prisma.purchaseRequisition.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const lastNumber = lastReq
    ? Number.parseInt(lastReq.requisitionNumber.split("-").pop() ?? "0", 10)
    : 0;
  const previewNumber = `PR-${new Date().getFullYear()}-${String(lastNumber + 1).padStart(4, "0")}`;

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <ContractStrip workspace={workspace} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Left · New Requisition form"
            description="Functional creation remains in /requisitions/new; requester never chooses supplier or offer analysis."
            action={
              <Link href="/requisitions/new" className="rounded-md bg-wwf-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-wwf-800">
                Open form
              </Link>
            }
          />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Auto-generated requisition number" value={`${previewNumber} (server-generated on save)`} />
            <Field label="Department" value={departments.map((d) => d.name).join(" · ") || "Configured by Admin"} />
            <Field label="Project" value={projects.map((p) => p.projectCode).join(" · ") || "Configured by Admin"} />
            <Field label="Budget line" value={budgetLines.map((b) => b.code).join(" · ") || "Configured by Admin"} />
            <Field label="Description" value="Required text field on the requisition." />
            <Field label="Quantity" value="Positive integer + unit." />
            <Field label="Budget" value="Amount + currency; line is selected from Admin-controlled budget lines." />
            <Field label="Attachments" value="Justification/proof files via the attachments component." />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Right · Status timeline" />
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
        <CardHeader title="Bottom · My requests" description="Editable only while draft or returned." />
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
                    <td className="px-5 py-3">
                      <div className="font-medium text-ink-900">{request.title}</div>
                      <div className="text-xs text-ink-500">{request.description ?? request.justification.slice(0, 72)}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-600">{request.department.name} · {request.project.projectCode}</td>
                    <td className="px-5 py-3 text-xs text-ink-700">{request.quantity} {request.unit}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-600">{request.budgetLine.code}</td>
                    <td className="px-5 py-3 text-right font-medium text-ink-900">{formatCurrency(request.amount, request.currency)}</td>
                    <td className="px-5 py-3 text-xs text-ink-600">{request.documents.length}</td>
                    <td className="px-5 py-3"><StatusBadge status={request.status} /></td>
                    <td className="px-5 py-3 text-xs text-ink-500">{formatDate(request.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
