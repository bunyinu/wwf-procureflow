import assert from "node:assert/strict";
import { ProcurementType, Role } from "../src/lib/enums";
import { can } from "../src/lib/permissions";
import {
  PROCUREMENT_INTERCONNECTION,
  PROCUREMENT_METHODS_FROM_PDF,
  WORKSPACE_BY_ROLE,
  WORKSPACES,
  workspaceHomeForRole,
} from "../src/lib/workspaces";
import { PROCUREMENT_TYPE_LABEL } from "../src/lib/enums";

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

const actor = (role: string) => ({ id: `${role.toLowerCase()}-id`, role });
const ownDraft = { requisition: { requesterId: "requester-id", status: "DRAFT" } };
const ownReturned = { requisition: { requesterId: "requester-id", status: "RETURNED_FOR_REVISION" } };
const procurementReview = { requisition: { requesterId: "requester-id", status: "PROCUREMENT_REVIEW" } };
const poCreated = { requisition: { requesterId: "requester-id", status: "PO_CREATED" } };

assert.equal(can(actor(Role.REQUESTER), "create", "requisition"), true, "requester creates requisitions");
assert.equal(can(actor(Role.REQUESTER), "update", "requisition", ownDraft), true, "requester edits drafts");
assert.equal(can(actor(Role.REQUESTER), "update", "requisition", ownReturned), true, "requester edits returned requests");
assert.equal(can(actor(Role.REQUESTER), "decide", "requisition", procurementReview), false, "requester never sees approval buttons");
assert.equal(can(actor(Role.REQUESTER), "create", "supplier"), false, "requester has no supplier selection/management");

assert.equal(can(actor(Role.APPROVER), "decide", "requisition", { requisition: { requesterId: "requester-id", status: "MANAGER_REVIEW" } }), true, "approver handles hierarchical queue");
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

console.log("workspace-contract-ok");
