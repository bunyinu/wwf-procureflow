// Authoritative RBAC matrix for TSC ProcureFlow.
// Every server action calls assertCan(); the UI panel `/admin/settings` reads
// PERMISSION_MATRIX so the matrix shown to evaluators is the same one enforced
// at runtime. Keep this file the single source of truth.

import { redirect } from "next/navigation";
import { Role } from "@/lib/enums";
import { nextRoleForStatus } from "@/lib/workflow";

export type EntityKind =
  | "requisition"
  | "approval"
  | "purchaseOrder"
  | "goodsReceipt"
  | "supplier"
  | "user"
  | "department"
  | "project"
  | "budgetLine"
  | "setting"
  | "auditLog";

export type Action =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "submit"
  | "decide"
  | "cancel"
  | "issuePO"
  | "receive"
  | "close";

export type CanContext = {
  requisition?: { requesterId: string; status: string };
};

export type ActorLike = { id: string; role: string };

/**
 * Authoritative authorization predicate. Always called from server actions
 * via assertCan(); also used by the UI to hide actions a role cannot perform.
 */
export function can(
  user: ActorLike,
  action: Action,
  entity: EntityKind,
  ctx: CanContext = {},
): boolean {
  const role = user.role as Role;

  switch (entity) {
    case "requisition": {
      switch (action) {
        case "create":
          return role === Role.REQUESTER || role === Role.ADMIN;
        case "read":
          // All authenticated users can read; the UI scopes by relevance.
          return true;
        case "update":
          return (
            ctx.requisition?.status === "DRAFT" &&
            (ctx.requisition.requesterId === user.id || role === Role.ADMIN)
          );
        case "submit":
          return (
            (ctx.requisition?.status === "DRAFT" ||
              ctx.requisition?.status === "RETURNED_FOR_REVISION") &&
            (ctx.requisition.requesterId === user.id || role === Role.ADMIN)
          );
        case "decide": {
          if (!ctx.requisition) return false;
          if (role === Role.ADMIN) return true;
          const expected = nextRoleForStatus(ctx.requisition.status as never);
          return expected === role;
        }
        case "cancel":
          return role === Role.ADMIN;
        case "close":
          return role === Role.PROCUREMENT || role === Role.ADMIN;
        case "delete":
          return false; // requisitions are never hard-deleted
      }
      return false;
    }

    case "approval": {
      // Append-only — readable by everyone, mutable by no one.
      return action === "read";
    }

    case "purchaseOrder": {
      if (action === "read") return true;
      if (action === "create" || action === "issuePO")
        return role === Role.PROCUREMENT || role === Role.ADMIN;
      return false; // POs never deleted; only `CANCELLED` via workflow
    }

    case "goodsReceipt": {
      if (action === "read") return true;
      if (action === "create" || action === "receive")
        return role === Role.PROCUREMENT || role === Role.ADMIN;
      return false; // receipts append-only
    }

    case "supplier": {
      if (action === "read") return true;
      if (action === "create" || action === "update")
        return role === Role.PROCUREMENT || role === Role.ADMIN;
      if (action === "delete") return role === Role.ADMIN;
      return false;
    }

    case "user": {
      if (action === "read")
        return role === Role.ADMIN || role === Role.AUDITOR;
      if (action === "create" || action === "update")
        return role === Role.ADMIN;
      if (action === "delete") return false; // soft-delete only
      return false;
    }

    case "department":
    case "project":
    case "budgetLine":
    case "setting": {
      if (action === "read") return true;
      if (action === "create" || action === "update")
        return role === Role.ADMIN;
      if (action === "delete") return false; // protected by referential integrity
      return false;
    }

    case "auditLog": {
      // Read for Auditor + Admin only. Append-only — no update / delete.
      return action === "read" && (role === Role.AUDITOR || role === Role.ADMIN);
    }
  }
}

/**
 * Throw via redirect() if the user cannot perform the action.
 * Keeps server actions short and consistent.
 */
export function assertCan(
  user: ActorLike,
  action: Action,
  entity: EntityKind,
  ctx: CanContext = {},
  redirectTo: string = "/dashboard?denied=1",
): void {
  if (!can(user, action, entity, ctx)) {
    redirect(redirectTo);
  }
}

// ---------------------------------------------------------------------------
// Display matrix — consumed by the UI panel /admin/settings.
// Cells are evaluated by the same can() function above so they cannot drift.
// ---------------------------------------------------------------------------

export type CellVerdict =
  | { kind: "yes" }
  | { kind: "no" }
  | { kind: "conditional"; note: string };

const ALL_ROLES: Role[] = [
  Role.REQUESTER,
  Role.MANAGER,
  Role.PROCUREMENT,
  Role.FINANCE,
  Role.AUDITOR,
  Role.ADMIN,
];

const ENTITY_LABEL: Record<EntityKind, string> = {
  requisition: "Réquisition",
  approval: "Décision d'approbation",
  purchaseOrder: "Bon de commande",
  goodsReceipt: "Réception (GRN/SAN)",
  supplier: "Fournisseur",
  user: "Utilisateur",
  department: "Département",
  project: "Projet",
  budgetLine: "Ligne budgétaire",
  setting: "Paramètre workflow",
  auditLog: "Journal d'audit",
};

const ACTION_LABEL: Record<Action, string> = {
  create: "Créer",
  read: "Lire",
  update: "Modifier",
  delete: "Supprimer",
  submit: "Soumettre",
  decide: "Décider",
  cancel: "Annuler",
  issuePO: "Émettre PO",
  receive: "Réceptionner",
  close: "Clôturer",
};

const ROLE_LABEL: Record<Role, string> = {
  REQUESTER: "Demandeur",
  MANAGER: "Manager",
  PROCUREMENT: "Achats",
  FINANCE: "Finance",
  AUDITOR: "Auditeur",
  ADMIN: "Admin",
};

type RowDef = {
  entity: EntityKind;
  action: Action;
  /** Per-role override note, e.g. "owner only", to show on the cell. */
  conditional?: Partial<Record<Role, string>>;
  /** True if this row is intentionally append-only across the board. */
  appendOnly?: boolean;
};

const ROWS: RowDef[] = [
  // Requisition
  { entity: "requisition", action: "create" },
  {
    entity: "requisition",
    action: "read",
    conditional: {
      REQUESTER: "ses dossiers",
      MANAGER: "file Manager",
      FINANCE: "file Finance",
    },
  },
  {
    entity: "requisition",
    action: "update",
    conditional: {
      REQUESTER: "ses brouillons",
      ADMIN: "brouillons uniquement",
    },
  },
  {
    entity: "requisition",
    action: "submit",
    conditional: { REQUESTER: "ses dossiers" },
  },
  {
    entity: "requisition",
    action: "decide",
    conditional: {
      MANAGER: "étape Manager",
      PROCUREMENT: "étape Achats",
      FINANCE: "étape Finance",
    },
  },
  { entity: "requisition", action: "cancel" },
  { entity: "requisition", action: "close" },
  { entity: "requisition", action: "delete", appendOnly: true },

  // Approval
  { entity: "approval", action: "read" },
  { entity: "approval", action: "update", appendOnly: true },
  { entity: "approval", action: "delete", appendOnly: true },

  // Purchase order
  { entity: "purchaseOrder", action: "create" },
  { entity: "purchaseOrder", action: "read" },
  { entity: "purchaseOrder", action: "delete", appendOnly: true },

  // Goods receipt
  { entity: "goodsReceipt", action: "create" },
  { entity: "goodsReceipt", action: "read" },
  { entity: "goodsReceipt", action: "update", appendOnly: true },
  { entity: "goodsReceipt", action: "delete", appendOnly: true },

  // Supplier
  { entity: "supplier", action: "create" },
  { entity: "supplier", action: "read" },
  { entity: "supplier", action: "update" },
  {
    entity: "supplier",
    action: "delete",
    conditional: { ADMIN: "si aucun PO" },
  },

  // User
  { entity: "user", action: "create" },
  { entity: "user", action: "read" },
  { entity: "user", action: "update" },
  { entity: "user", action: "delete", appendOnly: true },

  // Reference data
  { entity: "department", action: "update" },
  { entity: "project", action: "update" },
  { entity: "budgetLine", action: "update" },
  { entity: "setting", action: "update" },

  // Audit log
  { entity: "auditLog", action: "read" },
  { entity: "auditLog", action: "update", appendOnly: true },
  { entity: "auditLog", action: "delete", appendOnly: true },
];

export type MatrixCell = {
  role: Role;
  verdict: CellVerdict;
};
export type MatrixRow = {
  entity: EntityKind;
  entityLabel: string;
  action: Action;
  actionLabel: string;
  cells: MatrixCell[];
  appendOnly: boolean;
  note?: string;
};

function syntheticUser(role: Role): ActorLike {
  return { id: "__matrix-actor__", role };
}

function syntheticContext(entity: EntityKind, role: Role): CanContext {
  // Provide a context that lets each role pass when they're meant to.
  if (entity !== "requisition") return {};
  // For "decide", supply the status that matches the role under test;
  // for "submit"/"update", treat as a draft owned by the actor.
  return {
    requisition: {
      requesterId: "__matrix-actor__",
      status:
        role === Role.MANAGER
          ? "MANAGER_REVIEW"
          : role === Role.PROCUREMENT
            ? "PROCUREMENT_REVIEW"
            : role === Role.FINANCE
              ? "FINANCE_REVIEW"
              : "DRAFT",
    },
  };
}

export function getPermissionMatrix(): MatrixRow[] {
  return ROWS.map((row) => {
    const cells: MatrixCell[] = ALL_ROLES.map((role) => {
      const ctx = syntheticContext(row.entity, role);
      const allowed = can(syntheticUser(role), row.action, row.entity, ctx);
      const note = row.conditional?.[role];
      let verdict: CellVerdict;
      if (!allowed) verdict = { kind: "no" };
      else if (note) verdict = { kind: "conditional", note };
      else verdict = { kind: "yes" };
      return { role, verdict };
    });
    return {
      entity: row.entity,
      entityLabel: ENTITY_LABEL[row.entity],
      action: row.action,
      actionLabel: ACTION_LABEL[row.action],
      cells,
      appendOnly: !!row.appendOnly,
    };
  });
}

export const ROLE_ORDER = ALL_ROLES;
export const ROLE_DISPLAY = ROLE_LABEL;
