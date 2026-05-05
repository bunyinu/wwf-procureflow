import Link from "next/link";
import { Activity } from "lucide-react";
import { Card, CardBody, CardHeader } from "./Card";
import { relativeFromNow } from "@/lib/format";

export type ActivityEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  newValue: string | null;
  comment: string | null;
  timestamp: Date;
};

const ACTION_LABEL: Record<string, string> = {
  REQUISITION_CREATED: "Création de réquisition",
  REQUISITION_SUBMITTED: "Soumission de réquisition",
  REQUISITION_CLOSED: "Clôture de réquisition",
  REQUISITION_CANCELLED: "Annulation de réquisition",
  APPROVAL_APPROVED: "Approbation",
  APPROVAL_REJECTED: "Rejet",
  APPROVAL_RETURNED: "Retour pour révision",
  BUDGET_EXCEPTION_FLAGGED: "Exception budgétaire signalée",
  PO_CREATED: "Émission de bon de commande",
  RECEIPT_CREATED: "Réception enregistrée",
  SUPPLIER_CREATED: "Création de fournisseur",
  SUPPLIER_UPDATED: "Mise à jour fournisseur",
  SUPPLIER_ATTESTATION_SIGNED: "Annexe B signée",
  SUPPLIER_ATTESTATION_REVOKED: "Annexe B révoquée",
  USER_CREATED: "Création d'utilisateur",
  USER_UPDATED: "Mise à jour utilisateur",
  USER_PASSWORD_RESET: "Réinitialisation mot de passe",
  USER_DEACTIVATED: "Désactivation compte",
  USER_ACTIVATED: "Réactivation compte",
  DEPARTMENT_CREATED: "Création de département",
  DEPARTMENT_UPDATED: "Mise à jour département",
  PROJECT_CREATED: "Création de projet",
  PROJECT_UPDATED: "Mise à jour projet",
  BUDGET_LINE_CREATED: "Création ligne budgétaire",
  BUDGET_LINE_UPDATED: "Mise à jour ligne budgétaire",
  SETTING_UPDATED: "Mise à jour de paramètre",
  DOCUMENT_ATTACHED: "Pièce jointe ajoutée",
  DOCUMENT_REMOVED: "Pièce jointe supprimée",
};

function entityHref(e: ActivityEntry): string | null {
  if (e.entityType === "PurchaseRequisition") return `/requisitions/${e.entityId}`;
  if (e.entityType === "Supplier") return `/suppliers/${e.entityId}`;
  if (e.entityType === "User") return `/admin/users/${e.entityId}`;
  if (e.entityType === "PurchaseOrder") return `/purchase-orders`;
  return null;
}

export function MyActivity({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader
        title="Mon activité récente"
        description="Vos dernières actions consignées au journal d'audit"
      />
      <CardBody>
        {entries.length === 0 ? (
          <p className="text-sm text-ink-500">
            Aucune action enregistrée pour le moment.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => {
              const href = entityHref(e);
              const inner = (
                <div className="flex items-start gap-3 rounded-md border border-ink-100 bg-white px-3 py-2 transition hover:border-wwf-200 hover:bg-wwf-50/30">
                  <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-wwf-50 text-wwf-700 ring-1 ring-wwf-100">
                    <Activity className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-800">
                      {ACTION_LABEL[e.action] ?? e.action}
                    </div>
                    <div className="truncate text-xs text-ink-500">
                      {e.newValue ?? e.entityType}
                      {e.comment ? ` — ${e.comment}` : ""}
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-400">
                    {relativeFromNow(e.timestamp)}
                  </span>
                </div>
              );
              return (
                <li key={e.id}>
                  {href ? <Link href={href}>{inner}</Link> : inner}
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
