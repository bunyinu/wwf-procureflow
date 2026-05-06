import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ProcurementType, Role, SupplierDocumentCategory } from "../src/lib/enums";
import { DocumentCategory } from "../src/lib/enums";
import { SUPPLIER_DOCUMENT_CATEGORY_LABEL } from "../src/lib/enums";
import {
  canUploadRequisitionDocument,
  documentCategoriesForRequisitionUpload,
  REQUISITION_DOCUMENT_CATEGORIES,
} from "../src/lib/document-permissions";
import { optionalFormString } from "../src/lib/form";
import { can } from "../src/lib/permissions";
import {
  WWF_EVALUATION_CRITERIA,
  WWF_EXPECTED_DELIVERABLES,
  WWF_FUNCTIONAL_REQUIREMENTS,
  WWF_TDR,
  WWF_TECHNICAL_SCORE,
  WWF_FINANCIAL_SCORE,
  WWF_TOTAL_SCORE,
} from "../src/lib/tdr";
import {
  PROCUREMENT_INTERCONNECTION,
  PROCUREMENT_METHODS_FROM_PDF,
  WORKSPACE_BY_ROLE,
  WORKSPACES,
  workspaceHomeForRole,
} from "../src/lib/workspaces";
import { PROCUREMENT_TYPE_LABEL } from "../src/lib/enums";
import { isValidTransition, resolveApprovedDecisionStatus } from "../src/lib/workflow";
import { computeStageTimings } from "../src/lib/sla";

const roles = [
  Role.REQUESTER,
  Role.APPROVER,
  Role.PROCUREMENT,
  Role.SUPPLIER_MANAGER,
  Role.RECEIVER,
  Role.AUDITOR,
  Role.REPORTING,
  Role.ADMIN,
] as const;

assert.deepEqual(
  Object.keys(Role),
  [
    "REQUESTER",
    "APPROVER",
    "PROCUREMENT",
    "SUPPLIER_MANAGER",
    "RECEIVER",
    "AUDITOR",
    "REPORTING",
    "ADMIN",
  ],
  "Role registry must contain exactly the 8 workspace roles and no legacy aliases",
);
assert.equal(Object.values(Role).includes("MANAGER" as never), false, "MANAGER must not exist as a role");
assert.equal(Object.values(Role).includes("FINANCE" as never), false, "FINANCE must not exist as a role");

assert.equal(WWF_TDR.submissionDeadline, "21 mai 2026 à 17h00, heure de Kinshasa", "TDR submission deadline must match the PDF");
assert.deepEqual(WWF_TDR.projects, ["OD-40001336", "OD-403725"], "TDR project codes must match the PDF");
assert.equal(WWF_TDR.submissionEmail, "procurement@wwfdrc.org", "submission email must match the PDF");
assert.equal(WWF_FUNCTIONAL_REQUIREMENTS.length, 9, "TDR §4 must be represented from 4.1 to 4.9");
assert.equal(WWF_EXPECTED_DELIVERABLES.length, 7, "TDR §6 requires seven deliverables");
assert.equal(
  WWF_EVALUATION_CRITERIA.reduce((sum, item) => sum + item.points, 0),
  WWF_TOTAL_SCORE,
  "TDR evaluation criteria must total 100 points",
);
assert.equal(
  WWF_EVALUATION_CRITERIA.filter((item) => item.group === "Technique").reduce((sum, item) => sum + item.points, 0),
  WWF_TECHNICAL_SCORE,
  "technical score must total 80 points",
);
assert.equal(
  WWF_EVALUATION_CRITERIA.filter((item) => item.group === "Financière").reduce((sum, item) => sum + item.points, 0),
  WWF_FINANCIAL_SCORE,
  "financial score must total 20 points",
);

assert.equal(WORKSPACES.length, 8, "must expose exactly 8 workspaces");
assert.deepEqual(
  WORKSPACES.map((workspace) => workspace.role),
  [...roles],
  "workspace order must match the 8 process roles",
);
assert.equal(new Set(WORKSPACES.map((workspace) => workspace.path)).size, 8, "workspace routes must be distinct");

for (const role of roles) {
  assert.equal(WORKSPACE_BY_ROLE[role].role, role, `workspace missing for ${role}`);
  assert.equal(workspaceHomeForRole(role), WORKSPACE_BY_ROLE[role].path, `home route mismatch for ${role}`);
}

const exactWorkspaceContract = [
  {
    role: Role.REQUESTER,
    title: "Requester Workspace",
    layout: ["Left: New Requisition form", "Right: status timeline", "Bottom: My requests table"],
    mustShow: ["Department", "Project", "Description", "Quantity", "Budget", "Budget line", "Attachments", "Auto-generated requisition number"],
    actions: ["Save draft", "Submit", "Upload justification", "Edit only if draft/returned"],
    noAccess: ["Supplier selection", "Offer analysis", "Approval buttons"],
  },
  {
    role: Role.APPROVER,
    title: "Hierarchical Approver Workspace",
    layout: ["Top: approval queue cards", "Center: selected request details", "Right: decision panel", "Bottom: decision history"],
    mustShow: ["Requester", "Department/project", "Budget + budget line", "Attachments", "Threshold level", "Previous decisions"],
    actions: ["Approve", "Reject", "Request correction", "Escalate to next approver if threshold requires"],
    noAccess: ["Editing request content", "Supplier management", "Reception/GRN"],
  },
  {
    role: Role.PROCUREMENT,
    title: "Procurement Officer Workspace",
    layout: ["Top: approved requests waiting procurement", "Center: procurement method selector", "Right: process checklist", "Bottom: offer analysis / award panel"],
    mustShow: ["Achat direct", "Fournisseur préqualifié", "Cotations multiples", "Appel d’offres", "Source unique"],
    actions: ["Choose procurement method", "Define steps/responsibilities", "Launch sourcing/RFQ/tender", "Analyze offers", "Award supplier", "Track order"],
    noAccess: ["Business approval", "GRN/SAN validation", "User permissions"],
  },
  {
    role: Role.SUPPLIER_MANAGER,
    title: "Supplier Manager Workspace",
    layout: ["Left: supplier list", "Center: supplier profile", "Right: due diligence checklist", "Bottom: linked requests/orders"],
    mustShow: ["Supplier status", "Prequalification status", "Due diligence docs", "Supplier history", "Orders linked to supplier"],
    actions: ["Add/update supplier profile", "Prequalify supplier", "Upload due diligence documents", "Mark supplier approved/blocked/pending"],
    noAccess: ["Approving requisitions", "Awarding markets alone", "Closing delivery"],
  },
  {
    role: Role.RECEIVER,
    title: "Receiver Workspace",
    layout: ["Top: pending receptions", "Center: order/request details", "Right: GRN/SAN form", "Bottom: observations + attachments"],
    mustShow: ["Supplier", "Ordered goods/services", "Quantity", "PO/order reference", "Expected delivery", "Attached documents"],
    actions: ["Create GRN", "Create Service Acceptance Note", "Validate delivery/service", "Add observations", "Upload proof", "Flag discrepancy"],
    noAccess: ["Supplier selection", "Approval chain", "Original budget modification"],
  },
  {
    role: Role.AUDITOR,
    title: "Archive & Audit Workspace",
    layout: ["Top: global search", "Left: filters by request/status/date/user", "Center: document/results table", "Right: immutable audit timeline"],
    mustShow: ["Every action", "Who did it", "When", "Decision/comment", "Attached files", "Access history"],
    actions: ["Search documents", "View full timeline", "Export audit pack", "Review access logs"],
    noAccess: ["Editing records", "Deleting audit history", "Approving anything"],
  },
  {
    role: Role.REPORTING,
    title: "Reporting Workspace",
    layout: ["Top: KPI cards", "Center: charts", "Right: bottleneck/late-stage panel", "Bottom: exportable report table"],
    mustShow: ["Requisitions by status", "Processing delays", "Late requests", "Procurement method split", "Supplier/order performance", "Excel/PDF export"],
    actions: ["Filter reports", "Export Excel", "Export PDF", "View bottlenecks"],
    noAccess: ["Workflow actions", "User permission changes"],
  },
  {
    role: Role.ADMIN,
    title: "Admin Workspace",
    layout: ["Left: admin menu", "Center: selected config table", "Right: permission/rule editor"],
    mustShow: ["Users", "Roles", "Access rights", "Departments", "Projects", "Budget lines", "Approval thresholds", "Workflow rules"],
    actions: ["Create users", "Assign roles", "Configure permissions", "Configure thresholds", "Manage departments/projects/budget lines"],
    noAccess: ["Deleting immutable audit history", "Secretly changing completed records"],
  },
] as const;

for (const expected of exactWorkspaceContract) {
  const actual = WORKSPACE_BY_ROLE[expected.role];
  assert.equal(actual.title, expected.title, `${expected.role} title mismatch`);
  assert.deepEqual(actual.layout, [...expected.layout], `${expected.role} layout mismatch`);
  assert.deepEqual(actual.mustShow, [...expected.mustShow], `${expected.role} mustShow mismatch`);
  assert.deepEqual(actual.actions, [...expected.actions], `${expected.role} actions mismatch`);
  assert.deepEqual(actual.noAccess, [...expected.noAccess], `${expected.role} noAccess mismatch`);
}

assert.deepEqual(
  PROCUREMENT_METHODS_FROM_PDF.map((method) => method.label),
  [
    "Achat direct",
    "Fournisseur préqualifié",
    "Cotations multiples",
    "Appel d’offres",
    "Source unique",
  ],
  "procurement method labels must match the PDF contract",
);
assert.equal(PROCUREMENT_TYPE_LABEL[ProcurementType.UNCLASSIFIED], "À classifier par Achats");
assert.equal(PROCUREMENT_TYPE_LABEL[ProcurementType.QUOTATION], "Cotations multiples");
assert.equal(PROCUREMENT_TYPE_LABEL[ProcurementType.SOLE_SOURCE], "Source unique");
assert.deepEqual(
  resolveApprovedDecisionStatus({
    fromStatus: "HIERARCHICAL_REVIEW",
    amount: 840,
    procurementType: ProcurementType.UNCLASSIFIED,
  }),
  { ok: true, newStatus: "PROCUREMENT_REVIEW" },
  "hierarchical approval must route cleanly to procurement review",
);
assert.equal(
  isValidTransition("HIERARCHICAL_REVIEW", "PROCUREMENT_REVIEW"),
  true,
  "hierarchical approval transition must be valid",
);
assert.deepEqual(
  resolveApprovedDecisionStatus({
    fromStatus: "PROCUREMENT_REVIEW",
    amount: 1850,
    procurementType: ProcurementType.UNCLASSIFIED,
  }),
  { ok: false, error: "procurement_method_required" },
  "procurement approval must require a selected purchase method",
);
const procurementApproval = resolveApprovedDecisionStatus({
  fromStatus: "PROCUREMENT_REVIEW",
  amount: 1850,
  procurementType: ProcurementType.QUOTATION,
});
assert.deepEqual(
  procurementApproval,
  { ok: true, newStatus: "THRESHOLD_REVIEW" },
  "procurement approval with a method must route to the threshold step when amount requires it",
);
assert.equal(
  procurementApproval.ok &&
    isValidTransition("PROCUREMENT_REVIEW", procurementApproval.newStatus),
  true,
  "procurement approval route must be a valid workflow transition",
);
const thresholdApproval = resolveApprovedDecisionStatus({
  fromStatus: "THRESHOLD_REVIEW",
  amount: 5200,
  procurementType: ProcurementType.PREQUALIFIED_SUPPLIER,
});
assert.deepEqual(
  thresholdApproval,
  { ok: true, newStatus: "PO_CREATED" },
  "threshold approval must route cleanly to PO creation",
);
assert.equal(
  thresholdApproval.ok &&
    isValidTransition("THRESHOLD_REVIEW", thresholdApproval.newStatus),
  true,
  "threshold approval route must be a valid workflow transition",
);
assert.equal(
  isValidTransition("PO_CREATED", "RECEIVED"),
  true,
  "receiver GRN/SAN validation must move PO-created requisitions to received",
);
assert.equal(
  isValidTransition("RECEIVED", "CLOSED"),
  true,
  "procurement must be able to close received requisitions",
);
assert.equal(
  computeStageTimings({
    createdAt: new Date("2026-05-03T00:00:00Z"),
    submittedAt: new Date("2026-05-01T00:00:00Z"),
    status: "THRESHOLD_REVIEW",
    approvals: [],
    now: new Date("2026-05-04T00:00:00Z"),
  })[0]?.durationMs,
  0,
  "SLA rendering must never show negative durations when imported dates are inconsistent",
);

const actor = (role: string) => ({ id: `${role.toLowerCase()}-id`, role });
const ownDraft = { requisition: { requesterId: "requester-id", status: "DRAFT" } };
const ownReturned = { requisition: { requesterId: "requester-id", status: "RETURNED_FOR_REVISION" } };
const procurementReview = { requisition: { requesterId: "requester-id", status: "PROCUREMENT_REVIEW" } };
const poCreated = { requisition: { requesterId: "requester-id", status: "PO_CREATED" } };

for (const role of roles) {
  assert.equal(can(actor(role), "read", "requisition", procurementReview), true, `${role} can open requisition detail for read-only viewing`);
}

assert.equal(can(actor(Role.REQUESTER), "create", "requisition"), true, "requester creates requisitions");
assert.equal(can(actor(Role.REQUESTER), "update", "requisition", ownDraft), true, "requester edits drafts");
assert.equal(can(actor(Role.REQUESTER), "update", "requisition", ownReturned), true, "requester edits returned requests");
assert.equal(can(actor(Role.REQUESTER), "decide", "requisition", procurementReview), false, "requester never sees approval buttons");
assert.equal(can(actor(Role.REQUESTER), "create", "supplier"), false, "requester has no supplier selection/management");

assert.equal(can(actor(Role.APPROVER), "decide", "requisition", { requisition: { requesterId: "requester-id", status: "HIERARCHICAL_REVIEW" } }), true, "approver handles hierarchical queue");
assert.equal(can(actor(Role.APPROVER), "update", "requisition", ownDraft), false, "approver cannot edit request content");
assert.equal(can(actor(Role.APPROVER), "create", "goodsReceipt"), false, "approver has no GRN/SAN access");

assert.equal(can(actor(Role.PROCUREMENT), "classify", "requisition", procurementReview), true, "procurement classifies method");
assert.equal(can(actor(Role.PROCUREMENT), "issuePO", "purchaseOrder"), true, "procurement awards/tracks orders");
assert.equal(can(actor(Role.PROCUREMENT), "create", "goodsReceipt", poCreated), false, "procurement cannot validate GRN/SAN");
assert.equal(can(actor(Role.PROCUREMENT), "update", "user"), false, "procurement cannot change user permissions");
assert.equal(can(actor(Role.PROCUREMENT), "update", "supplier"), false, "procurement cannot manage supplier registry");

assert.equal(can(actor(Role.SUPPLIER_MANAGER), "update", "supplier"), true, "supplier manager owns due diligence");
assert.equal(can(actor(Role.SUPPLIER_MANAGER), "decide", "requisition", procurementReview), false, "supplier manager cannot approve requisitions");
assert.equal(can(actor(Role.SUPPLIER_MANAGER), "issuePO", "purchaseOrder"), false, "supplier manager cannot award markets alone");
assert.equal(can(actor(Role.SUPPLIER_MANAGER), "create", "goodsReceipt", poCreated), false, "supplier manager cannot close delivery");

assert.equal(can(actor(Role.RECEIVER), "create", "goodsReceipt", poCreated), true, "receiver creates GRN/SAN");
assert.equal(can(actor(Role.RECEIVER), "issuePO", "purchaseOrder"), false, "receiver cannot select suppliers");
assert.equal(can(actor(Role.RECEIVER), "update", "budgetLine"), false, "receiver cannot modify original budget");

assert.equal(can(actor(Role.AUDITOR), "read", "auditLog"), true, "auditor reads immutable audit history");
assert.equal(can(actor(Role.AUDITOR), "update", "auditLog"), false, "auditor cannot edit audit history");
assert.equal(can(actor(Role.AUDITOR), "decide", "requisition", procurementReview), false, "auditor cannot approve anything");

assert.equal(can(actor(Role.REPORTING), "read", "auditLog"), true, "reporting can export/report audit data");
assert.equal(can(actor(Role.REPORTING), "decide", "requisition", procurementReview), false, "reporting has no workflow actions");
assert.equal(can(actor(Role.REPORTING), "update", "user"), false, "reporting cannot change permissions");

assert.equal(can(actor(Role.ADMIN), "update", "user"), true, "admin configures users");
assert.equal(can(actor(Role.ADMIN), "delete", "auditLog"), false, "admin cannot delete immutable audit history");
assert.equal(can(actor(Role.ADMIN), "decide", "requisition", procurementReview), false, "admin cannot secretly change workflow records");

assert.equal(optionalFormString(null), undefined, "missing optional form fields must not fail validation");
assert.equal(optionalFormString(""), undefined, "blank optional form fields must not fail validation");
assert.equal(optionalFormString(" 2026-05-21 "), "2026-05-21", "optional form strings are trimmed when present");

assert.deepEqual(
  REQUISITION_DOCUMENT_CATEGORIES,
  [
    DocumentCategory.QUOTATION,
    DocumentCategory.CONTRACT,
    DocumentCategory.INVOICE,
    DocumentCategory.JUSTIFICATION,
    DocumentCategory.GRN,
    DocumentCategory.SAN,
    DocumentCategory.OTHER,
  ],
  "requisition document categories must be devis, contrat, facture, justification, GRN, SAN, autres",
);
assert.equal(
  REQUISITION_DOCUMENT_CATEGORIES.includes("IDENTITY" as never),
  false,
  "identity document must not be listed as a requisition attachment category",
);
assert.deepEqual(
  documentCategoriesForRequisitionUpload(actor(Role.REQUESTER), {
    requesterId: "requester-id",
    status: "DRAFT",
  }),
  [DocumentCategory.JUSTIFICATION, DocumentCategory.OTHER],
  "requester may attach justification/proof only after the requisition exists and is editable",
);
assert.equal(
  canUploadRequisitionDocument(
    actor(Role.REQUESTER),
    { requesterId: "requester-id", status: "DRAFT" },
    DocumentCategory.JUSTIFICATION,
  ),
  true,
  "requester can upload justification after creation",
);
assert.equal(
  canUploadRequisitionDocument(
    actor(Role.APPROVER),
    { requesterId: "requester-id", status: "HIERARCHICAL_REVIEW" },
    DocumentCategory.JUSTIFICATION,
  ),
  false,
  "approver can view attachments but cannot upload them",
);
assert.equal(
  canUploadRequisitionDocument(
    actor(Role.RECEIVER),
    { requesterId: "requester-id", status: "PO_CREATED" },
    DocumentCategory.GRN,
  ),
  true,
  "receiver can upload GRN/SAN proof at reception stage",
);

assert.deepEqual(
  [...PROCUREMENT_INTERCONNECTION],
  [
    "Requester submits requisition",
    "Hierarchical Approver validates by threshold",
    "Procurement Officer classifies purchase method",
    "Supplier Manager validates/prequalifies supplier",
    "Procurement Officer analyzes offers + awards + tracks order",
    "Receiver validates delivery/service with GRN or SAN",
    "Archive/Audit stores full traceability",
    "Reporting monitors KPI/delays/export",
    "Admin controls users, rights, thresholds, workflow rules",
  ],
  "interconnection sequence must match the required process",
);

const seedSource = readFileSync("prisma/seed.ts", "utf8");
const schemaSource = readFileSync("prisma/schema.prisma", "utf8");
const requisitionActionsSource = readFileSync("src/app/(app)/requisitions/actions.ts", "utf8");
const supplierActionsSource = readFileSync("src/app/(app)/suppliers/actions.ts", "utf8");
const requisitionDetailSource = readFileSync("src/app/(app)/requisitions/[id]/page.tsx", "utf8");
const documentsPageSource = readFileSync("src/app/(app)/documents/page.tsx", "utf8");
assert.equal(seedSource.includes("Role.MANAGER"), false, "seed must not create legacy manager role entries");
assert.equal(seedSource.includes("Role.FINANCE"), false, "seed must not create legacy finance role entries");
assert.equal(schemaSource.includes("model SupplierDocument"), true, "supplier due diligence documents must be persisted, not only described in UI");
assert.equal(seedSource.includes("supplierDocument.create"), true, "seed must include supplier due diligence documents for evaluator demo");
assert.equal(
  SUPPLIER_DOCUMENT_CATEGORY_LABEL[SupplierDocumentCategory.ANTI_CORRUPTION],
  "Annexe B anti-corruption",
  "supplier due diligence must include Annex B anti-corruption evidence",
);
assert.equal(
  supplierActionsSource.includes("attachSupplierDocumentAction"),
  true,
  "supplier manager must have a server action to upload due diligence documents",
);
assert.equal(
  requisitionActionsSource.includes("createQuoteAction") && requisitionActionsSource.includes("markQuoteWinnerAction"),
  true,
  "procurement workspace must persist offer analysis and award selection",
);
assert.equal(
  requisitionActionsSource.includes("updateRequisitionAction") &&
    requisitionDetailSource.includes("Modifier la réquisition"),
  true,
  "requester must be able to edit draft/returned requisitions, not only view them",
);
assert.equal(
  documentsPageSource.includes('requireRole("AUDITOR", "SUPPLIER_MANAGER")'),
  true,
  "supplier manager must be able to review due diligence documents without entering the audit workspace",
);

console.log("workspace-contract-ok");
