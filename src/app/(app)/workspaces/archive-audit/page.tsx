import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role, type DocumentCategory } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ContractStrip, WorkspaceHeader } from "../_shared";
import { DOCUMENT_CATEGORY_LABEL } from "@/lib/enums";
import { formatDate, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ArchiveAuditWorkspacePage({ searchParams }: { searchParams: { q?: string; status?: string; actor?: string; from?: string; to?: string } }) {
  await requireWorkspaceRole(Role.AUDITOR);
  const workspace = WORKSPACE_BY_ROLE.AUDITOR;
  const q = (searchParams.q ?? "").trim();
  const [documents, logs, users] = await Promise.all([
    prisma.document.findMany({
      where: q
        ? {
            OR: [
              { fileName: { contains: q, mode: "insensitive" } },
              { requisition: { requisitionNumber: { contains: q, mode: "insensitive" } } },
              { requisition: { title: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {},
      include: { requisition: true, uploadedBy: true },
      orderBy: { uploadedAt: "desc" },
      take: 25,
    }),
    prisma.auditLog.findMany({
      where: {
        ...(searchParams.actor ? { actorId: searchParams.actor } : {}),
        ...(searchParams.from || searchParams.to
          ? {
              timestamp: {
                ...(searchParams.from ? { gte: new Date(searchParams.from) } : {}),
                ...(searchParams.to ? { lte: new Date(`${searchParams.to}T23:59:59`) } : {}),
              },
            }
          : {}),
      },
      include: { actor: true },
      orderBy: { timestamp: "desc" },
      take: 25,
    }),
    prisma.user.findMany({ orderBy: { fullName: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      <ContractStrip workspace={workspace} />

      <Card>
        <CardHeader title="Top · Global search" description="Search documents and correlate with immutable audit events." action={<Link href="/print/audit" target="_blank" className="text-xs font-medium text-wwf-700">Export audit pack</Link>} />
        <CardBody>
          <form method="GET" className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input name="q" defaultValue={q} placeholder="Request number, document name, title…" className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm" />
            <button type="submit" className="rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white">Search</button>
          </form>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader title="Left · Filters" />
          <CardBody>
            <form method="GET" className="space-y-3 text-xs">
              <input type="hidden" name="q" value={q} />
              <select name="actor" defaultValue={searchParams.actor ?? ""} className="w-full rounded-md border border-ink-200 bg-white px-2.5 py-2">
                <option value="">All users</option>
                {users.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
              </select>
              <input type="date" name="from" defaultValue={searchParams.from ?? ""} className="w-full rounded-md border border-ink-200 bg-white px-2.5 py-2" />
              <input type="date" name="to" defaultValue={searchParams.to ?? ""} className="w-full rounded-md border border-ink-200 bg-white px-2.5 py-2" />
              <button type="submit" className="w-full rounded-md bg-wwf-700 px-3 py-2 font-medium text-white">Apply filters</button>
            </form>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Center · Document/results table" description={`${documents.length} document result(s).`} />
          <CardBody className="px-0 py-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500"><th className="px-4 py-2">File</th><th className="px-4 py-2">Request</th><th className="px-4 py-2">Category</th><th className="px-4 py-2">Uploaded</th></tr></thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-ink-50">
                      <td className="px-4 py-2"><Link href={`/print/requisition/${doc.requisitionId}`} className="font-medium text-ink-900 hover:text-wwf-700">{doc.fileName}</Link><div className="text-xs text-ink-500">{doc.uploadedBy.fullName}</div></td>
                      <td className="px-4 py-2 font-mono text-xs text-ink-600">{doc.requisition.requisitionNumber}</td>
                      <td className="px-4 py-2"><Badge className="bg-ink-100 text-ink-700">{DOCUMENT_CATEGORY_LABEL[doc.documentCategory as DocumentCategory]}</Badge></td>
                      <td className="px-4 py-2 text-xs text-ink-500">{formatDate(doc.uploadedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Right · Immutable audit timeline" description="Every action, who, when, comment." />
          <CardBody className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="rounded-md border border-ink-100 px-3 py-2 text-xs">
                <div className="font-semibold text-ink-900">{log.action}</div>
                <div className="text-ink-500">{log.actor?.fullName ?? "System"} · {formatDateTime(log.timestamp)}</div>
                <div className="mt-1 text-ink-700">{log.comment ?? log.newValue ?? "No comment"}</div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
