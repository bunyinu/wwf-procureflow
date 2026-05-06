import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import { ROLE_LABELS } from "@/lib/workflow";
import type { Role } from "@/lib/enums";
import { logoutAction } from "@/app/(auth)/actions";

export function Topbar({
  fullName,
  role,
  unreadCount,
}: {
  fullName: string;
  role: Role;
  email: string;
  unreadCount: number;
}) {
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <header className="sticky top-0 z-20 flex h-[66px] items-center justify-between border-b border-[#dbe3ef] bg-white px-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold leading-tight text-[#0f2945]">
          Bienvenue, {fullName}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500">{ROLE_LABELS[role]}</div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-white text-slate-500 hover:border-[#dbe3ef] hover:text-blue-700"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#061d39] text-[11px] font-bold text-white ring-2 ring-white">
          {initials}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-white text-slate-500 hover:border-[#dbe3ef] hover:text-[#0f2945]"
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
