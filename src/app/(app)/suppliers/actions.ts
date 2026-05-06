"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { assertCan } from "@/lib/permissions";
import { optionalFormString } from "@/lib/form";
import {
  DueDiligenceStatus,
  Role,
  SupplierDocumentCategory,
  SupplierStatus,
} from "@/lib/enums";

const supplierSchema = z.object({
  companyName: z.string().min(2),
  taxId: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum([
    SupplierStatus.PENDING,
    SupplierStatus.PREQUALIFIED,
    SupplierStatus.SUSPENDED,
    SupplierStatus.REJECTED,
  ]),
  dueDiligenceStatus: z.enum([
    DueDiligenceStatus.NOT_STARTED,
    DueDiligenceStatus.IN_REVIEW,
    DueDiligenceStatus.CLEARED,
    DueDiligenceStatus.FAILED,
  ]),
  score: z.coerce.number().min(0).max(100),
});

export async function createSupplierAction(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "create", "supplier", {}, "/suppliers?denied=1");
  const result = supplierSchema.safeParse({
    companyName: formData.get("companyName"),
    taxId: optionalFormString(formData.get("taxId")),
    contactName: optionalFormString(formData.get("contactName")),
    email: formData.get("email") || "",
    phone: optionalFormString(formData.get("phone")),
    address: optionalFormString(formData.get("address")),
    status: formData.get("status") || SupplierStatus.PENDING,
    dueDiligenceStatus:
      formData.get("dueDiligenceStatus") || DueDiligenceStatus.NOT_STARTED,
    score: formData.get("score") || 0,
  });
  if (!result.success) {
    const msg = encodeURIComponent(
      result.error.issues
        .map((i) => `${i.path.join(".")} : ${i.message}`)
        .join(" · "),
    );
    redirect(`/suppliers?error=${msg}`);
  }
  const parsed = result.data;
  const created = await prisma.supplier.create({
    data: {
      companyName: parsed.companyName,
      taxId: parsed.taxId || null,
      contactName: parsed.contactName || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      address: parsed.address || null,
      status: parsed.status,
      dueDiligenceStatus: parsed.dueDiligenceStatus,
      score: parsed.score,
    },
  });
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: "SUPPLIER_CREATED",
    entityType: "Supplier",
    entityId: created.id,
    newValue: created.companyName,
  });
  revalidatePath("/suppliers");
  redirect(`/suppliers/${created.id}`);
}

export async function toggleAntiCorruptionAction(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "update", "supplier", {}, "/suppliers?denied=1");
  const id = String(formData.get("id"));
  const current = await prisma.supplier.findUnique({ where: { id } });
  if (!current) redirect("/suppliers");
  const willSign = !current!.antiCorruptionSignedAt;
  await prisma.supplier.update({
    where: { id },
    data: { antiCorruptionSignedAt: willSign ? new Date() : null },
  });
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: willSign
      ? "SUPPLIER_ATTESTATION_SIGNED"
      : "SUPPLIER_ATTESTATION_REVOKED",
    entityType: "Supplier",
    entityId: id,
    oldValue: current!.antiCorruptionSignedAt?.toISOString() ?? "non signée",
    newValue: willSign ? "signée" : "non signée",
    comment: "Annexe B — Lettre de certification et engagement",
  });
  revalidatePath(`/suppliers/${id}`);
  revalidatePath("/suppliers");
  redirect(`/suppliers/${id}`);
}

const supplierDocumentSchema = z.object({
  supplierId: z.string().min(1),
  documentCategory: z.enum([
    SupplierDocumentCategory.RCCM,
    SupplierDocumentCategory.TAX_ID,
    SupplierDocumentCategory.TAX_CLEARANCE,
    SupplierDocumentCategory.ANTI_CORRUPTION,
    SupplierDocumentCategory.BANK_REFERENCE,
    SupplierDocumentCategory.CLIENT_REFERENCE,
    SupplierDocumentCategory.OTHER,
  ]),
});

export async function attachSupplierDocumentAction(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "update", "supplier", {}, "/suppliers?denied=1");
  const supplierId = String(formData.get("supplierId") || "");
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    redirect(`/suppliers/${supplierId}?error=${encodeURIComponent("Aucun fichier sélectionné")}`);
  }
  const result = supplierDocumentSchema.safeParse({
    supplierId,
    documentCategory: formData.get("documentCategory"),
  });
  if (!result.success) {
    redirect(`/suppliers/${supplierId}?error=${encodeURIComponent("Catégorie diligence invalide")}`);
  }
  const parsed = result.data;
  const supplier = await prisma.supplier.findUnique({ where: { id: parsed.supplierId } });
  if (!supplier) redirect("/suppliers?error=missing_supplier");

  const created = await prisma.supplierDocument.create({
    data: {
      supplierId: parsed.supplierId,
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      fileSize: file.size,
      fileUrl: `/placeholder/suppliers/${parsed.supplierId}/${encodeURIComponent(file.name)}`,
      uploadedById: user.id,
      documentCategory: parsed.documentCategory,
    },
  });
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: "SUPPLIER_DOCUMENT_ATTACHED",
    entityType: "SupplierDocument",
    entityId: created.id,
    newValue: `${created.fileName} (${created.documentCategory})`,
    comment: `Diligence fournisseur ${supplier.companyName}`,
  });
  revalidatePath(`/suppliers/${parsed.supplierId}`);
  revalidatePath("/suppliers");
  revalidatePath("/documents");
  redirect(`/suppliers/${parsed.supplierId}?attached=1`);
}

export async function updateSupplierStatusAction(formData: FormData) {
  const user = await requireUser();
  assertCan(user, "update", "supplier", {}, "/suppliers?denied=1");
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const dueDiligenceStatus = String(formData.get("dueDiligenceStatus"));
  const previous = await prisma.supplier.findUnique({ where: { id } });
  await prisma.supplier.update({
    where: { id },
    data: { status, dueDiligenceStatus },
  });
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: "SUPPLIER_UPDATED",
    entityType: "Supplier",
    entityId: id,
    oldValue: `${previous?.status}/${previous?.dueDiligenceStatus}`,
    newValue: `${status}/${dueDiligenceStatus}`,
  });
  revalidatePath(`/suppliers/${id}`);
  revalidatePath("/suppliers");
  redirect(`/suppliers/${id}`);
}
