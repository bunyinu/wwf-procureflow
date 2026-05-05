// Enum-like string unions. SQLite/Prisma do not support native enums on this
// connector, so we centralise allowed values here and validate at the
// application layer.

// Roles aligned with the TDR's process modules (not job titles).
// - APPROVER absorbs hierarchical approval at every threshold (was Manager + Finance).
// - SUPPLIER_MANAGER, RECEIVER, REPORTING are explicit module owners.
// MANAGER and FINANCE are kept as aliases for backwards-compatibility with seeded data;
// new accounts use the new names.
export const Role = {
  REQUESTER: "REQUESTER",
  APPROVER: "APPROVER",
  PROCUREMENT: "PROCUREMENT",
  SUPPLIER_MANAGER: "SUPPLIER_MANAGER",
  RECEIVER: "RECEIVER",
  AUDITOR: "AUDITOR",
  REPORTING: "REPORTING",
  ADMIN: "ADMIN",
  // Legacy aliases — fold into the new model
  MANAGER: "APPROVER",
  FINANCE: "APPROVER",
} as const;
export type Role =
  | "REQUESTER"
  | "APPROVER"
  | "PROCUREMENT"
  | "SUPPLIER_MANAGER"
  | "RECEIVER"
  | "AUDITOR"
  | "REPORTING"
  | "ADMIN";

export const RequisitionStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  MANAGER_REVIEW: "MANAGER_REVIEW",
  PROCUREMENT_REVIEW: "PROCUREMENT_REVIEW",
  FINANCE_REVIEW: "FINANCE_REVIEW",
  PO_CREATED: "PO_CREATED",
  RECEIVED: "RECEIVED",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
  RETURNED_FOR_REVISION: "RETURNED_FOR_REVISION",
  CANCELLED: "CANCELLED",
} as const;
export type RequisitionStatus =
  (typeof RequisitionStatus)[keyof typeof RequisitionStatus];

export const Priority = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

export const ProcurementType = {
  DIRECT_PURCHASE: "DIRECT_PURCHASE",
  QUOTATION: "QUOTATION",
  TENDER: "TENDER",
  SOLE_SOURCE: "SOLE_SOURCE",
  PREQUALIFIED_SUPPLIER: "PREQUALIFIED_SUPPLIER",
} as const;
export type ProcurementType =
  (typeof ProcurementType)[keyof typeof ProcurementType];

export const ApprovalDecision = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED",
} as const;
export type ApprovalDecision =
  (typeof ApprovalDecision)[keyof typeof ApprovalDecision];

export const SupplierStatus = {
  PENDING: "PENDING",
  PREQUALIFIED: "PREQUALIFIED",
  SUSPENDED: "SUSPENDED",
  REJECTED: "REJECTED",
} as const;
export type SupplierStatus =
  (typeof SupplierStatus)[keyof typeof SupplierStatus];

export const DueDiligenceStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_REVIEW: "IN_REVIEW",
  CLEARED: "CLEARED",
  FAILED: "FAILED",
} as const;
export type DueDiligenceStatus =
  (typeof DueDiligenceStatus)[keyof typeof DueDiligenceStatus];

export const POStatus = {
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const;
export type POStatus = (typeof POStatus)[keyof typeof POStatus];

export const ReceiptType = {
  GRN: "GRN",
  SAN: "SAN",
} as const;
export type ReceiptType = (typeof ReceiptType)[keyof typeof ReceiptType];

export const DocumentCategory = {
  JUSTIFICATION: "JUSTIFICATION",
  QUOTATION: "QUOTATION",
  CONTRACT: "CONTRACT",
  INVOICE: "INVOICE",
  GRN: "GRN",
  SAN: "SAN",
  OTHER: "OTHER",
} as const;
export type DocumentCategory =
  (typeof DocumentCategory)[keyof typeof DocumentCategory];

// Display labels (French)
export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Faible",
  NORMAL: "Normale",
  HIGH: "Élevée",
  URGENT: "Urgente",
};

export const PROCUREMENT_TYPE_LABEL: Record<ProcurementType, string> = {
  DIRECT_PURCHASE: "Achat direct",
  QUOTATION: "Demande de devis",
  TENDER: "Appel d'offres",
  SOLE_SOURCE: "Fournisseur unique",
  PREQUALIFIED_SUPPLIER: "Fournisseur préqualifié",
};

export const SUPPLIER_STATUS_LABEL: Record<SupplierStatus, string> = {
  PENDING: "En attente",
  PREQUALIFIED: "Préqualifié",
  SUSPENDED: "Suspendu",
  REJECTED: "Rejeté",
};

export const DUE_DILIGENCE_LABEL: Record<DueDiligenceStatus, string> = {
  NOT_STARTED: "Non commencée",
  IN_REVIEW: "En cours",
  CLEARED: "Validée",
  FAILED: "Échec",
};

export const PO_STATUS_LABEL: Record<POStatus, string> = {
  DRAFT: "Brouillon",
  ISSUED: "Émis",
  PARTIALLY_RECEIVED: "Partiellement reçu",
  RECEIVED: "Reçu",
  CANCELLED: "Annulé",
};

export const RECEIPT_TYPE_LABEL: Record<ReceiptType, string> = {
  GRN: "Bon de réception (GRN)",
  SAN: "Constat d'acceptation de service (SAN)",
};

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  JUSTIFICATION: "Justification",
  QUOTATION: "Devis",
  CONTRACT: "Contrat",
  INVOICE: "Facture",
  GRN: "GRN",
  SAN: "SAN",
  OTHER: "Autre",
};

export const PRIORITY_BADGE: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  NORMAL: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  HIGH: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  URGENT: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export const SUPPLIER_STATUS_BADGE: Record<SupplierStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  PREQUALIFIED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  SUSPENDED: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  REJECTED: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export const DUE_DILIGENCE_BADGE: Record<DueDiligenceStatus, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  IN_REVIEW: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  CLEARED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  FAILED: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export const PO_STATUS_BADGE: Record<POStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  ISSUED: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  PARTIALLY_RECEIVED: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  RECEIVED: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  CANCELLED: "bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300",
};
