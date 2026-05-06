import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { WorkflowTimeline } from "@/components/WorkflowTimeline";
import { QuoteAnalysis } from "@/components/QuoteAnalysis";
import { SlaPanel } from "@/components/SlaPanel";
import { AttachmentsZone } from "@/components/AttachmentsZone";
import { computeStageTimings } from "@/lib/sla";
import {
  PROCUREMENT_TYPE_LABEL,
  PO_STATUS_BADGE,
  PO_STATUS_LABEL,
  RECEIPT_TYPE_LABEL,
  DOCUMENT_CATEGORY_LABEL,
  type ProcurementType,
  type POStatus,
  type ReceiptType,
  type DocumentCategory,
  type Role,
} from "@/lib/enums";
import {
  approvalTier,
  isValidTransition,
  nextRoleForStatus,
  ROLE_LABELS,
} from "@/lib/workflow";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { can } from "@/lib/permissions";
import { documentCategoriesForRequisitionUpload } from "@/lib/document-permissions";
import { PROCUREMENT_METHODS_FROM_PDF, workspaceHomeForRole } from "@/lib/workspaces";
import {
  cancelRequisitionAction,
  closeRequisitionAction,
  createPOAction,
  createReceiptAction,
  approveDecisionAction,
  rejectDecisionAction,
  returnDecisionAction,
  submitRequisitionAction,
} from "../actions";

export const dynamic = "force-dynamic";

const ALERT_MESSAGES: Record<string, { tone: "warn" | "error"; text: string }> = {
  comment_required: {
    tone: "warn",
    text: "Un commentaire est requis pour cette décision.",
  },
  invalid: {
    tone: "error",
    text: "Cette transition n'est pas autorisée par le workflow.",
  },
  denied: {
    tone: "error",
    text: "Vous n'avez pas les droits pour effectuer cette action.",
  },
  procurement_method_required: {
    tone: "warn",
    text: "La méthode d'achat doit être sélectionnée par l'Officier Achats avant de poursuivre.",
  },
};

export default async function RequisitionDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; invalid?: string; denied?: string };
}) {
  const user = await requireUser();
  const req = await prisma.purchaseRequisition.findUnique({
    where: { id: params.id },
    include: {
      requester: true,
      department: true,
      project: true,
      budgetLine: true,
      approvals: {
        include: { approver: true },
        orderBy: { decidedAt: "asc" },
      },
      purchaseOrders: { include: { supplier: true } },
      receipts: { include: { receivedBy: true, purchaseOrder: true } },
      documents: { include: { uploadedBy: true } },
      quotes: {
        include: { supplier: true },
        orderBy: [{ isWinner: "desc" }, { amount: "asc" }],
      },
    },
  });
  if (!req) notFound();
  const requisitionScope = {
    requisition: { requesterId: req.requesterId, status: req.status },
  };
  if (!can(user, "read", "requisition", requisitionScope)) {
    redirect(`${workspaceHomeForRole(user.role as Role)}?denied=1`);
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "PurchaseRequisition", entityId: req.id },
    include: { actor: true },
    orderBy: { timestamp: "desc" },
  });

  const suppliers = await prisma.supplier.findMany({
    where: { status: "PREQUALIFIED" },
    orderBy: { companyName: "asc" },
  });

  const tier = approvalTier(req.amount);
  const remaining =
    req.budgetLine.allocatedBudget -
    req.budgetLine.committedAmount -
    req.budgetLine.spentAmount;
  const overBudget = req.amount > remaining;

  const isOwner = req.requesterId === user.id;
  const expectedRole = nextRoleForStatus(req.status as never);
  const canDecide =
    expectedRole !== null &&
    user.role === expectedRole &&
    [
      "HIERARCHICAL_REVIEW",
      "PROCUREMENT_REVIEW",
      "THRESHOLD_REVIEW",
    ].includes(req.status);

  const canSubmit =
    isOwner && isValidTransition(req.status as never, "SUBMITTED");
  const canCancel = false;
  const canCreatePO =
    user.role === "PROCUREMENT" &&
    req.status === "PO_CREATED" &&
    req.purchaseOrders.length === 0;
  const canReceive =
    user.role === "RECEIVER" &&
    req.status === "PO_CREATED" &&
    req.purchaseOrders.length > 0;
  const canClose =
    user.role === "PROCUREMENT" && req.status === "RECEIVED";

  if ((searchParams.invalid || searchParams.error === "invalid") && canDecide) {
    redirect(`/requisitions/${req.id}`);
  }

  const alertKey = searchParams.error || (searchParams.invalid ? "invalid" : "") || (searchParams.denied ? "denied" : "");
  const alert = alertKey ? ALERT_MESSAGES[alertKey] : null;
  const isProcurementStep = req.status === "PROCUREMENT_REVIEW";
  const canViewApprovalChain = user.role !== "RECEIVER";
  const uploadCategories = documentCategoriesForRequisitionUpload(user, {
    requesterId: req.requesterId,
    status: req.status,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/requisitions"
            className="text-xs font-medium text-ink-500 hover:text-wwf-700"
          >
            ← Retour aux réquisitions
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
            {req.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-500">
            <span className="font-mono">{req.requisitionNumber}</span>
            <span>·</span>
            <span>{req.requester.fullName}</span>
            <span>·</span>
            <span>Créée le {formatDate(req.createdAt)}</span>
            {req.submittedAt ? (
              <>
                <span>·</span>
                <span>Soumise le {formatDate(req.submittedAt)}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={req.priority} />
          <StatusBadge status={req.status} />
          <Link
            href={`/print/requisition/${req.id}`}
            target="_blank"
            className="lift ml-2 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-soft hover:border-wwf-300"
          >
            Édition PDF
          </Link>
        </div>
      </div>

      {alert ? (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            alert.tone === "error"
              ? "bg-red-50 text-red-700 ring-1 ring-red-200"
              : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
          }`}
        >
          {alert.text}
        </div>
      ) : null}

      {canViewApprovalChain ? (
        <>
          <Card>
            <CardHeader title="Cycle d'approbation" description="Étapes du workflow institutionnel" />
            <CardBody>
              <WorkflowTimeline current={req.status as never} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Suivi des délais par étape"
              description="TDR §4.3 — durée par étape vs SLA, détection automatique des retards"
            />
            <CardBody>
              <SlaPanel
                timings={computeStageTimings({
                  submittedAt: req.submittedAt,
                  createdAt: req.createdAt,
                  status: req.status,
                  approvals: req.approvals.map((a) => ({
                    decidedAt: a.decidedAt,
                    oldStatus: a.oldStatus,
                    newStatus: a.newStatus,
                  })),
                })}
              />
            </CardBody>
          </Card>
        </>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader title="Détail du dossier" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Département" value={req.department.name} />
              <Field
                label="Projet"
                value={`${req.project.projectCode} — ${req.project.name}`}
              />
              <Field
                label="Type de procédure"
                value={
                  PROCUREMENT_TYPE_LABEL[
                    req.procurementType as ProcurementType
                  ]
                }
              />
              <div className="sm:col-span-2">
                <div className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Description
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-800">
                  {req.description ?? "—"}
                </p>
              </div>
              <Field
                label="Date de livraison souhaitée"
                value={formatDate(req.expectedDeliveryDate)}
              />
              <Field
                label="Quantité"
                value={`${req.quantity.toLocaleString("fr-FR")} ${req.unit}${req.quantity > 1 && !req.unit.endsWith("s") ? "s" : ""}`}
              />
              <Field
                label="Montant"
                value={formatCurrency(req.amount, req.currency)}
              />
              <Field
                label="Approbation requise"
                value={
                  <span className="flex flex-wrap gap-1">
                    <Badge className="bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                      Tier {tier.tier} threshold
                    </Badge>
                    <Badge className="bg-purple-50 text-purple-700 ring-1 ring-purple-200">
                      Achats classification
                    </Badge>
                    {tier.needsEnhancedThresholdApproval ? (
                      <Badge className="bg-orange-50 text-orange-700 ring-1 ring-orange-200">
                        Next threshold approval
                      </Badge>
                    ) : null}
                    {tier.needsDirectorFlag ? (
                      <Badge className="bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                        Visa Direction
                      </Badge>
                    ) : null}
                  </span>
                }
              />
              <div className="sm:col-span-2">
                <div className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
                  Justification
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-ink-800">
                  {req.justification}
                </p>
              </div>
            </CardBody>
          </Card>

          {req.quotes.length > 0 ? (
            <QuoteAnalysis quotes={req.quotes} />
          ) : null}

          {canDecide ? (
            <Card>
              <CardHeader
                title={isProcurementStep ? "Validation processus achats" : "Décision requise"}
                description={`Étape : ${ROLE_LABELS[expectedRole!]}`}
              />
              <CardBody>
                <form action={approveDecisionAction} className="space-y-3">
                  <input type="hidden" name="id" value={req.id} />
                  {isProcurementStep ? (
                    <div className="rounded-md border border-purple-100 bg-purple-50/40 p-3">
                      <label className="text-xs font-medium text-ink-700">
                        Méthode d&apos;achat
                      </label>
                      <select
                        name="procurementType"
                        defaultValue={
                          req.procurementType === "UNCLASSIFIED"
                            ? ""
                            : req.procurementType
                        }
                        className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                      >
                        <option value="">Choisir une méthode avant validation</option>
                        {PROCUREMENT_METHODS_FROM_PDF.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-ink-500">
                        La validation Achats enregistre la méthode puis route
                        le dossier vers le seuil renforcé ou le bon de commande.
                      </p>
                    </div>
                  ) : null}
                  <textarea
                    name="comment"
                    rows={3}
                    placeholder="Commentaire — obligatoire en cas de rejet ou de retour pour révision."
                    className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-wwf-500 focus:ring-2 focus:ring-wwf-200"
                  />
                  {req.status === "THRESHOLD_REVIEW" ? (
                    <label className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50/40 px-3 py-2 text-xs text-amber-900">
                      <input
                        type="checkbox"
                        name="budgetException"
                        className="h-4 w-4 rounded border-amber-300 text-amber-600"
                      />
                      Signaler une exception budgétaire (le retour sera marqué
                      « exception » au journal d&apos;audit)
                    </label>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-wwf-800"
                    >
                      {isProcurementStep ? "Valider méthode/processus" : "Approuver"}
                    </button>
                    {req.status === "HIERARCHICAL_REVIEW" ||
                    req.status === "PROCUREMENT_REVIEW" ||
                    req.status === "THRESHOLD_REVIEW" ? (
                      <button
                        type="submit"
                        formAction={returnDecisionAction}
                        className="rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
                      >
                        {req.status === "THRESHOLD_REVIEW"
                          ? "Retourner / Signaler exception"
                          : isProcurementStep
                            ? "Demander correction sourcing"
                            : "Retourner pour révision"}
                      </button>
                    ) : null}
                    <button
                      type="submit"
                      formAction={rejectDecisionAction}
                      className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      {isProcurementStep ? "Bloquer processus" : "Rejeter"}
                    </button>
                  </div>
                </form>
              </CardBody>
            </Card>
          ) : null}

          {canSubmit ? (
            <Card>
              <CardHeader
                title="Soumettre la réquisition"
                description="La réquisition entrera en revue hiérarchique"
              />
              <CardBody>
                <form action={submitRequisitionAction}>
                  <input type="hidden" name="id" value={req.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-wwf-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-wwf-700"
                  >
                    Soumettre pour validation
                  </button>
                </form>
              </CardBody>
            </Card>
          ) : null}

          {canCreatePO ? (
            <Card>
              <CardHeader
                title="Émettre le bon de commande"
                description="Sélection du fournisseur et création du PO"
              />
              <CardBody>
                <form
                  action={createPOAction}
                  className="flex flex-wrap items-end gap-3"
                >
                  <input
                    type="hidden"
                    name="requisitionId"
                    value={req.id}
                  />
                  <div className="grow">
                    <label className="text-xs font-medium text-ink-700">
                      Fournisseur
                    </label>
                    <select
                      name="supplierId"
                      required
                      className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.companyName} (score {s.score})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                  >
                    Émettre le PO
                  </button>
                </form>
              </CardBody>
            </Card>
          ) : null}

          {canReceive ? (
            <Card>
              <CardHeader title="Réception biens / services" />
              <CardBody>
                <form action={createReceiptAction} className="space-y-3">
                  <input
                    type="hidden"
                    name="requisitionId"
                    value={req.id}
                  />
                  <input
                    type="hidden"
                    name="purchaseOrderId"
                    value={req.purchaseOrders[0]!.id}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-ink-700">
                        Type de réception
                      </label>
                      <select
                        name="receiptType"
                        defaultValue="GRN"
                        className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                      >
                        <option value="GRN">Bon de réception (GRN)</option>
                        <option value="SAN">Acceptation service (SAN)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="inline-flex items-center gap-2 text-xs text-ink-700">
                        <input
                          type="checkbox"
                          name="discrepancyFlag"
                          className="h-4 w-4 rounded border-ink-300 text-wwf-600 focus:ring-wwf-500"
                        />
                        Écart constaté
                      </label>
                    </div>
                  </div>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Observations sur la réception"
                    className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                  />
                  <textarea
                    name="discrepancyNotes"
                    rows={2}
                    placeholder="Description des écarts (le cas échéant)"
                    className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
                  >
                    Enregistrer la réception
                  </button>
                </form>
              </CardBody>
            </Card>
          ) : null}

          {canClose ? (
            <Card>
              <CardHeader title="Clôture du dossier" />
              <CardBody>
                <form action={closeRequisitionAction}>
                  <input type="hidden" name="id" value={req.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                  >
                    Clôturer la réquisition
                  </button>
                </form>
              </CardBody>
            </Card>
          ) : null}

          {canViewApprovalChain ? (
            <Card>
              <CardHeader title="Décisions et commentaires" />
              <CardBody>
                {req.approvals.length === 0 ? (
                  <p className="text-sm text-ink-500">
                    Aucune décision n&apos;a encore été enregistrée.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {req.approvals.map((a) => (
                      <li
                        key={a.id}
                        className="rounded-md border border-ink-100 bg-ink-50/40 px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between text-xs text-ink-600">
                          <div>
                            <span className="font-medium text-ink-800">
                              {a.approver.fullName}
                            </span>{" "}
                            ·{" "}
                            {ROLE_LABELS[a.approverRole as keyof typeof ROLE_LABELS]}
                          </div>
                          <span>{formatDateTime(a.decidedAt)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <Badge
                            className={
                              a.decision === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : a.decision === "REJECTED"
                                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                                  : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                            }
                          >
                            {a.decision === "APPROVED"
                              ? "Approuvé"
                              : a.decision === "REJECTED"
                                ? "Rejeté"
                                : "Retourné"}
                          </Badge>
                          <span className="text-ink-700">
                            {a.oldStatus} → {a.newStatus}
                          </span>
                        </div>
                        {a.comment ? (
                          <p className="mt-1 text-sm text-ink-700">{a.comment}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Journal d'audit (extrait)" />
            <CardBody>
              {auditLogs.length === 0 ? (
                <p className="text-sm text-ink-500">Aucun événement.</p>
              ) : (
                <ul className="space-y-2 text-xs">
                  {auditLogs.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-start justify-between gap-3 border-b border-ink-50 pb-2 last:border-none"
                    >
                      <div>
                        <div className="font-medium text-ink-800">
                          {l.action}
                        </div>
                        <div className="text-ink-500">
                          {l.actor?.fullName ?? "Système"} ·{" "}
                          {l.oldValue ? `${l.oldValue} → ` : ""}
                          {l.newValue ?? "—"}
                          {l.comment ? ` — ${l.comment}` : ""}
                        </div>
                      </div>
                      <div className="shrink-0 text-ink-400">
                        {formatDateTime(l.timestamp)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Ligne budgétaire" />
            <CardBody className="space-y-2 text-sm">
              <div>
                <div className="font-mono text-xs text-ink-500">
                  {req.budgetLine.code}
                </div>
                <div className="font-medium text-ink-900">
                  {req.budgetLine.label}
                </div>
              </div>
              <BudgetBar
                allocated={req.budgetLine.allocatedBudget}
                committed={req.budgetLine.committedAmount}
                spent={req.budgetLine.spentAmount}
                currency={req.budgetLine.currency}
              />
              {overBudget ? (
                <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
                  Exception budgétaire — la demande nécessite une revue de seuil
                  approfondie. La soumission n&apos;est pas bloquée dans le
                  prototype.
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Documents" />
            <CardBody className="space-y-3">
              <AttachmentsZone
                requisitionId={req.id}
                allowedCategories={uploadCategories}
                lockedReason="Ouverture en consultation seulement : les pièces existantes restent visibles, sans modification du dossier."
              />
              {req.documents.length === 0 ? (
                <p className="text-xs text-ink-500">
                  Aucun document associé pour le moment.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {req.documents.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-ink-100 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink-800">
                          {d.fileName}
                        </div>
                        <div className="text-[11px] text-ink-500">
                          {DOCUMENT_CATEGORY_LABEL[d.documentCategory as DocumentCategory]} ·{" "}
                          {(d.fileSize / 1024).toFixed(0)} Ko ·{" "}
                          {d.uploadedBy.fullName}
                        </div>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                        Pièce jointe
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Bons de commande" />
            <CardBody>
              {req.purchaseOrders.length === 0 ? (
                <p className="text-xs text-ink-500">Aucun PO émis.</p>
              ) : (
                <ul className="space-y-3">
                  {req.purchaseOrders.map((po) => (
                    <li
                      key={po.id}
                      className="rounded-md border border-ink-100 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <Link
                          href="/purchase-orders"
                          className="font-mono text-xs text-wwf-700 hover:underline"
                        >
                          {po.poNumber}
                        </Link>
                        <Badge
                          className={
                            PO_STATUS_BADGE[po.status as POStatus] ?? ""
                          }
                        >
                          {PO_STATUS_LABEL[po.status as POStatus] ?? po.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-ink-500">
                        {po.supplier.companyName}
                      </div>
                      <div className="mt-1 text-sm font-medium text-ink-900">
                        {formatCurrency(po.amount, po.currency)}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-ink-500">
                        <span>Émis le {formatDate(po.issuedAt)}</span>
                        <Link
                          href={`/print/po/${po.id}`}
                          target="_blank"
                          className="font-medium text-wwf-700 hover:underline"
                        >
                          Imprimer →
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Réceptions" />
            <CardBody>
              {req.receipts.length === 0 ? (
                <p className="text-xs text-ink-500">Aucune réception.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {req.receipts.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-md border border-ink-100 px-3 py-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <Badge className="bg-teal-50 text-teal-700 ring-1 ring-teal-200">
                          {RECEIPT_TYPE_LABEL[r.receiptType as ReceiptType]}
                        </Badge>
                        <span className="text-ink-500">
                          {formatDate(r.receivedDate)}
                        </span>
                      </div>
                      <div className="mt-1 text-ink-700">
                        {r.notes ?? "—"}
                      </div>
                      {r.discrepancyFlag ? (
                        <div className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">
                          Écart : {r.discrepancyNotes}
                        </div>
                      ) : null}
                      <div className="mt-1 text-[11px] text-ink-500">
                        Reçu par {r.receivedBy.fullName}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {canCancel ? (
            <Card>
              <CardHeader
                title="Action administrateur"
                description="Annulation du dossier"
              />
              <CardBody>
                <form
                  action={cancelRequisitionAction}
                  className="space-y-2"
                >
                  <input type="hidden" name="id" value={req.id} />
                  <textarea
                    name="comment"
                    rows={2}
                    placeholder="Motif d'annulation (obligatoire)"
                    className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
                  >
                    Annuler la réquisition
                  </button>
                </form>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-ink-800">{value}</div>
    </div>
  );
}

function BudgetBar({
  allocated,
  committed,
  spent,
  currency,
}: {
  allocated: number;
  committed: number;
  spent: number;
  currency: string;
}) {
  const spentPct = (spent / allocated) * 100;
  const committedPct = ((committed + spent) / allocated) * 100;
  return (
    <div>
      <div className="flex justify-between text-[11px] text-ink-500">
        <span>Engagé + dépensé</span>
        <span>
          {formatCurrency(spent + committed, currency)} /{" "}
          {formatCurrency(allocated, currency)}
        </span>
      </div>
      <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-ink-100">
        <div
          className="absolute inset-y-0 left-0 bg-amber-300"
          style={{ width: `${Math.min(committedPct, 100)}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-wwf-500"
          style={{ width: `${Math.min(spentPct, 100)}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-ink-500">
        <span>Dépensé : {formatCurrency(spent, currency)}</span>
        <span>Engagé : {formatCurrency(committed, currency)}</span>
      </div>
    </div>
  );
}
