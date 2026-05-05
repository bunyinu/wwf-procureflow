import { PrismaClient } from "@prisma/client";
import {
  Role,
  RequisitionStatus,
  Priority,
  ProcurementType,
  ApprovalDecision,
  SupplierStatus,
  DueDiligenceStatus,
  POStatus,
  ReceiptType,
  DocumentCategory,
} from "../src/lib/enums";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
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
      { name: "Reporting", code: "RPT" },
      { name: "Programmes", code: "PRG" },
      { name: "Logistique", code: "LOG" },
    ].map((d) => prisma.department.create({ data: d })),
  );
  const deptByCode = Object.fromEntries(departments.map((d) => [d.code, d]));

  // 8 process-module roles per TDR §4
  const usersInput = [
    {
      fullName: "Christine Mbala",
      email: "requester@tsc.demo",
      role: Role.REQUESTER,
      departmentId: deptByCode.PRG.id,
    },
    {
      fullName: "Joseph Kabasele",
      email: "approver@tsc.demo",
      role: Role.APPROVER,
      departmentId: deptByCode.PRG.id,
    },
    {
      fullName: "Aline Tshibanda",
      email: "procurement@tsc.demo",
      role: Role.PROCUREMENT,
      departmentId: deptByCode.LOG.id,
    },
    {
      fullName: "Patrick Lumumba",
      email: "supplier@tsc.demo",
      role: Role.SUPPLIER_MANAGER,
      departmentId: deptByCode.LOG.id,
    },
    {
      fullName: "Marie Tshilanda",
      email: "receiver@tsc.demo",
      role: Role.RECEIVER,
      departmentId: deptByCode.LOG.id,
    },
    {
      fullName: "Esther Kasongo",
      email: "audit@tsc.demo",
      role: Role.AUDITOR,
      departmentId: deptByCode.ADM.id,
    },
    {
      fullName: "Léon Mwanza",
      email: "reporting@tsc.demo",
      role: Role.REPORTING,
      departmentId: deptByCode.RPT.id,
    },
    {
      fullName: "Daniel Mukendi",
      email: "admin@tsc.demo",
      role: Role.ADMIN,
      departmentId: deptByCode.ADM.id,
    },
  ];
  const users = await Promise.all(
    usersInput.map((u) =>
      prisma.user.create({
        data: { ...u, password: "demo123", active: true },
      }),
    ),
  );
  const userByEmail = Object.fromEntries(users.map((u) => [u.email, u]));

  await prisma.department.update({
    where: { id: deptByCode.PRG.id },
    data: { managerUserId: userByEmail["approver@tsc.demo"].id },
  });
  await prisma.department.update({
    where: { id: deptByCode.LOG.id },
    data: { managerUserId: userByEmail["approver@tsc.demo"].id },
  });

  const projects = await Promise.all(
    [
      {
        name: "OD 40001336 — Conservation",
        projectCode: "OD-40001336",
        donor: "WWF International",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2026-12-31"),
      },
      {
        name: "OD 403725 — Support institutionnel",
        projectCode: "OD-403725",
        donor: "WWF Suède",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2027-12-31"),
      },
      {
        name: "Programme Forêts RDC",
        projectCode: "FOR-RDC",
        donor: "Union Européenne",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2028-05-31"),
      },
    ].map((p) => prisma.project.create({ data: p })),
  );
  const projByCode = Object.fromEntries(projects.map((p) => [p.projectCode, p]));

  const budgetLinesData = [
    {
      projectCode: "OD-40001336",
      code: "BL-CONS-EQ",
      label: "Équipements terrain — Conservation",
      allocatedBudget: 75000,
      committedAmount: 12000,
      spentAmount: 8500,
    },
    {
      projectCode: "OD-40001336",
      code: "BL-CONS-MIS",
      label: "Missions terrain — Conservation",
      allocatedBudget: 40000,
      committedAmount: 6000,
      spentAmount: 4200,
    },
    {
      projectCode: "OD-403725",
      code: "BL-SI-IT",
      label: "Informatique — Support institutionnel",
      allocatedBudget: 60000,
      committedAmount: 15000,
      spentAmount: 9300,
    },
    {
      projectCode: "OD-403725",
      code: "BL-SI-FRM",
      label: "Formation du personnel",
      allocatedBudget: 30000,
      committedAmount: 5000,
      spentAmount: 1200,
    },
    {
      projectCode: "FOR-RDC",
      code: "BL-FOR-COM",
      label: "Communication communautaire",
      allocatedBudget: 50000,
      committedAmount: 8000,
      spentAmount: 3500,
    },
    {
      projectCode: "FOR-RDC",
      code: "BL-FOR-LOG",
      label: "Logistique provinciale",
      allocatedBudget: 90000,
      committedAmount: 25000,
      spentAmount: 18000,
    },
  ];
  const budgetLines = await Promise.all(
    budgetLinesData.map((b) =>
      prisma.budgetLine.create({
        data: {
          projectId: projByCode[b.projectCode].id,
          code: b.code,
          label: b.label,
          allocatedBudget: b.allocatedBudget,
          committedAmount: b.committedAmount,
          spentAmount: b.spentAmount,
          currency: "USD",
        },
      }),
    ),
  );
  const blByCode = Object.fromEntries(budgetLines.map((b) => [b.code, b]));

  const suppliersData = [
    {
      companyName: "CongoTech Solutions SARL",
      taxId: "A0701234X",
      contactName: "Béatrice Ilunga",
      email: "contact@congotech.cd",
      phone: "+243 81 000 11 22",
      address: "12 Avenue de la Justice, Kinshasa",
      status: SupplierStatus.PREQUALIFIED,
      dueDiligenceStatus: DueDiligenceStatus.CLEARED,
      score: 88,
    },
    {
      companyName: "Imprimerie Saint-Paul",
      taxId: "A0712205Y",
      contactName: "Olivier Mbuyi",
      email: "ventes@stpaul.cd",
      phone: "+243 99 123 45 67",
      address: "Boulevard du 30 juin, Kinshasa",
      status: SupplierStatus.PREQUALIFIED,
      dueDiligenceStatus: DueDiligenceStatus.CLEARED,
      score: 81,
    },
    {
      companyName: "MotorPlus Locations",
      taxId: "A0734441Z",
      contactName: "Hortense Kabwe",
      email: "loc@motorplus.cd",
      phone: "+243 82 222 33 44",
      address: "Avenue Lumumba, Lubumbashi",
      status: SupplierStatus.PREQUALIFIED,
      dueDiligenceStatus: DueDiligenceStatus.CLEARED,
      score: 76,
    },
    {
      companyName: "Réseau & Câbles RDC",
      taxId: "A0700912W",
      contactName: "Joël Tshilombo",
      email: "info@reseaucables.cd",
      phone: "+243 81 555 66 77",
      address: "Gombe, Kinshasa",
      status: SupplierStatus.PENDING,
      dueDiligenceStatus: DueDiligenceStatus.IN_REVIEW,
      score: 55,
    },
    {
      companyName: "EnerGen Maintenance",
      taxId: "A0741120Q",
      contactName: "Patricia Ngoy",
      email: "service@energen.cd",
      phone: "+243 90 111 22 33",
      address: "Limete, Kinshasa",
      status: SupplierStatus.PREQUALIFIED,
      dueDiligenceStatus: DueDiligenceStatus.CLEARED,
      score: 84,
    },
    {
      companyName: "GeoTrack Africa",
      taxId: "A0790000K",
      contactName: "Emmanuel Mwamba",
      email: "sales@geotrack.africa",
      phone: "+254 700 000 000",
      address: "Nairobi, Kenya",
      status: SupplierStatus.PENDING,
      dueDiligenceStatus: DueDiligenceStatus.IN_REVIEW,
      score: 60,
    },
    {
      companyName: "FibreNet Telecom",
      taxId: "A0729911H",
      contactName: "Clarisse Bonyeme",
      email: "contracts@fibrenet.cd",
      phone: "+243 81 777 88 99",
      address: "Kintambo, Kinshasa",
      status: SupplierStatus.PREQUALIFIED,
      dueDiligenceStatus: DueDiligenceStatus.CLEARED,
      score: 79,
    },
    {
      companyName: "SecureLearn Académie",
      taxId: "A0732200V",
      contactName: "Romain Kasereka",
      email: "formation@securelearn.cd",
      phone: "+243 99 333 44 55",
      address: "Goma, Nord-Kivu",
      status: SupplierStatus.SUSPENDED,
      dueDiligenceStatus: DueDiligenceStatus.FAILED,
      score: 32,
    },
  ];
  const suppliers = await Promise.all(
    suppliersData.map((s) =>
      prisma.supplier.create({
        data: {
          ...s,
          // Mark prequalified, cleared suppliers as having signed Annexe B.
          antiCorruptionSignedAt:
            s.status === SupplierStatus.PREQUALIFIED &&
            s.dueDiligenceStatus === DueDiligenceStatus.CLEARED
              ? daysAgo(60)
              : null,
        },
      }),
    ),
  );
  const supplierByName = Object.fromEntries(suppliers.map((s) => [s.companyName, s]));

  type Req = {
    title: string;
    requesterEmail: string;
    deptCode: string;
    projectCode: string;
    budgetLineCode: string;
    amount: number;
    quantity?: number;
    unit?: string;
    type: string;
    priority: string;
    status: string;
    daysAgoCreated: number;
    expectedDeliveryDays?: number;
    justification: string;
    currentApproverRole?: string | null;
  };
  const reqs: Req[] = [
    {
      title: "Achat ordinateurs portables pour équipe terrain",
      requesterEmail: "requester@tsc.demo",
      deptCode: "PRG",
      projectCode: "OD-403725",
      budgetLineCode: "BL-SI-IT",
      amount: 8400,
      type: ProcurementType.QUOTATION,
      priority: Priority.HIGH,
      status: RequisitionStatus.HIERARCHICAL_REVIEW,
      daysAgoCreated: 2,
      expectedDeliveryDays: 21,
      justification:
        "Renouvellement de 6 postes de travail pour l'équipe Programmes — équipements vétustes hors garantie.",
      currentApproverRole: Role.APPROVER,
    },
    {
      title: "Impression supports de sensibilisation communautaire",
      requesterEmail: "requester@tsc.demo",
      deptCode: "PRG",
      projectCode: "FOR-RDC",
      budgetLineCode: "BL-FOR-COM",
      amount: 1850,
      type: ProcurementType.DIRECT_PURCHASE,
      priority: Priority.NORMAL,
      status: RequisitionStatus.PROCUREMENT_REVIEW,
      daysAgoCreated: 5,
      expectedDeliveryDays: 14,
      justification:
        "Production de 3000 brochures et 200 affiches pour la campagne de sensibilisation forêts.",
      currentApproverRole: Role.PROCUREMENT,
    },
    {
      title: "Location véhicule mission terrain Mbandaka",
      requesterEmail: "requester@tsc.demo",
      deptCode: "LOG",
      projectCode: "OD-40001336",
      budgetLineCode: "BL-CONS-MIS",
      amount: 3200,
      type: ProcurementType.PREQUALIFIED_SUPPLIER,
      priority: Priority.URGENT,
      status: RequisitionStatus.THRESHOLD_REVIEW,
      daysAgoCreated: 7,
      expectedDeliveryDays: 5,
      justification:
        "Location 4x4 + chauffeur pour mission de suivi écologique de 14 jours en Équateur.",
      currentApproverRole: Role.APPROVER,
    },
    {
      title: "Fourniture équipements réseau bureau Kinshasa",
      requesterEmail: "requester@tsc.demo",
      deptCode: "ADM",
      projectCode: "OD-403725",
      budgetLineCode: "BL-SI-IT",
      amount: 12500,
      type: ProcurementType.TENDER,
      priority: Priority.NORMAL,
      status: RequisitionStatus.PO_CREATED,
      daysAgoCreated: 18,
      expectedDeliveryDays: 30,
      justification:
        "Mise à niveau switches, points d'accès Wi-Fi et câblage suite à l'aménagement du nouveau plateau.",
    },
    {
      title: "Prestation maintenance groupe électrogène",
      requesterEmail: "requester@tsc.demo",
      deptCode: "LOG",
      projectCode: "OD-403725",
      budgetLineCode: "BL-SI-IT",
      amount: 2400,
      type: ProcurementType.DIRECT_PURCHASE,
      priority: Priority.NORMAL,
      status: RequisitionStatus.RECEIVED,
      daysAgoCreated: 28,
      justification:
        "Maintenance préventive trimestrielle du groupe électrogène 60 kVA du bureau central.",
    },
    {
      title: "Achat GPS et tablettes de collecte",
      requesterEmail: "requester@tsc.demo",
      deptCode: "PRG",
      projectCode: "OD-40001336",
      budgetLineCode: "BL-CONS-EQ",
      amount: 14800,
      type: ProcurementType.QUOTATION,
      priority: Priority.HIGH,
      status: RequisitionStatus.SUBMITTED,
      daysAgoCreated: 1,
      expectedDeliveryDays: 35,
      justification:
        "Équipement de collecte de données géoréférencées pour 8 brigades anti-braconnage.",
      currentApproverRole: Role.APPROVER,
    },
    {
      title: "Services internet bureau provincial Goma",
      requesterEmail: "requester@tsc.demo",
      deptCode: "ADM",
      projectCode: "OD-403725",
      budgetLineCode: "BL-SI-IT",
      amount: 4200,
      type: ProcurementType.SOLE_SOURCE,
      priority: Priority.HIGH,
      status: RequisitionStatus.HIERARCHICAL_REVIEW,
      daysAgoCreated: 3,
      expectedDeliveryDays: 10,
      justification:
        "Souscription liaison fibre dédiée 20 Mbps — fournisseur unique opérant à Goma.",
      currentApproverRole: Role.APPROVER,
    },
    {
      title: "Formation sécurité informatique du personnel",
      requesterEmail: "requester@tsc.demo",
      deptCode: "ADM",
      projectCode: "OD-403725",
      budgetLineCode: "BL-SI-FRM",
      amount: 6800,
      type: ProcurementType.QUOTATION,
      priority: Priority.NORMAL,
      status: RequisitionStatus.RETURNED_FOR_REVISION,
      daysAgoCreated: 9,
      expectedDeliveryDays: 45,
      justification:
        "Programme de formation cyber-hygiène sur 3 sessions pour 40 collaborateurs.",
      currentApproverRole: null,
    },
    {
      title: "Achat fournitures de bureau trimestrielles",
      requesterEmail: "requester@tsc.demo",
      deptCode: "ADM",
      projectCode: "OD-403725",
      budgetLineCode: "BL-SI-IT",
      amount: 720,
      type: ProcurementType.DIRECT_PURCHASE,
      priority: Priority.LOW,
      status: RequisitionStatus.DRAFT,
      daysAgoCreated: 0,
      justification: "Réapprovisionnement papeterie, consommables et toners.",
    },
    {
      title: "Réhabilitation antenne radio brigade Salonga",
      requesterEmail: "requester@tsc.demo",
      deptCode: "PRG",
      projectCode: "OD-40001336",
      budgetLineCode: "BL-CONS-EQ",
      amount: 9700,
      type: ProcurementType.QUOTATION,
      priority: Priority.HIGH,
      status: RequisitionStatus.CLOSED,
      daysAgoCreated: 60,
      justification:
        "Remplacement mât et émetteur radio communication brigades anti-braconnage.",
    },
    {
      title: "Audit énergétique bureau Kinshasa",
      requesterEmail: "requester@tsc.demo",
      deptCode: "ADM",
      projectCode: "OD-403725",
      budgetLineCode: "BL-SI-IT",
      amount: 4500,
      type: ProcurementType.QUOTATION,
      priority: Priority.NORMAL,
      status: RequisitionStatus.REJECTED,
      daysAgoCreated: 14,
      justification:
        "Mission d'audit énergétique pour optimiser la consommation et les coûts d'exploitation.",
    },
    {
      title: "Carburant générateurs sites provinciaux",
      requesterEmail: "requester@tsc.demo",
      deptCode: "LOG",
      projectCode: "FOR-RDC",
      budgetLineCode: "BL-FOR-LOG",
      amount: 5400,
      type: ProcurementType.DIRECT_PURCHASE,
      priority: Priority.URGENT,
      status: RequisitionStatus.PROCUREMENT_REVIEW,
      daysAgoCreated: 4,
      expectedDeliveryDays: 7,
      justification:
        "Approvisionnement mensuel en carburant pour 4 sites provinciaux non raccordés au réseau.",
      currentApproverRole: Role.PROCUREMENT,
    },
    {
      title: "Acquisition kits sanitaires brigades",
      requesterEmail: "requester@tsc.demo",
      deptCode: "PRG",
      projectCode: "OD-40001336",
      budgetLineCode: "BL-CONS-EQ",
      amount: 2100,
      type: ProcurementType.DIRECT_PURCHASE,
      priority: Priority.NORMAL,
      status: RequisitionStatus.HIERARCHICAL_REVIEW,
      daysAgoCreated: 6,
      expectedDeliveryDays: 21,
      justification:
        "Trousses de premiers soins et purificateurs d'eau portables pour 12 brigades.",
      currentApproverRole: Role.APPROVER,
    },
    {
      title: "Mission audit interne — annulée",
      requesterEmail: "requester@tsc.demo",
      deptCode: "ADM",
      projectCode: "OD-403725",
      budgetLineCode: "BL-SI-FRM",
      amount: 3300,
      type: ProcurementType.DIRECT_PURCHASE,
      priority: Priority.LOW,
      status: RequisitionStatus.CANCELLED,
      daysAgoCreated: 22,
      justification: "Mission d'audit interne reportée à l'exercice suivant.",
    },
    {
      title: "Achat tentes terrain équipes mobiles",
      requesterEmail: "requester@tsc.demo",
      deptCode: "PRG",
      projectCode: "FOR-RDC",
      budgetLineCode: "BL-FOR-LOG",
      amount: 6300,
      type: ProcurementType.QUOTATION,
      priority: Priority.NORMAL,
      status: RequisitionStatus.THRESHOLD_REVIEW,
      daysAgoCreated: 8,
      expectedDeliveryDays: 30,
      justification:
        "Acquisition de 15 tentes 4 places et matelas pour les missions longue durée.",
      currentApproverRole: Role.APPROVER,
    },
  ];

  // TDR §4.1 — quantité explicite. Realistic defaults per requisition title.
  const QUANTITY_BY_TITLE: Record<string, { quantity: number; unit: string }> = {
    "Achat ordinateurs portables pour équipe terrain": { quantity: 6, unit: "unité" },
    "Impression supports de sensibilisation communautaire": { quantity: 3200, unit: "exemplaire" },
    "Location véhicule mission terrain Mbandaka": { quantity: 14, unit: "jour" },
    "Fourniture équipements réseau bureau Kinshasa": { quantity: 1, unit: "lot" },
    "Prestation maintenance groupe électrogène": { quantity: 1, unit: "trimestre" },
    "Achat GPS et tablettes de collecte": { quantity: 8, unit: "kit" },
    "Services internet bureau provincial Goma": { quantity: 12, unit: "mois" },
    "Formation sécurité informatique du personnel": { quantity: 40, unit: "participant" },
    "Achat fournitures de bureau trimestrielles": { quantity: 1, unit: "lot" },
    "Réhabilitation antenne radio brigade Salonga": { quantity: 1, unit: "lot" },
    "Audit énergétique bureau Kinshasa": { quantity: 1, unit: "mission" },
    "Carburant générateurs sites provinciaux": { quantity: 4000, unit: "litre" },
    "Acquisition kits sanitaires brigades": { quantity: 12, unit: "kit" },
    "Mission audit interne — annulée": { quantity: 1, unit: "mission" },
    "Achat tentes terrain équipes mobiles": { quantity: 15, unit: "unité" },
  };

  const reqRecords: Awaited<ReturnType<typeof prisma.purchaseRequisition.create>>[] = [];
  for (let i = 0; i < reqs.length; i++) {
    const r = reqs[i];
    const reqNum = `PR-2026-${String(i + 1).padStart(4, "0")}`;
    const created = daysAgo(r.daysAgoCreated);
    const submittedAt = r.status === RequisitionStatus.DRAFT ? null : created;
    const qm = QUANTITY_BY_TITLE[r.title] ?? { quantity: 1, unit: "lot" };
    const created_db = await prisma.purchaseRequisition.create({
      data: {
        requisitionNumber: reqNum,
        title: r.title,
        description: r.justification,
        quantity: qm.quantity,
        unit: qm.unit,
        requesterId: userByEmail[r.requesterEmail].id,
        departmentId: deptByCode[r.deptCode].id,
        projectId: projByCode[r.projectCode].id,
        budgetLineId: blByCode[r.budgetLineCode].id,
        amount: r.amount,
        currency: "USD",
        procurementType: r.type,
        justification: r.justification,
        status: r.status,
        priority: r.priority,
        currentApproverRole: r.currentApproverRole ?? null,
        submittedAt,
        expectedDeliveryDate: r.expectedDeliveryDays
          ? daysFromNow(r.expectedDeliveryDays)
          : null,
        createdAt: created,
      },
    });
    reqRecords.push(created_db);
  }

  const approvalsData = [
    {
      reqIdx: 1,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.APPROVED,
      comment: "Approbation hiérarchique — campagne validée.",
      oldStatus: RequisitionStatus.HIERARCHICAL_REVIEW,
      newStatus: RequisitionStatus.PROCUREMENT_REVIEW,
    },
    {
      reqIdx: 2,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.APPROVED,
      comment: "Mission prioritaire validée.",
      oldStatus: RequisitionStatus.HIERARCHICAL_REVIEW,
      newStatus: RequisitionStatus.PROCUREMENT_REVIEW,
    },
    {
      reqIdx: 2,
      approverEmail: "procurement@tsc.demo",
      role: Role.PROCUREMENT,
      decision: ApprovalDecision.APPROVED,
      comment: "Fournisseur préqualifié retenu (MotorPlus).",
      oldStatus: RequisitionStatus.PROCUREMENT_REVIEW,
      newStatus: RequisitionStatus.THRESHOLD_REVIEW,
    },
    {
      reqIdx: 3,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.APPROVED,
      comment: "Conforme au plan de mise à niveau.",
      oldStatus: RequisitionStatus.HIERARCHICAL_REVIEW,
      newStatus: RequisitionStatus.PROCUREMENT_REVIEW,
    },
    {
      reqIdx: 3,
      approverEmail: "procurement@tsc.demo",
      role: Role.PROCUREMENT,
      decision: ApprovalDecision.APPROVED,
      comment: "Appel d'offres clos, attribution Réseau & Câbles RDC.",
      oldStatus: RequisitionStatus.PROCUREMENT_REVIEW,
      newStatus: RequisitionStatus.THRESHOLD_REVIEW,
    },
    {
      reqIdx: 3,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.APPROVED,
      comment: "Budget BL-SI-IT confirmé, engagement validé.",
      oldStatus: RequisitionStatus.THRESHOLD_REVIEW,
      newStatus: RequisitionStatus.PO_CREATED,
    },
    {
      reqIdx: 4,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.APPROVED,
      comment: "Maintenance trimestrielle régulière.",
      oldStatus: RequisitionStatus.HIERARCHICAL_REVIEW,
      newStatus: RequisitionStatus.PROCUREMENT_REVIEW,
    },
    {
      reqIdx: 4,
      approverEmail: "procurement@tsc.demo",
      role: Role.PROCUREMENT,
      decision: ApprovalDecision.APPROVED,
      comment: "Contrat-cadre EnerGen activé.",
      oldStatus: RequisitionStatus.PROCUREMENT_REVIEW,
      newStatus: RequisitionStatus.THRESHOLD_REVIEW,
    },
    {
      reqIdx: 4,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.APPROVED,
      comment: "Engagement budgétaire confirmé.",
      oldStatus: RequisitionStatus.THRESHOLD_REVIEW,
      newStatus: RequisitionStatus.PO_CREATED,
    },
    {
      reqIdx: 7,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.RETURNED,
      comment:
        "Joindre 3 devis comparatifs et préciser les modules avant resoumission.",
      oldStatus: RequisitionStatus.HIERARCHICAL_REVIEW,
      newStatus: RequisitionStatus.RETURNED_FOR_REVISION,
    },
    {
      reqIdx: 9,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.APPROVED,
      comment: "Approuvé pour exécution immédiate.",
      oldStatus: RequisitionStatus.HIERARCHICAL_REVIEW,
      newStatus: RequisitionStatus.PROCUREMENT_REVIEW,
    },
    {
      reqIdx: 9,
      approverEmail: "procurement@tsc.demo",
      role: Role.PROCUREMENT,
      decision: ApprovalDecision.APPROVED,
      comment: "Contrat attribué.",
      oldStatus: RequisitionStatus.PROCUREMENT_REVIEW,
      newStatus: RequisitionStatus.THRESHOLD_REVIEW,
    },
    {
      reqIdx: 9,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.APPROVED,
      comment: "Engagement et paiement effectués.",
      oldStatus: RequisitionStatus.THRESHOLD_REVIEW,
      newStatus: RequisitionStatus.PO_CREATED,
    },
    {
      reqIdx: 10,
      approverEmail: "approver@tsc.demo",
      role: Role.APPROVER,
      decision: ApprovalDecision.REJECTED,
      comment:
        "Justification budgétaire insuffisante, demande à reformuler avec ROI estimé.",
      oldStatus: RequisitionStatus.THRESHOLD_REVIEW,
      newStatus: RequisitionStatus.REJECTED,
    },
  ];
  for (const a of approvalsData) {
    await prisma.approval.create({
      data: {
        requisitionId: reqRecords[a.reqIdx].id,
        approverId: userByEmail[a.approverEmail].id,
        approverRole: a.role,
        decision: a.decision,
        comment: a.comment,
        oldStatus: a.oldStatus,
        newStatus: a.newStatus,
      },
    });
  }

  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-0001",
      requisitionId: reqRecords[3].id,
      supplierId: supplierByName["Réseau & Câbles RDC"].id,
      amount: 12500,
      currency: "USD",
      status: POStatus.ISSUED,
      issuedAt: daysAgo(15),
    },
  });
  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-0002",
      requisitionId: reqRecords[4].id,
      supplierId: supplierByName["EnerGen Maintenance"].id,
      amount: 2400,
      currency: "USD",
      status: POStatus.RECEIVED,
      issuedAt: daysAgo(20),
    },
  });
  const po3 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-0003",
      requisitionId: reqRecords[9].id,
      supplierId: supplierByName["CongoTech Solutions SARL"].id,
      amount: 9700,
      currency: "USD",
      status: POStatus.RECEIVED,
      issuedAt: daysAgo(45),
    },
  });

  await prisma.goodsReceipt.create({
    data: {
      requisitionId: reqRecords[4].id,
      purchaseOrderId: po2.id,
      receivedById: userByEmail["receiver@tsc.demo"].id,
      receiptType: ReceiptType.SAN,
      receivedDate: daysAgo(10),
      notes: "Maintenance réalisée conformément au contrat-cadre.",
      discrepancyFlag: false,
    },
  });
  await prisma.goodsReceipt.create({
    data: {
      requisitionId: reqRecords[9].id,
      purchaseOrderId: po3.id,
      receivedById: userByEmail["receiver@tsc.demo"].id,
      receiptType: ReceiptType.GRN,
      receivedDate: daysAgo(30),
      notes: "Mât et émetteur installés, tests d'émission validés.",
      discrepancyFlag: true,
      discrepancyNotes:
        "Un câble coaxial manquant — livraison complémentaire reçue le lendemain.",
    },
  });

  // ---- Quotes — TDR §4.4 Analyse des offres
  // Three competing offers on req #0 (Achat ordinateurs portables — QUOTATION)
  await prisma.quote.create({
    data: {
      requisitionId: reqRecords[0].id,
      supplierId: supplierByName["CongoTech Solutions SARL"].id,
      amount: 8400,
      currency: "USD",
      leadTimeDays: 21,
      paymentTerms: "30 jours après livraison",
      technicalScore: 88,
      isWinner: true,
      notes: "Offre la mieux-disante : meilleur rapport qualité/prix et garantie 24 mois.",
    },
  });
  await prisma.quote.create({
    data: {
      requisitionId: reqRecords[0].id,
      supplierId: supplierByName["FibreNet Telecom"].id,
      amount: 9100,
      currency: "USD",
      leadTimeDays: 14,
      paymentTerms: "50 % à la commande, solde à la livraison",
      technicalScore: 79,
      notes: "Délai plus court mais coût supérieur de 8 %.",
    },
  });
  await prisma.quote.create({
    data: {
      requisitionId: reqRecords[0].id,
      supplierId: supplierByName["Réseau & Câbles RDC"].id,
      amount: 7950,
      currency: "USD",
      leadTimeDays: 35,
      paymentTerms: "60 jours fin de mois",
      technicalScore: 62,
      notes: "Prix le plus bas mais garantie limitée à 12 mois et délai trop long.",
    },
  });

  // Three competing offers on req #14 (Tentes terrain)
  await prisma.quote.create({
    data: {
      requisitionId: reqRecords[14].id,
      supplierId: supplierByName["Imprimerie Saint-Paul"].id,
      amount: 6800,
      currency: "USD",
      leadTimeDays: 35,
      paymentTerms: "30 jours",
      technicalScore: 72,
    },
  });
  await prisma.quote.create({
    data: {
      requisitionId: reqRecords[14].id,
      supplierId: supplierByName["GeoTrack Africa"].id,
      amount: 6300,
      currency: "USD",
      leadTimeDays: 28,
      paymentTerms: "À la livraison",
      technicalScore: 81,
      isWinner: true,
      notes: "Spécifications techniques validées par l'équipe terrain.",
    },
  });
  await prisma.quote.create({
    data: {
      requisitionId: reqRecords[14].id,
      supplierId: supplierByName["MotorPlus Locations"].id,
      amount: 7100,
      currency: "USD",
      leadTimeDays: 21,
      paymentTerms: "50 % avance",
      technicalScore: 65,
    },
  });

  await prisma.document.create({
    data: {
      requisitionId: reqRecords[0].id,
      fileName: "devis_ordinateurs_congotech.pdf",
      fileType: "application/pdf",
      fileSize: 184_320,
      fileUrl: "/placeholder/devis_ordinateurs_congotech.pdf",
      uploadedById: userByEmail["requester@tsc.demo"].id,
      documentCategory: DocumentCategory.QUOTATION,
    },
  });
  await prisma.document.create({
    data: {
      requisitionId: reqRecords[3].id,
      fileName: "contrat_reseau_kinshasa.pdf",
      fileType: "application/pdf",
      fileSize: 412_900,
      fileUrl: "/placeholder/contrat_reseau_kinshasa.pdf",
      uploadedById: userByEmail["procurement@tsc.demo"].id,
      documentCategory: DocumentCategory.CONTRACT,
    },
  });

  const audits: Array<{
    actorEmail: string;
    role: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: string;
    newValue?: string;
    comment?: string;
    daysAgo: number;
  }> = [];
  reqRecords.forEach((r, idx) => {
    audits.push({
      actorEmail: "requester@tsc.demo",
      role: Role.REQUESTER,
      action: "REQUISITION_CREATED",
      entityType: "PurchaseRequisition",
      entityId: r.id,
      newValue: r.requisitionNumber,
      comment: `Création de la réquisition ${r.requisitionNumber}`,
      daysAgo: reqs[idx].daysAgoCreated,
    });
  });
  approvalsData.forEach((a) => {
    audits.push({
      actorEmail: a.approverEmail,
      role: a.role,
      action:
        a.decision === ApprovalDecision.APPROVED
          ? "APPROVAL_APPROVED"
          : a.decision === ApprovalDecision.REJECTED
            ? "APPROVAL_REJECTED"
            : "APPROVAL_RETURNED",
      entityType: "PurchaseRequisition",
      entityId: reqRecords[a.reqIdx].id,
      oldValue: a.oldStatus,
      newValue: a.newStatus,
      comment: a.comment,
      daysAgo: 1,
    });
  });
  audits.push({
    actorEmail: "procurement@tsc.demo",
    role: Role.PROCUREMENT,
    action: "PO_CREATED",
    entityType: "PurchaseOrder",
    entityId: po1.id,
    newValue: po1.poNumber,
    daysAgo: 15,
  });
  audits.push({
    actorEmail: "procurement@tsc.demo",
    role: Role.PROCUREMENT,
    action: "PO_CREATED",
    entityType: "PurchaseOrder",
    entityId: po2.id,
    newValue: po2.poNumber,
    daysAgo: 20,
  });
  audits.push({
    actorEmail: "procurement@tsc.demo",
    role: Role.PROCUREMENT,
    action: "PO_CREATED",
    entityType: "PurchaseOrder",
    entityId: po3.id,
    newValue: po3.poNumber,
    daysAgo: 45,
  });
  audits.push({
    actorEmail: "receiver@tsc.demo",
    role: Role.RECEIVER,
    action: "RECEIPT_CREATED",
    entityType: "GoodsReceipt",
    entityId: po2.id,
    newValue: "SAN",
    comment: "Acceptation de service consignée.",
    daysAgo: 10,
  });
  audits.push({
    actorEmail: "receiver@tsc.demo",
    role: Role.RECEIVER,
    action: "RECEIPT_CREATED",
    entityType: "GoodsReceipt",
    entityId: po3.id,
    newValue: "GRN",
    comment: "Réception biens avec écart documenté.",
    daysAgo: 30,
  });

  const trimmed = audits.slice(0, 30);
  for (const a of trimmed) {
    await prisma.auditLog.create({
      data: {
        actorId: userByEmail[a.actorEmail].id,
        actorRole: a.role,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        oldValue: a.oldValue ?? null,
        newValue: a.newValue ?? null,
        comment: a.comment ?? null,
        ipAddress: "10.0.0.42",
        timestamp: daysAgo(a.daysAgo),
      },
    });
  }

  const settings: Array<[string, string]> = [
    ["threshold.tier1.maxAmountUSD", "1000"],
    ["threshold.tier2.maxAmountUSD", "10000"],
    ["sla.hierarchicalReviewDays", "2"],
    ["sla.procurementReviewDays", "3"],
    ["sla.thresholdReviewDays", "2"],
    [
      "procurementTypes.enabled",
      "DIRECT_PURCHASE,QUOTATION,TENDER,SOLE_SOURCE,PREQUALIFIED_SUPPLIER",
    ],
  ];
  for (const [k, v] of settings) {
    await prisma.setting.create({ data: { id: k, value: v } });
  }

  console.log(
    `Seed terminé : ${users.length} utilisateurs, ${reqRecords.length} réquisitions, ${trimmed.length} événements d'audit.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
