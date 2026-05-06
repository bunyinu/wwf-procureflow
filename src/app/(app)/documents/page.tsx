import Link from "next/link";
import {
  Download,
  FileArchive,
  FileText,
  FolderArchive,
  Search,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import {
  DOCUMENT_CATEGORY_LABEL,
  SUPPLIER_DOCUMENT_CATEGORY_LABEL,
  type DocumentCategory,
  type SupplierDocumentCategory,
} from "@/lib/enums";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const user = await requireRole("AUDITOR", "SUPPLIER_MANAGER");
  const canViewRequisitionDocs = user.role === "AUDITOR";
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const cat = searchParams.category;

  const docs = canViewRequisitionDocs
    ? await prisma.document.findMany({
        where: {
          ...(cat ? { documentCategory: cat } : {}),
          ...(q
            ? {
                OR: [
                  { fileName: { contains: q } },
                  { requisition: { title: { contains: q } } },
                  { requisition: { requisitionNumber: { contains: q } } },
                ],
              }
            : {}),
        },
        include: { requisition: true, uploadedBy: true },
        orderBy: { uploadedAt: "desc" },
        take: 100,
      })
    : [];

  const supplierDocs = await prisma.supplierDocument.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { fileName: { contains: q } },
              { supplier: { companyName: { contains: q } } },
              { supplier: { taxId: { contains: q } } },
            ],
          }
        : {}),
    },
    include: { supplier: true, uploadedBy: true },
    orderBy: { uploadedAt: "desc" },
    take: 100,
  });

  const counts = canViewRequisitionDocs
    ? await prisma.document.groupBy({
        by: ["documentCategory"],
        _count: { _all: true },
      })
    : [];
  const total = counts.reduce((s, c) => s + c._count._all, 0) + supplierDocs.length;

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-wwf-700">
          Archivage électronique
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          Documents
        </h1>
        <p className="text-sm text-ink-500">
          Recherche rapide dans la documentation des dossiers d&apos;achat
          (TDR §4.7) — devis, contrats, factures, GRN, SAN.
        </p>
      </div>

      <Card>
        <CardHeader title="Recherche" />
        <CardBody>
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs font-medium text-ink-700">
                Terme de recherche
              </label>
              <div className="mt-1 flex items-center rounded-md border border-ink-200 bg-white px-2 py-1.5 shadow-sm focus-within:border-wwf-500 focus-within:ring-2 focus-within:ring-wwf-200">
                <Search className="h-4 w-4 text-ink-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Nom de fichier, n° de réquisition, titre…"
                  className="ml-2 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-700">
                Catégorie
              </label>
              <select
                name="category"
                defaultValue={cat ?? ""}
                className="mt-1 rounded-md border border-ink-200 bg-white px-2.5 py-2 text-sm shadow-sm"
              >
                <option value="">Toutes</option>
                {Object.entries(DOCUMENT_CATEGORY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white hover:bg-wwf-800"
            >
              Rechercher
            </button>
            <Link
              href="/documents"
              className="rounded-md border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              Réinitialiser
            </Link>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Link
              href="/documents"
              className={`rounded-full border px-3 py-1 transition ${
                !cat
                  ? "border-wwf-300 bg-wwf-50 text-wwf-800"
                  : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
              }`}
            >
              Tout ({total})
            </Link>
            {counts.map((c) => (
              <Link
                key={c.documentCategory}
                href={`/documents?category=${c.documentCategory}`}
                className={`rounded-full border px-3 py-1 transition ${
                  cat === c.documentCategory
                    ? "border-wwf-300 bg-wwf-50 text-wwf-800"
                    : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
                }`}
              >
                {DOCUMENT_CATEGORY_LABEL[c.documentCategory as DocumentCategory] ??
                  c.documentCategory}{" "}
                ({c._count._all})
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Documents fournisseurs"
          description="Diligence raisonnable : RCCM, NIF, attestation fiscale, Annexe B et références."
        />
        <CardBody className="px-0 py-0">
          {supplierDocs.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink-500">
              Aucun document fournisseur trouvé.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-2.5 font-medium">Fichier</th>
                    <th className="px-5 py-2.5 font-medium">Catégorie</th>
                    <th className="px-5 py-2.5 font-medium">Fournisseur</th>
                    <th className="px-5 py-2.5 font-medium">Déposé par</th>
                    <th className="px-5 py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierDocs.map((document) => (
                    <tr key={document.id} className="border-b border-ink-50 transition hover:bg-ink-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-ink-400" />
                          <span className="font-medium text-ink-800">{document.fileName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className="bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                          {SUPPLIER_DOCUMENT_CATEGORY_LABEL[document.documentCategory as SupplierDocumentCategory] ?? document.documentCategory}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/suppliers/${document.supplierId}`} className="text-ink-700 hover:text-wwf-700">
                          {document.supplier.companyName}
                        </Link>
                        <div className="text-[11px] text-ink-500">{document.supplier.taxId ?? "—"}</div>
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-600">{document.uploadedBy.fullName}</td>
                      <td className="px-5 py-3 text-xs text-ink-500">{formatDate(document.uploadedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="px-0 py-0">
          {docs.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="Aucun document trouvé"
                description="Ajustez la recherche ou retirez un filtre."
                icon={FolderArchive}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-2.5 font-medium">Fichier</th>
                    <th className="px-5 py-2.5 font-medium">Catégorie</th>
                    <th className="px-5 py-2.5 font-medium">Dossier lié</th>
                    <th className="px-5 py-2.5 font-medium">Déposé par</th>
                    <th className="px-5 py-2.5 font-medium">Taille</th>
                    <th className="px-5 py-2.5 font-medium">Date</th>
                    <th className="px-5 py-2.5 font-medium text-right">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-ink-50 transition hover:bg-ink-50/60"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/print/requisition/${d.requisitionId}`}
                          target="_blank"
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4 text-ink-400" />
                          <span className="font-medium text-ink-800 hover:text-wwf-700">
                            {d.fileName}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className="bg-ink-100 text-ink-700">
                          {DOCUMENT_CATEGORY_LABEL[
                            d.documentCategory as DocumentCategory
                          ] ?? d.documentCategory}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/requisitions/${d.requisitionId}`}
                          className="text-ink-700 hover:text-wwf-700"
                        >
                          {d.requisition.title}
                        </Link>
                        <div className="font-mono text-[11px] text-ink-500">
                          {d.requisition.requisitionNumber}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-600">
                        {d.uploadedBy.fullName}
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-500">
                        {(d.fileSize / 1024).toFixed(0)} Ko
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-500">
                        {formatDate(d.uploadedAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/print/requisition/${d.requisitionId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-md border border-ink-200 px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-ink-50"
                        >
                          <Download className="h-3 w-3" />
                          Édition PDF
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="rounded-lg border border-dashed border-wwf-200 bg-wwf-50/40 px-4 py-3 text-xs text-wwf-900">
        <FileArchive className="mr-1 inline h-3.5 w-3.5" />
        <strong>Stockage cible :</strong> MinIO (S3-compatible) avec
        chiffrement au repos, versioning et contrôle d&apos;accès par dossier.
        Indexation full-text et OCR pour les pièces scannées via Tika.
      </div>
    </div>
  );
}
