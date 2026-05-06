"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileSignature,
  FileText,
  FolderArchive,
  HelpCircle,
  Inbox,
  Leaf,
  LucideIcon,
  PackageCheck,
  PiggyBank,
  Settings,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/enums";
import { WORKSPACE_BY_ROLE } from "@/lib/workspaces";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type Section = { title: string; items: NavItem[] };

const WORKSPACE_ICON: Record<Role, LucideIcon> = {
  REQUESTER: FileSignature,
  APPROVER: Inbox,
  PROCUREMENT: ClipboardList,
  SUPPLIER_MANAGER: Truck,
  RECEIVER: PackageCheck,
  AUDITOR: ShieldCheck,
  REPORTING: BarChart3,
  ADMIN: Settings,
};

// Strict per-role workspace navigation. This is not a dashboard role filter:
// every role enters its own /workspaces/* route and only sees the modules it owns.
const NAV_BY_ROLE: Record<Role, Section[]> = {
  REQUESTER: [
    {
      title: "Requester Workspace",
      items: [
        { label: "Requester Workspace", href: "/workspaces/requester", icon: FileSignature },
        { label: "New Requisition", href: "/requisitions/new", icon: FileSignature },
        { label: "My requests", href: "/requisitions?scope=mine", icon: FileText },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    { title: "Support", items: [{ label: "User manual", href: "/aide", icon: HelpCircle }] },
  ],
  APPROVER: [
    {
      title: "Approver Workspace",
      items: [
        { label: "Approver Workspace", href: "/workspaces/approver", icon: Inbox },
        { label: "Approval queue", href: "/approvals", icon: Inbox },
        { label: "Decision history", href: "/requisitions", icon: FileText },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    { title: "Support", items: [{ label: "User manual", href: "/aide", icon: HelpCircle }] },
  ],
  PROCUREMENT: [
    {
      title: "Procurement Workspace",
      items: [
        { label: "Procurement Workspace", href: "/workspaces/procurement", icon: ClipboardList },
        { label: "Process board", href: "/procurement", icon: ClipboardList },
        { label: "Order tracking", href: "/purchase-orders", icon: ClipboardList },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    { title: "Support", items: [{ label: "User manual", href: "/aide", icon: HelpCircle }] },
  ],
  SUPPLIER_MANAGER: [
    {
      title: "Supplier Workspace",
      items: [
        { label: "Supplier Workspace", href: "/workspaces/supplier-manager", icon: Truck },
        { label: "Supplier registry", href: "/suppliers", icon: Truck },
        { label: "Linked orders", href: "/purchase-orders", icon: ClipboardList },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    { title: "Support", items: [{ label: "User manual", href: "/aide", icon: HelpCircle }] },
  ],
  RECEIVER: [
    {
      title: "Receiver Workspace",
      items: [
        { label: "Receiver Workspace", href: "/workspaces/receiver", icon: PackageCheck },
        { label: "Pending receptions", href: "/receipts", icon: PackageCheck },
        { label: "Purchase orders", href: "/purchase-orders", icon: ClipboardList },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    { title: "Support", items: [{ label: "User manual", href: "/aide", icon: HelpCircle }] },
  ],
  AUDITOR: [
    {
      title: "Archive & Audit Workspace",
      items: [
        { label: "Archive & Audit", href: "/workspaces/archive-audit", icon: ShieldCheck },
        { label: "Global documents", href: "/documents", icon: FolderArchive },
        { label: "Immutable audit log", href: "/audit", icon: ShieldCheck },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    { title: "Support", items: [{ label: "User manual", href: "/aide", icon: HelpCircle }] },
  ],
  REPORTING: [
    {
      title: "Reporting Workspace",
      items: [
        { label: "Reporting Workspace", href: "/workspaces/reporting", icon: BarChart3 },
        { label: "Reports & exports", href: "/reports", icon: BarChart3 },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    { title: "Support", items: [{ label: "User manual", href: "/aide", icon: HelpCircle }] },
  ],
  ADMIN: [
    {
      title: "Admin Workspace",
      items: [
        { label: "Admin Workspace", href: "/workspaces/admin", icon: Settings },
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Departments", href: "/admin/departments", icon: Building2 },
        { label: "Projects", href: "/admin/projects", icon: FolderArchive },
        { label: "Budget lines", href: "/admin/budget-lines", icon: PiggyBank },
        { label: "Workflow rules", href: "/admin/settings", icon: Settings },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    { title: "Support", items: [{ label: "User manual", href: "/aide", icon: HelpCircle }] },
  ],
};

const ROLE_TINT: Record<Role, string> = {
  REQUESTER: "from-sky-600 to-sky-800",
  APPROVER: "from-amber-600 to-amber-800",
  PROCUREMENT: "from-wwf-600 to-wwf-800",
  SUPPLIER_MANAGER: "from-rose-600 to-rose-800",
  RECEIVER: "from-teal-600 to-teal-800",
  AUDITOR: "from-slate-600 to-slate-800",
  REPORTING: "from-indigo-600 to-indigo-800",
  ADMIN: "from-wwf-600 to-wwf-800",
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const sections = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.REQUESTER;
  const workspace = WORKSPACE_BY_ROLE[role];
  const WorkspaceIcon = WORKSPACE_ICON[role];

  return (
    <aside className="hidden w-[278px] shrink-0 border-r border-white/10 bg-[#101811] text-white shadow-[18px_0_50px_-42px_rgba(15,23,42,0.8)] lg:flex lg:flex-col">
      <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-wwf-500/15 blur-3xl" />
        <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft ring-1 ring-white/20",
            ROLE_TINT[role],
          )}
        >
          <WorkspaceIcon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <div className="text-base font-semibold leading-none tracking-tight text-white">
            ProcureFlow
          </div>
          <div className="mt-1 truncate text-[11px] text-white/58">
            {workspace.shortTitle} · workspace {workspace.number}
          </div>
        </div>
        </div>
        <div className="relative mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-wwf-100/75">
            Separate route
          </div>
          <div className="mt-1 truncate text-xs text-white/78">
            {workspace.path}
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <div className="px-2 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/38">
              {section.title}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const cleanHref = item.href.split("?")[0];
                const active =
                  pathname === cleanHref ||
                  (cleanHref !== "/" && pathname.startsWith(cleanHref));
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-white font-semibold text-wwf-900 shadow-soft ring-1 ring-white/70"
                          : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-wwf-700"
                            : "text-white/38 group-hover:text-white/70",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <div className="gold-rule mb-3" />
        <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-white/45">
          <Leaf className="h-3 w-3 text-wwf-300" /> WWF-RDC
        </div>
      </div>
    </aside>
  );
}
