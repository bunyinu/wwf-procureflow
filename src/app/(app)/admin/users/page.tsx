import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ROLE_LABELS } from "@/lib/workflow";
import { createUserAction } from "./actions";
import type { Role } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await requireRole("ADMIN");
  assertCan(user, "read", "user", {}, "/workspaces/admin?denied=1");
  const [users, departments] = await Promise.all([
    prisma.user.findMany({
      include: { department: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-wwf-700">
            Console administrateur
          </div>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
            Utilisateurs
          </h1>
          <p className="text-sm text-ink-500">
            Gestion complète des comptes : création, modification, rôles,
            réinitialisation, activation. Mot de passe par défaut :{" "}
            <span className="font-mono">demo123</span>.
          </p>
        </div>
        <Link
          href="/admin/departments"
          className="lift inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 shadow-soft hover:border-wwf-300"
        >
          Gérer les départements →
        </Link>
      </div>

      {searchParams.error ? (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {decodeURIComponent(searchParams.error)}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="px-0 py-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 text-left text-[11px] uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-2.5 font-medium">Nom</th>
                    <th className="px-5 py-2.5 font-medium">E-mail</th>
                    <th className="px-5 py-2.5 font-medium">Rôle</th>
                    <th className="px-5 py-2.5 font-medium">Département</th>
                    <th className="px-5 py-2.5 font-medium">Statut</th>
                    <th className="px-5 py-2.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-ink-50 transition hover:bg-ink-50/60"
                    >
                      <td className="px-5 py-3 font-medium text-ink-900">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="hover:text-wwf-700"
                        >
                          {u.fullName}
                        </Link>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-ink-500">
                        {u.email}
                      </td>
                      <td className="px-5 py-3">
                        <Badge className="bg-ink-100 text-ink-700">
                          {ROLE_LABELS[u.role as Role]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-ink-700">
                        {u.department?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        {u.active ? (
                          <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            Actif
                          </Badge>
                        ) : (
                          <Badge className="bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300">
                            Désactivé
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-ink-200 px-2.5 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
                        >
                          <Pencil className="h-3 w-3" />
                          Modifier
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Créer un utilisateur" />
          <CardBody>
            <form action={createUserAction} className="space-y-3 text-sm">
              <input
                name="fullName"
                required
                placeholder="Nom complet"
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
              />
              <input
                name="email"
                type="email"
                required
                placeholder="adresse@tsc.demo"
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
              />
              <select
                name="role"
                defaultValue="REQUESTER"
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
              >
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                name="departmentId"
                required
                className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-md bg-wwf-700 px-3 py-2 text-sm font-medium text-white hover:bg-wwf-800"
              >
                Créer l&apos;utilisateur
              </button>
              <p className="text-[11px] text-ink-500">
                Le mot de passe initial est <span className="font-mono">demo123</span>.
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
