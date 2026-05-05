import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Inbox,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { getNotificationsFor, type Notification } from "@/lib/notifications";
import { relativeFromNow, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const ICON_FOR: Record<string, LucideIcon> = {
  queue: Inbox,
  decision: CheckCircle2,
  received: PackageCheck,
  po: ClipboardList,
  info: Bell,
};

const PAGE_SIZE = 12;

const KIND_LABEL: Record<string, string> = {
  queue: "À traiter",
  decision: "Décisions",
  received: "Réceptions",
  po: "Bons de commande",
  info: "Information",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: { kind?: string; page?: string; unread?: string };
}) {
  const user = await requireUser();
  const all = await getNotificationsFor(user);

  const onlyUnread = searchParams.unread === "1";
  const kind = searchParams.kind;
  const filtered = all.filter((n) => {
    if (onlyUnread && !n.unread) return false;
    if (kind && n.kind !== kind) return false;
    return true;
  });

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  // Group by day for readability
  const groups = new Map<string, Notification[]>();
  for (const n of slice) {
    const key = formatDate(n.timestamp);
    const arr = groups.get(key) ?? [];
    arr.push(n);
    groups.set(key, arr);
  }

  const unreadTotal = all.filter((n) => n.unread).length;
  const counts = Object.keys(KIND_LABEL).reduce<Record<string, number>>(
    (acc, k) => {
      acc[k] = all.filter((n) => n.kind === k).length;
      return acc;
    },
    {},
  );

  function makeHref(opts: {
    kind?: string | null;
    unread?: boolean;
    page?: number;
  }) {
    const p = new URLSearchParams();
    const k = opts.kind === undefined ? kind : (opts.kind ?? "");
    if (k) p.set("kind", k);
    const u = opts.unread === undefined ? onlyUnread : opts.unread;
    if (u) p.set("unread", "1");
    if (opts.page && opts.page > 1) p.set("page", String(opts.page));
    const qs = p.toString();
    return `/notifications${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-wwf-700">
          Centre de notifications
        </div>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tightest text-ink-900">
          Notifications
        </h1>
        <p className="text-sm text-ink-500">
          {all.length} évènement{all.length > 1 ? "s" : ""} · {unreadTotal} non
          lu{unreadTotal > 1 ? "s" : ""}. La version production relayera ces
          évènements par e-mail (SMTP) et SMS.
        </p>
      </div>

      <Card>
        <CardBody className="flex flex-wrap items-center gap-2">
          <Link
            href={makeHref({ kind: null })}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              !kind
                ? "border-wwf-300 bg-wwf-50 text-wwf-800"
                : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
            }`}
          >
            Tout ({all.length})
          </Link>
          {Object.entries(KIND_LABEL).map(([k, label]) => (
            <Link
              key={k}
              href={makeHref({ kind: k })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                kind === k
                  ? "border-wwf-300 bg-wwf-50 text-wwf-800"
                  : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
              }`}
            >
              {label} ({counts[k]})
            </Link>
          ))}
          <span className="mx-2 h-5 w-px bg-ink-200" />
          <Link
            href={makeHref({ unread: !onlyUnread, page: 1 })}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
              onlyUnread
                ? "border-wwf-300 bg-wwf-50 text-wwf-800"
                : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
            }`}
          >
            <Bell className="h-3 w-3" />
            Non lus uniquement
          </Link>
        </CardBody>
      </Card>

      {slice.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              title="Aucune notification dans ce filtre"
              description="Élargissez la sélection pour voir d'autres évènements."
              icon={Bell}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-5">
          {Array.from(groups.entries()).map(([day, items]) => (
            <Card key={day}>
              <CardHeader title={day} description={`${items.length} évènement(s)`} />
              <CardBody className="space-y-2">
                {items.map((n) => {
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
                        <div className="line-clamp-2 text-xs text-ink-600">
                          {n.body}
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] text-ink-400">
                        {relativeFromNow(n.timestamp)}
                      </span>
                    </Link>
                  );
                })}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-md border border-ink-200 bg-white px-4 py-2 text-xs text-ink-600">
          <span>
            Page {safePage} sur {totalPages} · {filtered.length} évènement(s)
          </span>
          <div className="flex gap-2">
            <Link
              href={makeHref({ page: Math.max(1, safePage - 1) })}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${
                safePage === 1
                  ? "pointer-events-none border-ink-100 text-ink-400"
                  : "border-ink-200 hover:bg-ink-50"
              }`}
            >
              <ChevronLeft className="h-3 w-3" />
              Précédent
            </Link>
            <Link
              href={makeHref({ page: Math.min(totalPages, safePage + 1) })}
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 ${
                safePage === totalPages
                  ? "pointer-events-none border-ink-100 text-ink-400"
                  : "border-ink-200 hover:bg-ink-50"
              }`}
            >
              Suivant
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-dashed border-wwf-200 bg-wwf-50/40 px-4 py-3 text-xs text-wwf-900">
        <strong>Canaux production :</strong> SMTP transactionnel, SMS pour les
        approbations urgentes, et webhooks pour intégration aux systèmes
        tiers. Les modèles d&apos;envoi sont configurés par
        l&apos;administrateur.
      </div>
    </div>
  );
}
