import { Role, type ProcurementType, type Role as RoleType } from "@/lib/enums";

export type WorkspaceSlug =
  | "requester"
  | "approver"
  | "procurement"
  | "supplier-manager"
  | "receiver"
  | "archive-audit"
  | "reporting"
  | "admin";

export type WorkspaceDefinition = {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  slug: WorkspaceSlug;
  role: RoleType;
  path: string;
  title: string;
  shortTitle: string;
  purpose: string;
  layout: string[];
  mustShow: string[];
  actions: string[];
  noAccess: string[];
  primaryLinks: Array<{ label: string; href: string }>;
};

export const PROCUREMENT_METHODS_FROM_PDF: Array<{
  value: Exclude<ProcurementType, "UNCLASSIFIED">;
  label: string;
}> = [
  { value: "DIRECT_PURCHASE", label: "Achat direct" },
  { value: "PREQUALIFIED_SUPPLIER", label: "Fournisseur préqualifié" },
  { value: "QUOTATION", label: "Cotations multiples" },
  { value: "TENDER", label: "Appel d’offres" },
  { value: "SOLE_SOURCE", label: "Source unique" },
];

export const WORKSPACES: WorkspaceDefinition[] = [
  {
    number: 1,
    slug: "requester",
    role: Role.REQUESTER,
    path: "/workspaces/requester",
    title: "Requester Workspace",
    shortTitle: "Demandeur",
    purpose: "Create purchase requests.",
    layout: [
      "Left: New Requisition form",
      "Right: status timeline",
      "Bottom: My requests table",
    ],
    mustShow: [
      "Department",
      "Project",
      "Description",
      "Quantity",
      "Budget",
      "Budget line",
      "Attachments",
      "Auto-generated requisition number",
    ],
    actions: [
      "Save draft",
      "Submit",
      "Upload justification",
      "Edit only if draft/returned",
    ],
    noAccess: [
      "Supplier selection",
      "Offer analysis",
      "Approval buttons",
    ],
    primaryLinks: [
      { label: "New Requisition", href: "/requisitions/new" },
      { label: "My requests", href: "/requisitions?scope=mine" },
      { label: "My documents", href: "/documents" },
    ],
  },
  {
    number: 2,
    slug: "approver",
    role: Role.APPROVER,
    path: "/workspaces/approver",
    title: "Hierarchical Approver Workspace",
    shortTitle: "Approbateur",
    purpose: "Approve by threshold.",
    layout: [
      "Top: approval queue cards",
      "Center: selected request details",
      "Right: decision panel",
      "Bottom: decision history",
    ],
    mustShow: [
      "Requester",
      "Department/project",
      "Budget + budget line",
      "Attachments",
      "Threshold level",
      "Previous decisions",
    ],
    actions: [
      "Approve",
      "Reject",
      "Request correction",
      "Escalate to next approver if threshold requires",
    ],
    noAccess: [
      "Editing request content",
      "Supplier management",
      "Reception/GRN",
    ],
    primaryLinks: [
      { label: "Approval queue", href: "/approvals" },
      { label: "Decision history", href: "/requisitions" },
      { label: "Linked documents", href: "/documents" },
    ],
  },
  {
    number: 3,
    slug: "procurement",
    role: Role.PROCUREMENT,
    path: "/workspaces/procurement",
    title: "Procurement Officer Workspace",
    shortTitle: "Achats",
    purpose: "Classify purchase and manage procurement process.",
    layout: [
      "Top: approved requests waiting procurement",
      "Center: procurement method selector",
      "Right: process checklist",
      "Bottom: offer analysis / award panel",
    ],
    mustShow: PROCUREMENT_METHODS_FROM_PDF.map((method) => method.label),
    actions: [
      "Choose procurement method",
      "Define steps/responsibilities",
      "Launch sourcing/RFQ/tender",
      "Analyze offers",
      "Award supplier",
      "Track order",
    ],
    noAccess: ["Business approval", "GRN/SAN validation", "User permissions"],
    primaryLinks: [
      { label: "Procurement process", href: "/procurement" },
      { label: "Order tracking", href: "/purchase-orders" },
      { label: "Classification queue", href: "/approvals" },
    ],
  },
  {
    number: 4,
    slug: "supplier-manager",
    role: Role.SUPPLIER_MANAGER,
    path: "/workspaces/supplier-manager",
    title: "Supplier Manager Workspace",
    shortTitle: "Fournisseurs",
    purpose: "Supplier registry + due diligence.",
    layout: [
      "Left: supplier list",
      "Center: supplier profile",
      "Right: due diligence checklist",
      "Bottom: linked requests/orders",
    ],
    mustShow: [
      "Supplier status",
      "Prequalification status",
      "Due diligence docs",
      "Supplier history",
      "Orders linked to supplier",
    ],
    actions: [
      "Add/update supplier profile",
      "Prequalify supplier",
      "Upload due diligence documents",
      "Mark supplier approved/blocked/pending",
    ],
    noAccess: [
      "Approving requisitions",
      "Awarding markets alone",
      "Closing delivery",
    ],
    primaryLinks: [
      { label: "Supplier registry", href: "/suppliers" },
      { label: "Linked orders", href: "/purchase-orders" },
      { label: "Due diligence docs", href: "/documents" },
    ],
  },
  {
    number: 5,
    slug: "receiver",
    role: Role.RECEIVER,
    path: "/workspaces/receiver",
    title: "Receiver Workspace",
    shortTitle: "Réception",
    purpose: "Confirm goods/services received.",
    layout: [
      "Top: pending receptions",
      "Center: order/request details",
      "Right: GRN/SAN form",
      "Bottom: observations + attachments",
    ],
    mustShow: [
      "Supplier",
      "Ordered goods/services",
      "Quantity",
      "PO/order reference",
      "Expected delivery",
      "Attached documents",
    ],
    actions: [
      "Create GRN",
      "Create Service Acceptance Note",
      "Validate delivery/service",
      "Add observations",
      "Upload proof",
      "Flag discrepancy",
    ],
    noAccess: [
      "Supplier selection",
      "Approval chain",
      "Original budget modification",
    ],
    primaryLinks: [
      { label: "Pending receptions", href: "/receipts" },
      { label: "Purchase orders", href: "/purchase-orders" },
      { label: "Delivery proofs", href: "/documents" },
    ],
  },
  {
    number: 6,
    slug: "archive-audit",
    role: Role.AUDITOR,
    path: "/workspaces/archive-audit",
    title: "Archive & Audit Workspace",
    shortTitle: "Archive & Audit",
    purpose: "Traceability + document control.",
    layout: [
      "Top: global search",
      "Left: filters by request/status/date/user",
      "Center: document/results table",
      "Right: immutable audit timeline",
    ],
    mustShow: [
      "Every action",
      "Who did it",
      "When",
      "Decision/comment",
      "Attached files",
      "Access history",
    ],
    actions: [
      "Search documents",
      "View full timeline",
      "Export audit pack",
      "Review access logs",
    ],
    noAccess: [
      "Editing records",
      "Deleting audit history",
      "Approving anything",
    ],
    primaryLinks: [
      { label: "Document search", href: "/documents" },
      { label: "Audit timeline", href: "/audit" },
      { label: "Audit export", href: "/api/export/audit" },
    ],
  },
  {
    number: 7,
    slug: "reporting",
    role: Role.REPORTING,
    path: "/workspaces/reporting",
    title: "Reporting Workspace",
    shortTitle: "Reporting",
    purpose: "Dashboard and performance tracking.",
    layout: [
      "Top: KPI cards",
      "Center: charts",
      "Right: bottleneck/late-stage panel",
      "Bottom: exportable report table",
    ],
    mustShow: [
      "Requisitions by status",
      "Processing delays",
      "Late requests",
      "Procurement method split",
      "Supplier/order performance",
      "Excel/PDF export",
    ],
    actions: [
      "Filter reports",
      "Export Excel",
      "Export PDF",
      "View bottlenecks",
    ],
    noAccess: ["Workflow actions", "User permission changes"],
    primaryLinks: [
      { label: "Reports", href: "/reports" },
      { label: "Requisition export", href: "/api/export/requisitions" },
      { label: "Budget export", href: "/api/export/budget" },
    ],
  },
  {
    number: 8,
    slug: "admin",
    role: Role.ADMIN,
    path: "/workspaces/admin",
    title: "Admin Workspace",
    shortTitle: "Admin",
    purpose: "System configuration.",
    layout: [
      "Left: admin menu",
      "Center: selected config table",
      "Right: permission/rule editor",
    ],
    mustShow: [
      "Users",
      "Roles",
      "Access rights",
      "Departments",
      "Projects",
      "Budget lines",
      "Approval thresholds",
      "Workflow rules",
    ],
    actions: [
      "Create users",
      "Assign roles",
      "Configure permissions",
      "Configure thresholds",
      "Manage departments/projects/budget lines",
    ],
    noAccess: [
      "Deleting immutable audit history",
      "Secretly changing completed records",
    ],
    primaryLinks: [
      { label: "Users", href: "/admin/users" },
      { label: "Departments", href: "/admin/departments" },
      { label: "Projects", href: "/admin/projects" },
      { label: "Budget lines", href: "/admin/budget-lines" },
      { label: "Workflow rules", href: "/admin/settings" },
    ],
  },
];

export const WORKSPACE_BY_ROLE = Object.fromEntries(
  WORKSPACES.map((workspace) => [workspace.role, workspace]),
) as Record<RoleType, WorkspaceDefinition>;

export const WORKSPACE_BY_SLUG = Object.fromEntries(
  WORKSPACES.map((workspace) => [workspace.slug, workspace]),
) as Record<WorkspaceSlug, WorkspaceDefinition>;

export function workspaceHomeForRole(role: string): string {
  return WORKSPACE_BY_ROLE[role as RoleType]?.path ?? "/login";
}

export const PROCUREMENT_INTERCONNECTION = [
  "Requester submits requisition",
  "Hierarchical Approver validates by threshold",
  "Procurement Officer classifies purchase method",
  "Supplier Manager validates/prequalifies supplier",
  "Procurement Officer analyzes offers + awards + tracks order",
  "Receiver validates delivery/service with GRN or SAN",
  "Archive/Audit stores full traceability",
  "Reporting monitors KPI/delays/export",
  "Admin controls users, rights, thresholds, workflow rules",
] as const;
