import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { ROLE_LABELS } from "@/lib/workflow";
import type { Role } from "@/lib/enums";
import { logoutAction } from "@/app/(auth)/actions";

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
  return (
    <header className="sticky top-0 z-20 flex h-[66px] items-center justify-between border-b border-slate-200 bg-white px-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-[#0f2945]">
            Bienvenue, {fullName}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">{ROLE_LABELS[role]}</div>
        </div>
        <span
          className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 lg:inline-flex ${ROLE_ACCENT[role]}`}
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
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
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
          <div className="text-[12px] font-semibold leading-tight text-[#0f2945]">
            {email}
          </div>
          <div className="text-[10px] text-slate-500">Session sécurisée</div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#061d39] text-[11px] font-bold text-white ring-2 ring-white">
          {fullName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </form>
      </div>
    </header>
  );
}
