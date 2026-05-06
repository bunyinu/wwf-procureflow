import Link from "next/link";
import { Bell, Leaf, LogOut, ShieldCheck } from "lucide-react";
import { ROLE_LABELS } from "@/lib/workflow";
import type { Role } from "@/lib/enums";
import { logoutAction } from "@/app/(auth)/actions";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";

const ROLE_ACCENT: Record<Role, string> = {
  REQUESTER: "bg-sky-50 text-sky-700 ring-sky-100",
  APPROVER: "bg-amber-50 text-amber-700 ring-amber-100",
  PROCUREMENT: "bg-purple-50 text-purple-700 ring-purple-100",
  SUPPLIER_MANAGER: "bg-rose-50 text-rose-700 ring-rose-100",
  RECEIVER: "bg-teal-50 text-teal-700 ring-teal-100",
  AUDITOR: "bg-slate-50 text-slate-700 ring-slate-200",
  REPORTING: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  ADMIN: "bg-wwf-50 text-wwf-700 ring-wwf-100",
};

export function Topbar({
  fullName,
  role,
  email,
  unreadCount,
}: {
  fullName: string;
  role: Role;
  email: string;
  unreadCount: number;
}) {
  const workspace = WORKSPACE_BY_ROLE[role];
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-ink-200/70 bg-white/76 px-5 backdrop-blur-xl supports-[backdrop-filter]:bg-white/66">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-wwf-900 text-white shadow-soft ring-1 ring-white/70 lg:hidden">
          <Leaf className="h-4 w-4" />
        </span>
        <div className="hidden min-w-0 lg:block">
          <div className="truncate text-sm font-semibold text-ink-950">
            {workspace.title}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-500">
            <ShieldCheck className="h-3 w-3 text-wwf-700" />
            Route séparée · droits appliqués côté serveur · audit actif
          </div>
        </div>
        <span
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 xl:inline-flex ${ROLE_ACCENT[role]}`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
            aria-hidden
          />
          {ROLE_LABELS[role]}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="lift relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-200 bg-white text-ink-600 hover:border-wwf-300 hover:text-wwf-700"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Link>
        <div className="hidden text-right md:block">
          <div className="text-sm font-medium leading-tight text-ink-800">
            {fullName}
          </div>
          <div className="text-[11px] text-ink-500">{email}</div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-wwf-100 to-wwf-200 text-sm font-semibold text-wwf-800 ring-1 ring-wwf-200">
          {fullName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="lift flex items-center gap-1.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </form>
      </div>
    </header>
  );
}
