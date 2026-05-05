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
  PROCUREMENT: "from-purple-600 to-purple-800",
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
    <aside className="hidden w-64 shrink-0 border-r border-ink-200 bg-gradient-to-b from-white to-ink-50/30 lg:flex lg:flex-col">
      <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-5">
        <div
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br text-white shadow-soft ring-1 ring-black/5",
            ROLE_TINT[role],
          )}
        >
          <WorkspaceIcon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <div className="font-serif text-base font-semibold leading-none tracking-tight text-ink-900">
            ProcureFlow
          </div>
          <div className="mt-1 truncate text-[11px] text-ink-500">
            {workspace.shortTitle} · workspace {workspace.number}
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <div className="px-2 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-400">
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
                        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                        active
                          ? "bg-white font-medium text-wwf-800 shadow-soft ring-1 ring-wwf-100"
                          : "text-ink-700 hover:bg-white/60 hover:text-ink-900",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-wwf-700"
                            : "text-ink-400 group-hover:text-ink-600",
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
      <div className="border-t border-ink-100 px-5 py-4">
        <div className="gold-rule mb-3" />
        <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
          <Leaf className="h-3 w-3" /> WWF-RDC
        </div>
        <div className="mt-0.5 text-[11px] text-ink-700">
          8 separate workspaces · no role-filter dashboard
        </div>
      </div>
    </aside>
  );
}
