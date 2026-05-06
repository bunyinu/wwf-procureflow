import { PrismaClient } from "@prisma/client";
import {
  ApprovalDecision,
  DocumentCategory,
  DueDiligenceStatus,
  POStatus,
  Priority,
  ProcurementType,
  RequisitionStatus,
  Role,
  SupplierStatus,
} from "../src/lib/enums";

const prisma = new PrismaClient();

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function dayBefore(date: Date | null, fallbackDaysAgo: number): Date {
  if (!date) return daysAgo(fallbackDaysAgo);
  const created = new Date(date);
  created.setDate(created.getDate() - 1);
  return created;
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.goodsReceipt.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.purchaseRequisition.deleteMany();
  await prisma.budgetLine.deleteMany();
  await prisma.project.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.setting.deleteMany();

  const departments = await Promise.all(
    [
      { name: "Administration", code: "ADM" },
      { name: "Programmes", code: "PRG" },
      { name: "Logistique", code: "LOG" },
      { name: "Reporting", code: "RPT" },
    ].map((data) => prisma.department.create({ data })),
  );
  const dept = Object.fromEntries(departments.map((d) => [d.code, d]));

  const users = await Promise.all(
    [
      ["Christine Mbala", "requester@tsc.demo", Role.REQUESTER, dept.PRG.id],
      ["Joseph Kabasele", "approver@tsc.demo", Role.APPROVER, dept.PRG.id],
      ["Aline Tshibanda", "procurement@tsc.demo", Role.PROCUREMENT, dept.LOG.id],
      ["Patrick Lumumba", "supplier@tsc.demo", Role.SUPPLIER_MANAGER, dept.LOG.id],
      ["Marie Tshilanda", "receiver@tsc.demo", Role.RECEIVER, dept.LOG.id],
      ["Esther Kasongo", "audit@tsc.demo", Role.AUDITOR, dept.ADM.id],
      ["Léon Mwanza", "reporting@tsc.demo", Role.REPORTING, dept.RPT.id],
      ["Daniel Mukendi", "admin@tsc.demo", Role.ADMIN, dept.ADM.id],
    ].map(([fullName, email, role, departmentId]) =>
      prisma.user.create({
        data: {
          fullName: String(fullName),
          email: String(email),
          role: String(role),
          departmentId: String(departmentId),
          password: "demo123",
          active: true,
        },
      }),
    ),
  );
  const user = Object.fromEntries(users.map((u) => [u.email, u]));

  await prisma.department.update({ where: { id: dept.PRG.id }, data: { managerUserId: user["approver@tsc.demo"].id } });
  await prisma.department.update({ where: { id: dept.LOG.id }, data: { managerUserId: user["approver@tsc.demo"].id } });

  const projects = await Promise.all(
    [
      { name: "Conservation", projectCode: "OD-40001336", donor: "WWF International" },
      { name: "Operations RDC", projectCode: "OD-403725", donor: "WWF-RDC" },
      { name: "Forest Programme", projectCode: "FOR-RDC", donor: "EU" },
    ].map((data) => prisma.project.create({ data })),
  );
  const project = Object.fromEntries(projects.map((p) => [p.projectCode, p]));

  const budgetLines = await Promise.all(
    [
      [project["OD-40001336"].id, "BL-CONS-EQ", "Équipements conservation", 50000],
      [project["OD-40001336"].id, "BL-CONS-MIS", "Missions terrain", 35000],
      [project["OD-403725"].id, "BL-OPS-IT", "Informatique", 40000],
      [project["FOR-RDC"].id, "BL-FOR-LOG", "Logistique forêts", 45000],
    ].map(([projectId, code, label, allocatedBudget]) =>
      prisma.budgetLine.create({
        data: {
          projectId: String(projectId),
          code: String(code),
          label: String(label),
          allocatedBudget: Number(allocatedBudget),
          committedAmount: 0,
          spentAmount: 0,
        },
      }),
    ),
  );
  const budget = Object.fromEntries(budgetLines.map((b) => [b.code, b]));

  const suppliers = await Promise.all(
    [
      ["CongoTech SARL", SupplierStatus.PREQUALIFIED, DueDiligenceStatus.CLEARED, 91],
      ["MotorPlus RDC", SupplierStatus.PREQUALIFIED, DueDiligenceStatus.CLEARED, 84],
      ["OfficePro Kinshasa", SupplierStatus.PENDING, DueDiligenceStatus.IN_REVIEW, 62],
    ].map(([companyName, status, dueDiligenceStatus, score]) =>
      prisma.supplier.create({
        data: {
          companyName: String(companyName),
          status: String(status),
          dueDiligenceStatus: String(dueDiligenceStatus),
          score: Number(score),
          taxId: `NIF-${String(score)}`,
          contactName: "Contact commercial",
          email: `${String(companyName).toLowerCase().replace(/\s+/g, ".")}@demo.cd`,
          phone: "+243 000 000 000",
          address: "Kinshasa, RDC",
          antiCorruptionSignedAt: dueDiligenceStatus === DueDiligenceStatus.CLEARED ? daysAgo(30) : null,
        },
      }),
    ),
  );
  const supplier = Object.fromEntries(suppliers.map((s) => [s.companyName, s]));

  const reqSpecs = [
    {
      n: 1,
      title: "Fournitures atelier communautaire",
      description: "Supports et consommables pour atelier communautaire.",
      departmentId: dept.PRG.id,
      projectId: project["FOR-RDC"].id,
      budgetLineId: budget["BL-FOR-LOG"].id,
      amount: 720,
      quantity: 1,
      unit: "lot",
      procurementType: ProcurementType.UNCLASSIFIED,
      status: RequisitionStatus.DRAFT,
      priority: Priority.NORMAL,
      submittedAt: null,
      currentApproverRole: null,
    },
    {
      n: 2,
      title: "Formation cybersécurité",
      description: "Formation courte du personnel sur les bonnes pratiques de sécurité.",
      departmentId: dept.ADM.id,
      projectId: project["OD-403725"].id,
      budgetLineId: budget["BL-OPS-IT"].id,
      amount: 2800,
      quantity: 30,
      unit: "participant",
      procurementType: ProcurementType.UNCLASSIFIED,
      status: RequisitionStatus.RETURNED_FOR_REVISION,
      priority: Priority.NORMAL,
      submittedAt: daysAgo(4),
      currentApproverRole: null,
    },
    {
      n: 3,
      title: "Kits GPS terrain",
      description: "GPS et accessoires pour équipes terrain.",
      departmentId: dept.PRG.id,
      projectId: project["OD-40001336"].id,
      budgetLineId: budget["BL-CONS-EQ"].id,
      amount: 3600,
      quantity: 6,
      unit: "kit",
      procurementType: ProcurementType.UNCLASSIFIED,
      status: RequisitionStatus.HIERARCHICAL_REVIEW,
      priority: Priority.HIGH,
      submittedAt: daysAgo(1),
      currentApproverRole: Role.APPROVER,
    },
    {
      n: 4,
      title: "Impression supports sensibilisation",
      description: "Brochures et affiches pour campagne locale.",
      departmentId: dept.PRG.id,
      projectId: project["FOR-RDC"].id,
      budgetLineId: budget["BL-FOR-LOG"].id,
      amount: 1850,
      quantity: 500,
      unit: "exemplaire",
      procurementType: ProcurementType.UNCLASSIFIED,
      status: RequisitionStatus.PROCUREMENT_REVIEW,
      priority: Priority.NORMAL,
      submittedAt: daysAgo(3),
      currentApproverRole: Role.PROCUREMENT,
    },
    {
      n: 5,
      title: "Location véhicule mission terrain",
      description: "Location 4x4 avec chauffeur pour mission de suivi.",
      departmentId: dept.LOG.id,
      projectId: project["OD-40001336"].id,
      budgetLineId: budget["BL-CONS-MIS"].id,
      amount: 5200,
      quantity: 10,
      unit: "jour",
      procurementType: ProcurementType.PREQUALIFIED_SUPPLIER,
      status: RequisitionStatus.THRESHOLD_REVIEW,
      priority: Priority.URGENT,
      submittedAt: daysAgo(5),
      currentApproverRole: Role.APPROVER,
    },
    {
      n: 6,
      title: "Ordinateurs équipe terrain",
      description: "Ordinateurs portables pour les agents terrain.",
      departmentId: dept.PRG.id,
      projectId: project["OD-403725"].id,
      budgetLineId: budget["BL-OPS-IT"].id,
      amount: 8400,
      quantity: 4,
      unit: "unité",
      procurementType: ProcurementType.QUOTATION,
      status: RequisitionStatus.PO_CREATED,
      priority: Priority.HIGH,
      submittedAt: daysAgo(7),
      currentApproverRole: Role.PROCUREMENT,
    },
  ];

  const requests = [];
  for (const spec of reqSpecs) {
    requests.push(await prisma.purchaseRequisition.create({
      data: {
        requisitionNumber: `PR-2026-${String(spec.n).padStart(4, "0")}`,
        title: spec.title,
        description: spec.description,
        quantity: spec.quantity,
        unit: spec.unit,
        requesterId: user["requester@tsc.demo"].id,
        departmentId: spec.departmentId,
        projectId: spec.projectId,
        budgetLineId: spec.budgetLineId,
        amount: spec.amount,
        currency: "USD",
        procurementType: spec.procurementType,
        justification: spec.description,
        status: spec.status,
        priority: spec.priority,
        currentApproverRole: spec.currentApproverRole,
        submittedAt: spec.submittedAt,
        expectedDeliveryDate: daysFromNow(14),
        createdAt: dayBefore(spec.submittedAt, 1),
      },
    }));
  }

  await prisma.approval.create({
    data: {
      requisitionId: requests[1].id,
      approverId: user["approver@tsc.demo"].id,
      approverRole: Role.APPROVER,
      decision: ApprovalDecision.RETURNED,
      comment: "Merci d'ajouter la justification et le budget détaillé.",
      oldStatus: RequisitionStatus.HIERARCHICAL_REVIEW,
      newStatus: RequisitionStatus.RETURNED_FOR_REVISION,
      decidedAt: daysAgo(3),
    },
  });

  for (const index of [3, 4, 5]) {
    await prisma.approval.create({
      data: {
        requisitionId: requests[index].id,
        approverId: user["approver@tsc.demo"].id,
        approverRole: Role.APPROVER,
        decision: ApprovalDecision.APPROVED,
        comment: "Validation hiérarchique par seuil.",
        oldStatus: RequisitionStatus.HIERARCHICAL_REVIEW,
        newStatus: RequisitionStatus.PROCUREMENT_REVIEW,
        decidedAt: daysAgo(2),
      },
    });
  }

  for (const index of [4, 5]) {
    await prisma.approval.create({
      data: {
        requisitionId: requests[index].id,
        approverId: user["procurement@tsc.demo"].id,
        approverRole: Role.PROCUREMENT,
        decision: ApprovalDecision.APPROVED,
        comment: "Méthode d'achat validée et offres analysées.",
        oldStatus: RequisitionStatus.PROCUREMENT_REVIEW,
        newStatus: index === 4 ? RequisitionStatus.THRESHOLD_REVIEW : RequisitionStatus.PO_CREATED,
        decidedAt: daysAgo(1),
      },
    });
  }

  await prisma.quote.create({
    data: {
      requisitionId: requests[5].id,
      supplierId: supplier["CongoTech SARL"].id,
      amount: 8400,
      currency: "USD",
      leadTimeDays: 12,
      paymentTerms: "30 days",
      technicalScore: 92,
      isWinner: true,
      notes: "Best evaluated offer.",
    },
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-0001",
      requisitionId: requests[5].id,
      supplierId: supplier["CongoTech SARL"].id,
      amount: 8400,
      currency: "USD",
      status: POStatus.ISSUED,
      issuedAt: daysAgo(1),
    },
  });

  await prisma.document.create({
    data: {
      requisitionId: requests[3].id,
      fileName: "justification-impression.pdf",
      fileType: "application/pdf",
      fileSize: 128000,
      fileUrl: "/placeholder/justification-impression.pdf",
      uploadedById: user["requester@tsc.demo"].id,
      documentCategory: DocumentCategory.JUSTIFICATION,
    },
  });

  const auditRows = [
    ...requests.map((request) => ({
      actorId: user["requester@tsc.demo"].id,
      actorRole: Role.REQUESTER,
      action: "REQUISITION_CREATED",
      entityType: "PurchaseRequisition",
      entityId: request.id,
      oldValue: null,
      newValue: request.requisitionNumber,
      comment: "Clean workspace seed record.",
    })),
    {
      actorId: user["procurement@tsc.demo"].id,
      actorRole: Role.PROCUREMENT,
      action: "PO_CREATED",
      entityType: "PurchaseOrder",
      entityId: po.id,
      oldValue: null,
      newValue: po.poNumber,
      comment: "Supplier awarded and order issued.",
    },
  ];

  for (const row of auditRows) {
    await prisma.auditLog.create({ data: { ...row, timestamp: daysAgo(1), ipAddress: "10.0.0.42" } });
  }

  await Promise.all(
    [
      ["threshold.tier1.maxAmountUSD", "1000"],
      ["threshold.tier2.maxAmountUSD", "10000"],
      ["sla.hierarchicalReviewDays", "2"],
      ["sla.procurementReviewDays", "3"],
      ["sla.thresholdReviewDays", "2"],
      [
        "procurementTypes.enabled",
        "DIRECT_PURCHASE,PREQUALIFIED_SUPPLIER,QUOTATION,TENDER,SOLE_SOURCE",
      ],
    ].map(([id, value]) => prisma.setting.create({ data: { id, value } })),
  );

  console.log("Seeded clean 8-workspace demo data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
