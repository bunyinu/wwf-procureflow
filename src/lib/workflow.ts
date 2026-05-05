import { Role, RequisitionStatus } from "@/lib/enums";

export const STATUS_LABELS: Record<RequisitionStatus, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumise",
  HIERARCHICAL_REVIEW: "Revue hiérarchique",
  PROCUREMENT_REVIEW: "Revue Achats",
  THRESHOLD_REVIEW: "Revue seuil renforcé",
  PO_CREATED: "BC émis",
  RECEIVED: "Reçue",
  CLOSED: "Clôturée",
  REJECTED: "Rejetée",
  RETURNED_FOR_REVISION: "Retournée",
  CANCELLED: "Annulée",
};

export const STATUS_BADGE: Record<RequisitionStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  SUBMITTED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  HIERARCHICAL_REVIEW: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  PROCUREMENT_REVIEW: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  THRESHOLD_REVIEW: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  PO_CREATED: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  RECEIVED: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  CLOSED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-1 ring-red-200",
  RETURNED_FOR_REVISION: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200",
  CANCELLED: "bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300",
};

export const ROLE_LABELS: Record<Role, string> = {
  REQUESTER: "Demandeur",
  APPROVER: "Approbateur Hiérarchique",
  PROCUREMENT: "Officier Achats",
  SUPPLIER_MANAGER: "Gestionnaire Fournisseurs",
  RECEIVER: "Réceptionnaire",
  AUDITOR: "Officier Documents & Audit",
  REPORTING: "Responsable Reporting",
  ADMIN: "Administrateur",
};

export const TRANSITIONS: Partial<Record<RequisitionStatus, RequisitionStatus[]>> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["HIERARCHICAL_REVIEW"],
  HIERARCHICAL_REVIEW: ["PROCUREMENT_REVIEW", "REJECTED", "RETURNED_FOR_REVISION"],
  RETURNED_FOR_REVISION: ["DRAFT", "SUBMITTED"],
  // Any reviewer (hierarchical approver or procurement) can return for revision.
  PROCUREMENT_REVIEW: ["THRESHOLD_REVIEW", "PO_CREATED", "REJECTED", "RETURNED_FOR_REVISION"],
  THRESHOLD_REVIEW: ["PO_CREATED", "REJECTED", "RETURNED_FOR_REVISION"],
  PO_CREATED: ["RECEIVED"],
  RECEIVED: ["CLOSED"],
};

export function isValidTransition(
  from: RequisitionStatus,
  to: RequisitionStatus,
): boolean {
  if (to === "CANCELLED") {
    return !["CLOSED", "RECEIVED", "REJECTED", "CANCELLED"].includes(from);
  }
  return (TRANSITIONS[from] ?? []).includes(to);
}

export const FINAL_STATUSES: RequisitionStatus[] = [
  "CLOSED",
  "REJECTED",
  "CANCELLED",
];

export function approvalTier(amountUSD: number): {
  tier: 1 | 2 | 3;
  needsHierarchicalApprover: boolean;
  needsProcurement: boolean;
  needsEnhancedThresholdApproval: boolean;
  needsDirectorFlag: boolean;
} {
  if (amountUSD < 1000) {
    return {
      tier: 1,
      needsHierarchicalApprover: true,
      needsProcurement: true,
      needsEnhancedThresholdApproval: false,
      needsDirectorFlag: false,
    };
  }
  if (amountUSD <= 10000) {
    return {
      tier: 2,
      needsHierarchicalApprover: true,
      needsProcurement: true,
      needsEnhancedThresholdApproval: true,
      needsDirectorFlag: false,
    };
  }
  return {
    tier: 3,
    needsHierarchicalApprover: true,
    needsProcurement: true,
    needsEnhancedThresholdApproval: true,
    needsDirectorFlag: true,
  };
}

export function nextRoleForStatus(status: RequisitionStatus): Role | null {
  switch (status) {
    case "SUBMITTED":
    case "HIERARCHICAL_REVIEW":
      return "APPROVER"; // hierarchical approval
    case "PROCUREMENT_REVIEW":
      return "PROCUREMENT"; // classification + offer analysis
    case "THRESHOLD_REVIEW":
      return "APPROVER"; // enhanced threshold validation
    case "PO_CREATED":
      return "PROCUREMENT"; // award + emit PO
    case "RECEIVED":
      return "RECEIVER"; // GRN/SAN
    default:
      return null;
  }
}

export const TIMELINE_STEPS: RequisitionStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "HIERARCHICAL_REVIEW",
  "PROCUREMENT_REVIEW",
  "THRESHOLD_REVIEW",
  "PO_CREATED",
  "RECEIVED",
  "CLOSED",
];
