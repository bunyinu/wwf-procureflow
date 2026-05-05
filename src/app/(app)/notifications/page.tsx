import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  Inbox,
  PackageCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { getNotificationsFor } from "@/lib/notifications";
import { relativeFromNow } from "@/lib/format";

export const dynamic = "force-dynamic";

const ICON_FOR: Record<string, LucideIcon> = {
  queue: Inbox,
  decision: CheckCircle2,
  received: PackageCheck,
  po: ClipboardList,
  info: Bell,
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotificationsFor(user);

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-wwf-700">
          Centre de notifications
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
          Notifications
        </h1>
        <p className="text-sm text-ink-500">
          Notifications automatiques (TDR §4.2) — dérivées du moteur
          d&apos;approbation et du journal d&apos;audit. La version production
          relayera ces évènements par e-mail (SMTP) et SMS.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-wwf-200 bg-white px-3 py-1 text-xs font-medium text-wwf-700">
          <Bell className="h-3 w-3" />
          {unread} non lue{unread > 1 ? "s" : ""} · {notifications.length} au total
        </span>
        <Link
          href="/approvals"
          className="text-xs font-medium text-wwf-700 hover:text-wwf-800"
        >
          Voir la file d&apos;approbation →
        </Link>
      </div>

      <Card>
        <CardHeader title="Évènements récents" />
        <CardBody className="space-y-2">
          {notifications.length === 0 ? (
            <EmptyState
              title="Aucune notification"
              description="Vous serez notifié dès qu'une décision vous attend ou qu'un dossier vous concernant évolue."
              icon={Bell}
            />
          ) : (
            notifications.map((n) => {
              const Icon = ICON_FOR[n.kind] ?? Bell;
              return (
                <Link
                  key={n.id}
                  href={n.link ?? "#"}
                  className={`group flex items-start gap-3 rounded-md border px-3 py-2.5 transition ${
                    n.unread
                      ? "border-wwf-200 bg-wwf-50/40"
                      : "border-ink-100 bg-white hover:border-ink-200"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ring-1 ${
                      n.kind === "queue"
                        ? "bg-amber-50 text-amber-700 ring-amber-100"
                        : n.kind === "decision"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                          : n.kind === "received"
                            ? "bg-teal-50 text-teal-700 ring-teal-100"
                            : n.kind === "po"
                              ? "bg-indigo-50 text-indigo-700 ring-indigo-100"
                              : "bg-ink-50 text-ink-600 ring-ink-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-900">
                        {n.title}
                      </span>
                      {n.unread ? (
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-wwf-600" />
                      ) : null}
                    </div>
                    <div className="truncate text-xs text-ink-600">{n.body}</div>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-400">
                    {relativeFromNow(n.timestamp)}
                  </span>
                </Link>
              );
            })
          )}
        </CardBody>
      </Card>

      <div className="rounded-lg border border-dashed border-wwf-200 bg-wwf-50/40 px-4 py-3 text-xs text-wwf-900">
        <strong>Canaux production :</strong> SMTP transactionnel (e-mail),
        SMS pour les approbations urgentes, et webhooks pour intégration aux
        systèmes tiers. Les modèles d&apos;e-mail et règles d&apos;envoi
        seront configurés par l&apos;administrateur.
      </div>
    </div>
  );
}
