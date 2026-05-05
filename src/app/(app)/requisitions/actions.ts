"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { assertCan } from "@/lib/permissions";
import {
  ApprovalDecision,
  POStatus,
  ProcurementType,
  Priority,
  Role,
  RequisitionStatus,
  ReceiptType,
} from "@/lib/enums";
import { isValidTransition, nextRoleForStatus } from "@/lib/workflow";

async function nextRequisitionNumber(): Promise<string> {
  const last = await prisma.purchaseRequisition.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const lastNum = last
    ? parseInt(last.requisitionNumber.split("-").pop() || "0", 10)
    : 0;
  const next = String(lastNum + 1).padStart(4, "0");
  return `PR-${new Date().getFullYear()}-${next}`;
}

const requisitionSchema = z.object({
  title: z.string().min(3),
  quantity: z.coerce.number().int().positive(),
  unit: z.string().min(1).default("unité"),
  departmentId: z.string().min(1),
  projectId: z.string().min(1),
  budgetLineId: z.string().min(1),
  amount: z.coerce.number().positive(),
  currency: z.string().min(3).max(4).default("USD"),
  procurementType: z.enum([
    ProcurementType.DIRECT_PURCHASE,
    ProcurementType.QUOTATION,
    ProcurementType.TENDER,
    ProcurementType.SOLE_SOURCE,
    ProcurementType.PREQUALIFIED_SUPPLIER,
  ]),
  priority: z.enum([
    Priority.LOW,
    Priority.NORMAL,
    Priority.HIGH,
    Priority.URGENT,
  ]),
  expectedDeliveryDate: z.string().optional(),
  justification: z.string().min(5),
  supplierPreference: z.string().optional(),
});

export async function createRequisitionAction(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "create", "requisition", {}, "/requisitions?denied=1");
  const submit = formData.get("intent") === "submit";

  const result = requisitionSchema.safeParse({
    title: formData.get("title"),
    quantity: formData.get("quantity") || 1,
    unit: formData.get("unit") || "unité",
    departmentId: formData.get("departmentId"),
    projectId: formData.get("projectId"),
    budgetLineId: formData.get("budgetLineId"),
    amount: formData.get("amount"),
    currency: formData.get("currency") || "USD",
    procurementType: formData.get("procurementType"),
    priority: formData.get("priority"),
    expectedDeliveryDate: formData.get("expectedDeliveryDate") as string,
    justification: formData.get("justification"),
    supplierPreference: formData.get("supplierPreference") as string,
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/requisitions/new?error=${msg}`);
  }
  const parsed = result.data;

  const reqNum = await nextRequisitionNumber();
  const justification =
    parsed.supplierPreference && parsed.supplierPreference.length > 0
      ? `${parsed.justification}\n\nFournisseur préféré : ${parsed.supplierPreference}`
      : parsed.justification;

  const status = submit
    ? RequisitionStatus.MANAGER_REVIEW
    : RequisitionStatus.DRAFT;
  const created = await prisma.purchaseRequisition.create({
    data: {
      requisitionNumber: reqNum,
      title: parsed.title,
      quantity: parsed.quantity,
      unit: parsed.unit,
      requesterId: user.id,
      departmentId: parsed.departmentId,
      projectId: parsed.projectId,
      budgetLineId: parsed.budgetLineId,
      amount: parsed.amount,
      currency: parsed.currency,
      procurementType: parsed.procurementType,
      priority: parsed.priority,
      justification,
      status,
      currentApproverRole: submit ? Role.MANAGER : null,
      submittedAt: submit ? new Date() : null,
      expectedDeliveryDate: parsed.expectedDeliveryDate
        ? new Date(parsed.expectedDeliveryDate)
        : null,
    },
  });

  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: submit ? "REQUISITION_SUBMITTED" : "REQUISITION_CREATED",
    entityType: "PurchaseRequisition",
    entityId: created.id,
    newValue: created.requisitionNumber,
    comment: submit
      ? `Soumission directe pour validation managériale`
      : `Création en brouillon`,
  });

  revalidatePath("/requisitions");
  revalidatePath("/dashboard");
  redirect(`/requisitions/${created.id}`);
}

export async function submitRequisitionAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const req = await prisma.purchaseRequisition.findUnique({ where: { id } });
  if (!req) redirect("/requisitions");
  assertCan(
    user,
    "submit",
    "requisition",
    { requisition: { requesterId: req!.requesterId, status: req!.status } },
    `/requisitions/${id}?denied=1`,
  );
  if (
    !isValidTransition(
      req!.status as RequisitionStatus,
      RequisitionStatus.SUBMITTED,
    )
  ) {
    redirect(`/requisitions/${id}?invalid=1`);
  }
  await prisma.purchaseRequisition.update({
    where: { id },
    data: {
      status: RequisitionStatus.MANAGER_REVIEW,
      submittedAt: new Date(),
      currentApproverRole: Role.MANAGER,
    },
  });
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: "REQUISITION_SUBMITTED",
    entityType: "PurchaseRequisition",
    entityId: id,
    oldValue: req!.status,
    newValue: RequisitionStatus.MANAGER_REVIEW,
  });
  revalidatePath(`/requisitions/${id}`);
  revalidatePath("/requisitions");
  revalidatePath("/approvals");
  redirect(`/requisitions/${id}`);
}

const decisionSchema = z.object({
  id: z.string().min(1),
  decision: z.enum([
    ApprovalDecision.APPROVED,
    ApprovalDecision.REJECTED,
    ApprovalDecision.RETURNED,
  ]),
  comment: z.string().optional(),
  budgetException: z.string().optional(),
});

export async function decideAction(formData: FormData) {
  const user = await requireUser();
  const result = decisionSchema.safeParse({
    id: formData.get("id"),
    decision: formData.get("decision"),
    comment: formData.get("comment") || "",
    budgetException: formData.get("budgetException") as string,
  });
  if (!result.success) {
    const id = String(formData.get("id") ?? "");
    redirect(`/requisitions/${id}?error=invalid`);
  }
  const parsed = result.data;

  if (
    parsed.decision !== ApprovalDecision.APPROVED &&
    (!parsed.comment || parsed.comment.trim().length < 3)
  ) {
    redirect(`/requisitions/${parsed.id}?error=comment_required`);
  }

  const req = await prisma.purchaseRequisition.findUnique({
    where: { id: parsed.id },
  });
  if (!req) redirect("/requisitions");

  assertCan(
    user,
    "decide",
    "requisition",
    { requisition: { requesterId: req!.requesterId, status: req!.status } },
    `/requisitions/${parsed.id}?denied=1`,
  );

  const role = user.role as Role;
  const fromStatus = req!.status as RequisitionStatus;

  let newStatus: RequisitionStatus | null = null;
  if (parsed.decision === ApprovalDecision.APPROVED) {
    if (fromStatus === RequisitionStatus.MANAGER_REVIEW) {
      newStatus = RequisitionStatus.PROCUREMENT_REVIEW;
    } else if (fromStatus === RequisitionStatus.PROCUREMENT_REVIEW) {
      newStatus = RequisitionStatus.FINANCE_REVIEW;
    } else if (fromStatus === RequisitionStatus.FINANCE_REVIEW) {
      newStatus = RequisitionStatus.PO_CREATED;
    }
  } else if (parsed.decision === ApprovalDecision.REJECTED) {
    newStatus = RequisitionStatus.REJECTED;
  } else if (parsed.decision === ApprovalDecision.RETURNED) {
    if (
      fromStatus === RequisitionStatus.MANAGER_REVIEW ||
      fromStatus === RequisitionStatus.PROCUREMENT_REVIEW ||
      fromStatus === RequisitionStatus.FINANCE_REVIEW
    ) {
      newStatus = RequisitionStatus.RETURNED_FOR_REVISION;
    } else {
      redirect(`/requisitions/${parsed.id}?invalid=1`);
    }
  }

  if (!newStatus || !isValidTransition(fromStatus, newStatus)) {
    redirect(`/requisitions/${parsed.id}?invalid=1`);
  }

  const nextRole = nextRoleForStatus(newStatus);
  await prisma.$transaction([
    prisma.approval.create({
      data: {
        requisitionId: parsed.id,
        approverId: user.id,
        approverRole: role,
        decision: parsed.decision,
        comment: parsed.comment ?? null,
        oldStatus: fromStatus,
        newStatus,
      },
    }),
    prisma.purchaseRequisition.update({
      where: { id: parsed.id },
      data: {
        status: newStatus,
        currentApproverRole: nextRole,
      },
    }),
  ]);

  const isBudgetException =
    parsed.budgetException === "on" &&
    fromStatus === RequisitionStatus.FINANCE_REVIEW &&
    parsed.decision === ApprovalDecision.RETURNED;
  await logAudit({
    actorId: user.id,
    actorRole: role,
    action:
      parsed.decision === ApprovalDecision.APPROVED
        ? "APPROVAL_APPROVED"
        : parsed.decision === ApprovalDecision.REJECTED
          ? "APPROVAL_REJECTED"
          : isBudgetException
            ? "BUDGET_EXCEPTION_FLAGGED"
            : "APPROVAL_RETURNED",
    entityType: "PurchaseRequisition",
    entityId: parsed.id,
    oldValue: fromStatus,
    newValue: newStatus,
    comment: isBudgetException
      ? `[Exception budgétaire] ${parsed.comment ?? ""}`
      : parsed.comment,
  });

  revalidatePath(`/requisitions/${parsed.id}`);
  revalidatePath("/requisitions");
  revalidatePath("/approvals");
  revalidatePath("/dashboard");
  redirect(`/requisitions/${parsed.id}`);
}

export async function cancelRequisitionAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const reason = String(formData.get("comment") || "");
  const req = await prisma.purchaseRequisition.findUnique({ where: { id } });
  if (!req) redirect("/requisitions");
  assertCan(
    user,
    "cancel",
    "requisition",
    { requisition: { requesterId: req!.requesterId, status: req!.status } },
    `/requisitions/${id}?denied=1`,
  );
  if (reason.trim().length < 3) {
    redirect(`/requisitions/${id}?error=comment_required`);
  }
  if (
    !isValidTransition(
      req!.status as RequisitionStatus,
      RequisitionStatus.CANCELLED,
    )
  ) {
    redirect(`/requisitions/${id}?invalid=1`);
  }
  await prisma.purchaseRequisition.update({
    where: { id },
    data: {
      status: RequisitionStatus.CANCELLED,
      currentApproverRole: null,
    },
  });
  await logAudit({
    actorId: user.id,
    actorRole: Role.ADMIN,
    action: "REQUISITION_CANCELLED",
    entityType: "PurchaseRequisition",
    entityId: id,
    oldValue: req!.status,
    newValue: RequisitionStatus.CANCELLED,
    comment: reason,
  });
  revalidatePath(`/requisitions/${id}`);
  redirect(`/requisitions/${id}`);
}

const poSchema = z.object({
  requisitionId: z.string().min(1),
  supplierId: z.string().min(1),
});

export async function createPOAction(formData: FormData) {
  const user = await requireUser();
  const result = poSchema.safeParse({
    requisitionId: formData.get("requisitionId"),
    supplierId: formData.get("supplierId"),
  });
  if (!result.success) {
    const id = String(formData.get("requisitionId") ?? "");
    redirect(`/requisitions/${id}?error=invalid`);
  }
  const parsed = result.data;
  const req = await prisma.purchaseRequisition.findUnique({
    where: { id: parsed.requisitionId },
  });
  if (!req) redirect("/requisitions");
  assertCan(
    user,
    "issuePO",
    "purchaseOrder",
    { requisition: { requesterId: req!.requesterId, status: req!.status } },
    `/requisitions/${parsed.requisitionId}?denied=1`,
  );
  if (req.status !== RequisitionStatus.PO_CREATED) {
    redirect(`/requisitions/${parsed.requisitionId}?invalid=1`);
  }
  const last = await prisma.purchaseOrder.findFirst({
    orderBy: { createdAt: "desc" },
  });
  const lastNum = last ? parseInt(last.poNumber.split("-").pop() || "0", 10) : 0;
  const poNumber = `PO-${new Date().getFullYear()}-${String(lastNum + 1).padStart(4, "0")}`;
  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      requisitionId: parsed.requisitionId,
      supplierId: parsed.supplierId,
      amount: req!.amount,
      currency: req!.currency,
      status: POStatus.ISSUED,
      issuedAt: new Date(),
    },
  });
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: "PO_CREATED",
    entityType: "PurchaseOrder",
    entityId: po.id,
    newValue: po.poNumber,
  });
  revalidatePath(`/requisitions/${parsed.requisitionId}`);
  revalidatePath("/purchase-orders");
  redirect(`/requisitions/${parsed.requisitionId}`);
}

const receiptSchema = z.object({
  requisitionId: z.string().min(1),
  purchaseOrderId: z.string().min(1),
  receiptType: z.enum([ReceiptType.GRN, ReceiptType.SAN]),
  notes: z.string().optional(),
  discrepancyFlag: z.string().optional(),
  discrepancyNotes: z.string().optional(),
});

export async function createReceiptAction(formData: FormData) {
  const user = await requireUser();
  const result = receiptSchema.safeParse({
    requisitionId: formData.get("requisitionId"),
    purchaseOrderId: formData.get("purchaseOrderId"),
    receiptType: formData.get("receiptType"),
    notes: formData.get("notes"),
    discrepancyFlag: formData.get("discrepancyFlag") as string,
    discrepancyNotes: formData.get("discrepancyNotes") as string,
  });
  if (!result.success) {
    const id = String(formData.get("requisitionId") ?? "");
    redirect(`/requisitions/${id}?error=invalid`);
  }
  const parsed = result.data;
  const req = await prisma.purchaseRequisition.findUnique({
    where: { id: parsed.requisitionId },
  });
  if (!req) redirect("/requisitions");
  assertCan(
    user,
    "create",
    "goodsReceipt",
    { requisition: { requesterId: req!.requesterId, status: req!.status } },
    `/requisitions/${parsed.requisitionId}?denied=1`,
  );
  if (
    !isValidTransition(
      req!.status as RequisitionStatus,
      RequisitionStatus.RECEIVED,
    )
  ) {
    redirect(`/requisitions/${parsed.requisitionId}?invalid=1`);
  }
  await prisma.$transaction([
    prisma.goodsReceipt.create({
      data: {
        requisitionId: parsed.requisitionId,
        purchaseOrderId: parsed.purchaseOrderId,
        receivedById: user.id,
        receiptType: parsed.receiptType,
        notes: parsed.notes ?? null,
        discrepancyFlag: parsed.discrepancyFlag === "on",
        discrepancyNotes: parsed.discrepancyNotes ?? null,
      },
    }),
    prisma.purchaseRequisition.update({
      where: { id: parsed.requisitionId },
      data: { status: RequisitionStatus.RECEIVED, currentApproverRole: null },
    }),
    prisma.purchaseOrder.update({
      where: { id: parsed.purchaseOrderId },
      data: { status: POStatus.RECEIVED },
    }),
  ]);
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: "RECEIPT_CREATED",
    entityType: "GoodsReceipt",
    entityId: parsed.purchaseOrderId,
    newValue: parsed.receiptType,
    comment: parsed.notes ?? undefined,
  });
  revalidatePath(`/requisitions/${parsed.requisitionId}`);
  revalidatePath("/receipts");
  revalidatePath("/purchase-orders");
  redirect(`/requisitions/${parsed.requisitionId}`);
}

export async function closeRequisitionAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const req = await prisma.purchaseRequisition.findUnique({ where: { id } });
  if (!req) redirect("/requisitions");
  assertCan(
    user,
    "close",
    "requisition",
    { requisition: { requesterId: req!.requesterId, status: req!.status } },
    `/requisitions/${id}?denied=1`,
  );
  if (
    !isValidTransition(
      req!.status as RequisitionStatus,
      RequisitionStatus.CLOSED,
    )
  ) {
    redirect(`/requisitions/${id}?invalid=1`);
  }
  await prisma.purchaseRequisition.update({
    where: { id },
    data: { status: RequisitionStatus.CLOSED, currentApproverRole: null },
  });
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: "REQUISITION_CLOSED",
    entityType: "PurchaseRequisition",
    entityId: id,
    oldValue: req!.status,
    newValue: RequisitionStatus.CLOSED,
  });
  revalidatePath(`/requisitions/${id}`);
  redirect(`/requisitions/${id}`);
}
