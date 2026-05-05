import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";
import { approvalTier, ROLE_LABELS } from "@/lib/workflow";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Badge } from "@/components/Badge";
import { ContractStrip, Field, WorkspaceHeader } from "../_shared";
import { formatCurrency, formatDateTime, relativeFromNow } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ApproverWorkspacePage() {
  const user = await requireWorkspaceRole(Role.APPROVER);
  const workspace = WORKSPACE_BY_ROLE.APPROVER;
  const [queue, history] = await Promise.all([
    prisma.purchaseRequisition.findMany({
      where: { status: { in: ["HIERARCHICAL_REVIEW", "THRESHOLD_REVIEW", "SUBMITTED"] } },
      include: {
        requester: true,
        department: true,
        project: true,
        budgetLine: true,
        documents: true,
        approvals: { include: { approver: true }, orderBy: { decidedAt: "desc" } },
      },
      orderBy: [{ priority: "desc" }, { submittedAt: "asc" }],
      take: 8,
    }),
    prisma.approval.findMany({
      where: { approverRole: Role.APPROVER },
      include: { approver: true, requisition: { include: { requester: true } } },
      orderBy: { decidedAt: "desc" },
      take: 8,
    }),
  ]);
  const selected = queue[0];
  const tier = selected ? approvalTier(selected.amount) : null;

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <ContractStrip workspace={workspace} />

      <Card>
        <CardHeader title="Top · Approval queue cards" description={`${queue.length} requests waiting for hierarchical threshold validation.`} />
        <CardBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {queue.length === 0 ? <p className="text-sm text-ink-500">No approval items currently assigned.</p> : null}
          {queue.map((request) => (
            <Link key={request.id} href={`/requisitions/${request.id}`} className="rounded-lg border border-ink-100 bg-white p-3 shadow-sm hover:border-wwf-200 hover:bg-wwf-50/30">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-ink-500">{request.requisitionNumber}</span>
                <PriorityBadge priority={request.priority} />
              </div>
              <div className="mt-2 line-clamp-2 text-sm font-medium text-ink-900">{request.title}</div>
              <div className="mt-1 text-xs text-ink-500">{request.requester.fullName} · {formatCurrency(request.amount, request.currency)}</div>
              <div className="mt-2"><StatusBadge status={request.status} /></div>
            </Link>
          ))}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Center · Selected request details" description={selected ? selected.requisitionNumber : "No selected request"} />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            {selected ? (
              <>
                <Field label="Requester" value={selected.requester.fullName} />
                <Field label="Department / project" value={`${selected.department.name} · ${selected.project.projectCode}`} />
                <Field label="Budget + line" value={`${formatCurrency(selected.amount, selected.currency)} · ${selected.budgetLine.code}`} />
                <Field label="Attachments" value={`${selected.documents.length} attached file(s)`} />
                <Field label="Threshold level" value={`Tier ${tier?.tier}${tier?.needsDirectorFlag ? " · Director flag" : ""}`} />
                <Field label="Previous decisions" value={`${selected.approvals.length} recorded decision(s)`} />
              </>
            ) : (
              <p className="text-sm text-ink-500">Queue is empty.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Right · Decision panel" description="No request editing, supplier management, or GRN/SAN controls." />
          <CardBody className="space-y-3">
            <ul className="space-y-1.5 text-xs text-ink-700">
              <li>Approve by threshold</li>
              <li>Reject with comment</li>
              <li>Request correction with comment</li>
              <li>Escalate when threshold requires</li>
            </ul>
            {selected ? (
              <Link href={`/requisitions/${selected.id}`} className="inline-flex rounded-md bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700">
                Open decision form
              </Link>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Bottom · Decision history" />
        <CardBody className="space-y-2">
          {history.map((decision) => (
            <div key={decision.id} className="flex items-start justify-between gap-3 rounded-md border border-ink-100 px-3 py-2 text-sm">
              <div>
                <div className="font-medium text-ink-900">{decision.requisition.requisitionNumber} · {decision.decision}</div>
                <div className="text-xs text-ink-500">{decision.requisition.requester.fullName} · {decision.oldStatus} → {decision.newStatus} · {decision.comment ?? "No comment"}</div>
              </div>
              <div className="text-right text-[11px] text-ink-500">
                <div>{ROLE_LABELS[decision.approverRole as keyof typeof ROLE_LABELS]}</div>
                <div>{formatDateTime(decision.decidedAt)}</div>
              </div>
            </div>
          ))}
          {history.length === 0 ? <p className="text-sm text-ink-500">No decisions yet.</p> : null}
        </CardBody>
      </Card>
    </div>
  );
}
