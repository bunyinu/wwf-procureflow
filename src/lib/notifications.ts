// In-app notifications derived from the audit log and queue state.
// The production version will dispatch the same events through SMTP / SMS
// (TDR §4.2 — notifications automatiques).

import { prisma } from "@/lib/db";
import { nextRoleForStatus } from "@/lib/workflow";
import type { Role } from "@/lib/enums";

export type Notification = {
  id: string;
  kind: "queue" | "decision" | "received" | "po" | "info";
  title: string;
  body: string;
  link?: string;
  timestamp: Date;
  unread: boolean;
};

export async function getNotificationsFor(user: {
  id: string;
  role: string;
}): Promise<Notification[]> {
  const role = user.role as Role;
  const now = Date.now();

  const [queue, recentLogs, ownReqs] = await Promise.all([
    prisma.purchaseRequisition.findMany({
      where: {
        currentApproverRole: role,
        status: {
          in: ["HIERARCHICAL_REVIEW", "PROCUREMENT_REVIEW", "THRESHOLD_REVIEW"],
        },
      },
      orderBy: [{ priority: "desc" }, { submittedAt: "asc" }],
      take: 20,
    }),
    prisma.auditLog.findMany({
      where: {
        timestamp: { gte: new Date(now - 1000 * 60 * 60 * 24 * 30) },
      },
      orderBy: { timestamp: "desc" },
      take: 60,
      include: { actor: true },
    }),
    prisma.purchaseRequisition.findMany({
      where: { requesterId: user.id },
      select: { id: true, requisitionNumber: true, title: true },
    }),
  ]);

  const ownIds = new Set(ownReqs.map((r) => r.id));
  const ownLookup = Object.fromEntries(
    ownReqs.map((r) => [r.id, `${r.requisitionNumber} — ${r.title}`]),
  );

  const items: Notification[] = [];

  // 1. Queue items requiring this role's action
  for (const r of queue) {
    items.push({
      id: `queue-${r.id}`,
      kind: "queue",
      title: `Décision attendue — ${r.requisitionNumber}`,
      body: `${r.title} (${nextRoleForStatus(r.status as never) === role ? "à votre niveau" : ""})`,
      link: `/requisitions/${r.id}`,
      timestamp: r.submittedAt ?? r.updatedAt,
      unread: true,
    });
  }

  // 2. Decisions on the user's own requisitions
  for (const log of recentLogs) {
    if (log.entityType !== "PurchaseRequisition") continue;
    if (!ownIds.has(log.entityId)) continue;
    if (log.actorId === user.id) continue; // don't notify about your own actions
    if (
      ![
        "APPROVAL_APPROVED",
        "APPROVAL_REJECTED",
        "APPROVAL_RETURNED",
        "PO_CREATED",
        "RECEIPT_CREATED",
        "REQUISITION_CLOSED",
        "REQUISITION_CANCELLED",
      ].includes(log.action)
    )
      continue;
    items.push({
      id: `log-${log.id}`,
      kind:
        log.action === "PO_CREATED"
          ? "po"
          : log.action === "RECEIPT_CREATED"
            ? "received"
            : "decision",
      title: humaniseAction(log.action),
      body: `${ownLookup[log.entityId] ?? log.entityId} — par ${log.actor?.fullName ?? "Système"}${log.comment ? ` : « ${log.comment} »` : ""}`,
      link: `/requisitions/${log.entityId}`,
      timestamp: log.timestamp,
      unread: now - log.timestamp.getTime() < 1000 * 60 * 60 * 24 * 3,
    });
  }

  // Sort newest first
  items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return items.slice(0, 30);
}

function humaniseAction(action: string): string {
  switch (action) {
    case "APPROVAL_APPROVED":
      return "Réquisition approuvée";
    case "APPROVAL_REJECTED":
      return "Réquisition rejetée";
    case "APPROVAL_RETURNED":
      return "Réquisition retournée pour révision";
    case "PO_CREATED":
      return "Bon de commande émis";
    case "RECEIPT_CREATED":
      return "Réception enregistrée";
    case "REQUISITION_CLOSED":
      return "Réquisition clôturée";
    case "REQUISITION_CANCELLED":
      return "Réquisition annulée";
    default:
      return action;
  }
}
