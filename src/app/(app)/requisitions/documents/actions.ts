"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { DocumentCategory, Role } from "@/lib/enums";
import { canUploadRequisitionDocument } from "@/lib/document-permissions";

const attachSchema = z.object({
  requisitionId: z.string().min(1),
  documentCategory: z.enum([
    DocumentCategory.JUSTIFICATION,
    DocumentCategory.QUOTATION,
    DocumentCategory.CONTRACT,
    DocumentCategory.INVOICE,
    DocumentCategory.GRN,
    DocumentCategory.SAN,
    DocumentCategory.OTHER,
  ]),
});

export async function attachDocumentAction(formData: FormData) {
  const user = await requireUser();
  const requisitionId = String(formData.get("requisitionId") || "");
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    redirect(`/requisitions/${requisitionId}?error=Aucun fichier sélectionné`);
  }
  const result = attachSchema.safeParse({
    requisitionId,
    documentCategory: formData.get("documentCategory"),
  });
  if (!result.success) {
    redirect(
      `/requisitions/${requisitionId}?error=${encodeURIComponent("Catégorie invalide")}`,
    );
  }
  const parsed = result.data;
  const requisition = await prisma.purchaseRequisition.findUnique({
    where: { id: parsed.requisitionId },
    select: { requesterId: true, status: true },
  });
  if (!requisition) redirect("/requisitions?error=not_found");
  if (
    !canUploadRequisitionDocument(
      user,
      requisition,
      parsed.documentCategory,
    )
  ) {
    redirect(`/requisitions/${parsed.requisitionId}?denied=1`);
  }
  const created = await prisma.document.create({
    data: {
      requisitionId: parsed.requisitionId,
      fileName: file!.name,
      fileType: file!.type || "application/octet-stream",
      fileSize: file!.size,
      // Prototype: no real object storage; we store a placeholder URL.
      // Production will write to MinIO and persist the signed URL.
      fileUrl: `/placeholder/${parsed.requisitionId}/${encodeURIComponent(file!.name)}`,
      uploadedById: user.id,
      documentCategory: parsed.documentCategory,
    },
  });
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: "DOCUMENT_ATTACHED",
    entityType: "Document",
    entityId: created.id,
    newValue: `${created.fileName} (${created.documentCategory})`,
  });
  revalidatePath(`/requisitions/${parsed.requisitionId}`);
  revalidatePath("/documents");
  redirect(`/requisitions/${parsed.requisitionId}?attached=1`);
}

export async function deleteDocumentAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) redirect("/requisitions");
  // Allow uploader or admin
  if (doc!.uploadedById !== user.id && user.role !== Role.ADMIN) {
    redirect(`/requisitions/${doc!.requisitionId}?denied=1`);
  }
  await prisma.document.delete({ where: { id } });
  await logAudit({
    actorId: user.id,
    actorRole: user.role as Role,
    action: "DOCUMENT_REMOVED",
    entityType: "Document",
    entityId: id,
    oldValue: doc!.fileName,
  });
  revalidatePath(`/requisitions/${doc!.requisitionId}`);
  revalidatePath("/documents");
  redirect(`/requisitions/${doc!.requisitionId}`);
}
