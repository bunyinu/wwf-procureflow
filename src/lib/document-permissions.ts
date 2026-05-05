import {
  DocumentCategory,
  RequisitionStatus,
  Role,
  type DocumentCategory as DocumentCategoryType,
} from "@/lib/enums";

export const REQUISITION_DOCUMENT_CATEGORIES: DocumentCategoryType[] = [
  DocumentCategory.QUOTATION,
  DocumentCategory.CONTRACT,
  DocumentCategory.INVOICE,
  DocumentCategory.JUSTIFICATION,
  DocumentCategory.GRN,
  DocumentCategory.SAN,
  DocumentCategory.OTHER,
];

type Actor = { id: string; role: string };
type RequisitionForDocuments = { requesterId: string; status: string };

export function documentCategoriesForRequisitionUpload(
  actor: Actor,
  requisition: RequisitionForDocuments,
): DocumentCategoryType[] {
  const role = actor.role as Role;

  if (
    role === Role.REQUESTER &&
    actor.id === requisition.requesterId &&
    (requisition.status === RequisitionStatus.DRAFT ||
      requisition.status === RequisitionStatus.RETURNED_FOR_REVISION)
  ) {
    return [DocumentCategory.JUSTIFICATION, DocumentCategory.OTHER];
  }

  if (
    role === Role.PROCUREMENT &&
    (requisition.status === RequisitionStatus.PROCUREMENT_REVIEW ||
      requisition.status === RequisitionStatus.THRESHOLD_REVIEW ||
      requisition.status === RequisitionStatus.PO_CREATED ||
      requisition.status === RequisitionStatus.RECEIVED)
  ) {
    return [
      DocumentCategory.QUOTATION,
      DocumentCategory.CONTRACT,
      DocumentCategory.INVOICE,
      DocumentCategory.OTHER,
    ];
  }

  if (
    role === Role.RECEIVER &&
    requisition.status === RequisitionStatus.PO_CREATED
  ) {
    return [DocumentCategory.GRN, DocumentCategory.SAN, DocumentCategory.OTHER];
  }

  return [];
}

export function canUploadRequisitionDocument(
  actor: Actor,
  requisition: RequisitionForDocuments,
  category: DocumentCategoryType,
): boolean {
  return documentCategoriesForRequisitionUpload(actor, requisition).includes(
    category,
  );
}

