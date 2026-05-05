import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import {
  createDepartmentAction,
  updateDepartmentAction,
} from "../users/actions";

export const dynamic = "force-dynamic";

export default async function AdminDepartmentsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const me = await requireUser();
  assertCan(me, "update", "department", {}, "/dashboard?denied=1");
  const [departments, users] = await Promise.all([
    prisma.department.findMany({
      include: { manager: true, users: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["MANAGER", "ADMIN"] } },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-wwf-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la console
        </Link>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-wwf-700">
          Console administrateur
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
          Départements
        </h1>
        <p className="text-sm text-ink-500">
          Création, modification et affectation des managers responsables.
        </p>
      </div>

      {searchParams.error ? (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {decodeURIComponent(searchParams.error)}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {departments.map((d) => (
            <Card key={d.id}>
              <CardHeader
                title={`${d.name} (${d.code})`}
                description={`${d.users.length} utilisateur(s) · Responsable : ${d.manager?.fullName ?? "non défini"}`}
              />
              <CardBody>
                <form
                  action={updateDepartmentAction}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  <input type="hidden" name="id" value={d.id} />
                  <div>
                    <label className="text-xs font-medium text-ink-700">
                      Nom
                    </label>
                    <input
                      name="name"
                      defaultValue={d.name}
                      required
                      className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-700">
                      Code
                    </label>
                    <input
                      name="code"
                      defaultValue={d.code}
                      required
                      maxLength={8}
                      className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm font-mono uppercase shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink-700">
                      Responsable
                    </label>
                    <select
                      name="managerUserId"
                      defaultValue={d.managerUserId ?? ""}
                      className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                    >
                      <option value="">— Aucun —</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="rounded-md bg-wwf-700 px-3.5 py-2 text-xs font-medium text-white hover:bg-wwf-800"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader title="Créer un département" />
          <CardBody>
            <form
              action={createDepartmentAction}
              className="space-y-3 text-sm"
            >
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Nom
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ex. Conservation"
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Code
                </label>
                <input
                  name="code"
                  required
                  maxLength={8}
                  placeholder="CONS"
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 font-mono uppercase shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Responsable
                </label>
                <select
                  name="managerUserId"
                  defaultValue=""
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 shadow-sm"
                >
                  <option value="">— Affecter plus tard —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-wwf-700 px-3 py-2 text-sm font-medium text-white hover:bg-wwf-800"
              >
                Créer le département
              </button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
