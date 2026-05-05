import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, KeyRound, ShieldOff, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { assertCan } from "@/lib/permissions";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ROLE_LABELS } from "@/lib/workflow";
import type { Role } from "@/lib/enums";
import {
  resetPasswordAction,
  toggleUserAction,
  updateUserAction,
} from "../actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function UserEditPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { reset?: string; error?: string };
}) {
  const me = await requireRole("ADMIN");
  assertCan(me, "update", "user", {}, "/admin/users?denied=1");
  const [u, departments] = await Promise.all([
    prisma.user.findUnique({ where: { id: params.id } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!u) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-wwf-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour aux utilisateurs
        </Link>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
          {u.fullName}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
          <Badge className="bg-ink-100 text-ink-700">
            {ROLE_LABELS[u.role as Role]}
          </Badge>
          {u.active ? (
            <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              Actif
            </Badge>
          ) : (
            <Badge className="bg-zinc-200 text-zinc-700 ring-1 ring-zinc-300">
              Désactivé
            </Badge>
          )}
          <span className="text-xs text-ink-500">
            Créé le {formatDate(u.createdAt)}
          </span>
        </div>
      </div>

      {searchParams.reset ? (
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          Mot de passe réinitialisé à <span className="font-mono">demo123</span>.
        </div>
      ) : null}
      {searchParams.error ? (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {decodeURIComponent(searchParams.error)}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Modifier l'utilisateur"
            description="Tous les champs sont éditables. Les modifications sont consignées au journal d'audit."
          />
          <CardBody>
            <form action={updateUserAction} className="space-y-4">
              <input type="hidden" name="id" value={u.id} />
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Nom complet
                </label>
                <input
                  name="fullName"
                  defaultValue={u.fullName}
                  required
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-700">
                  Adresse e-mail
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={u.email}
                  required
                  className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-ink-700">
                    Rôle
                  </label>
                  <select
                    name="role"
                    defaultValue={u.role}
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-700">
                    Département
                  </label>
                  <select
                    name="departmentId"
                    defaultValue={u.departmentId ?? ""}
                    required
                    className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="rounded-md bg-wwf-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-wwf-800"
              >
                Enregistrer les modifications
              </button>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Réinitialisation du mot de passe" />
            <CardBody className="space-y-3 text-sm">
              <p className="text-ink-700">
                Réattribue le mot de passe par défaut{" "}
                <span className="font-mono">demo123</span>. L&apos;utilisateur
                doit le modifier à sa prochaine connexion (en production).
              </p>
              <form action={resetPasswordAction}>
                <input type="hidden" name="id" value={u.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Réinitialiser le mot de passe
                </button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activation du compte" />
            <CardBody className="space-y-3 text-sm">
              <p className="text-ink-700">
                Les comptes ne sont jamais supprimés afin de préserver
                l&apos;historique. Désactivez le compte pour bloquer
                l&apos;accès tout en conservant la traçabilité.
              </p>
              <form action={toggleUserAction}>
                <input type="hidden" name="id" value={u.id} />
                <button
                  type="submit"
                  className={
                    u.active
                      ? "inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                      : "inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  }
                >
                  {u.active ? (
                    <>
                      <ShieldOff className="h-3.5 w-3.5" />
                      Désactiver le compte
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Réactiver le compte
                    </>
                  )}
                </button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
