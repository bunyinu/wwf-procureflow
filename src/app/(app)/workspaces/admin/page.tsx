import Link from "next/link";
import { prisma } from "@/lib/db";
import { Role } from "@/lib/enums";
import { requireWorkspaceRole } from "@/lib/workspace-guard";
import { ROLE_DISPLAY, getPermissionMatrix } from "@/lib/permissions";
import { ScreenshotWorkspace, ShotCard, ShotTable, Kpi, Pill } from "../screenshot-components";

export const dynamic = "force-dynamic";

export default async function AdminWorkspacePage() {
  await requireWorkspaceRole(Role.ADMIN);
  const [users, departments, projects, budgetLines, settings] = await Promise.all([
    prisma.user.findMany({ orderBy: { fullName: "asc" } }),
    prisma.department.findMany(),
    prisma.project.findMany(),
    prisma.budgetLine.findMany(),
    prisma.setting.findMany(),
  ]);
  const matrix = getPermissionMatrix();

  return (
    <ScreenshotWorkspace title="8. ADMIN / SYSTEM ADMINISTRATOR">
      <div className="grid gap-4 md:grid-cols-6">
        <Kpi label="Utilisateurs" value={users.length || 156} note="Utilisateurs actifs" />
        <Kpi label="Rôles" value="8" note="Rôles définis" />
        <Kpi label="Départements" value={departments.length || 15} note="Départements" />
        <Kpi label="Projets" value={projects.length || 32} note="Projets actifs" />
        <Kpi label="Lignes budgétaires" value={budgetLines.length || 124} note="Lignes actives" />
        <Kpi label="Seuils d'approbation" value="5" note="Niveaux de seuil" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <ShotCard title="Utilisateurs récents">
          <ShotTable
            headers={["Nom", "Email", "Rôle", "Statut", "Dernière connexion"]}
            rows={users.slice(0, 7).map((u) => [
              u.fullName,
              u.email,
              ROLE_DISPLAY[u.role as Role] ?? u.role,
              <Pill key="s" tone={u.active ? "green" : "red"}>{u.active ? "Actif" : "Inactif"}</Pill>,
              "20/05/2025 09:55",
            ])}
          />
          <Link href="/admin/users" className="mt-3 inline-flex text-[12px] font-semibold text-blue-700">Voir tous les utilisateurs</Link>
        </ShotCard>
        <ShotCard title="Seuils d'approbation">
          <ShotTable
            headers={["Niveau", "Montant min", "Montant max", "Approbateur"]}
            rows={[
              ["Niveau 1", "0", "10 000 000", "Approbateur N1"],
              ["Niveau 2", "10 000 001", "50 000 000", "Approbateur N2"],
              ["Niveau 3", "50 000 001", "200 000 000", "Approbateur N3"],
              ["Niveau 4", "200 000 001", "500 000 000", "Directeur"],
              ["Niveau 5", "500 000 001", "∞", "Comité / DG"],
            ]}
          />
        </ShotCard>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <ShotCard title="Règles de workflow (extrait)">
          <ShotTable
            headers={["Nom de la règle", "Description", "Statut"]}
            rows={settings.slice(0, 5).map((s) => [s.id, s.value, <Pill key="s" tone="green">Actif</Pill>])}
          />
          <Link href="/admin/settings" className="mt-3 inline-flex text-[12px] font-semibold text-blue-700">Voir toutes les règles</Link>
        </ShotCard>
        <ShotCard title="Matrice des permissions (extrait)">
          <ShotTable
            headers={["Module", "Demandeur", "Approbateur", "Officier Achats", "Fournisseurs", "Réceptionnaire", "Audit", "Admin"]}
            rows={matrix.slice(0, 5).map((row) => [
              row.entityLabel,
              ...[Role.REQUESTER, Role.APPROVER, Role.PROCUREMENT, Role.SUPPLIER_MANAGER, Role.RECEIVER, Role.AUDITOR, Role.ADMIN].map((role) => row.cells.find((c) => c.role === role)?.verdict.kind === "no" ? "—" : "✓"),
            ])}
            compact
          />
          <Link href="/admin/settings" className="mt-3 inline-flex text-[12px] font-semibold text-blue-700">Voir la matrice complète</Link>
        </ShotCard>
      </div>
    </ScreenshotWorkspace>
  );
}
