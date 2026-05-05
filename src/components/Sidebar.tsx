"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Truck,
  ClipboardList,
  PackageCheck,
  BarChart3,
  ShieldCheck,
  Users,
  Settings,
  Bell,
  FolderArchive,
  PlusCircle,
  HelpCircle,
  Building2,
  PiggyBank,
  Wallet,
  LucideIcon,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/enums";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type Section = { title: string; items: NavItem[] };

// Each role gets its own curated, focused navigation. No more shared menus.
const NAV_BY_ROLE: Record<Role, Section[]> = {
  REQUESTER: [
    {
      title: "Espace de travail",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { label: "Nouvelle réquisition", href: "/requisitions/new", icon: PlusCircle },
        { label: "Mes réquisitions", href: "/requisitions?scope=mine", icon: FileText },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    {
      title: "Pilotage",
      items: [
        { label: "Mes documents", href: "/documents", icon: FolderArchive },
      ],
    },
    {
      title: "Aide",
      items: [{ label: "Manuel utilisateur", href: "/aide", icon: HelpCircle }],
    },
  ],
  MANAGER: [
    {
      title: "Espace de travail",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { label: "File d'approbation", href: "/approvals", icon: Inbox },
        { label: "Réquisitions", href: "/requisitions", icon: FileText },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    {
      title: "Pilotage",
      items: [
        { label: "Documents", href: "/documents", icon: FolderArchive },
        { label: "Rapports", href: "/reports", icon: BarChart3 },
      ],
    },
    {
      title: "Aide",
      items: [{ label: "Manuel utilisateur", href: "/aide", icon: HelpCircle }],
    },
  ],
  PROCUREMENT: [
    {
      title: "Espace de travail",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { label: "File d'approbation", href: "/approvals", icon: Inbox },
        { label: "Réquisitions", href: "/requisitions", icon: FileText },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    {
      title: "Achats",
      items: [
        { label: "Fournisseurs", href: "/suppliers", icon: Truck },
        { label: "Bons de commande", href: "/purchase-orders", icon: ClipboardList },
        { label: "Réceptions", href: "/receipts", icon: PackageCheck },
      ],
    },
    {
      title: "Pilotage",
      items: [
        { label: "Documents", href: "/documents", icon: FolderArchive },
        { label: "Rapports", href: "/reports", icon: BarChart3 },
      ],
    },
    {
      title: "Aide",
      items: [{ label: "Manuel utilisateur", href: "/aide", icon: HelpCircle }],
    },
  ],
  FINANCE: [
    {
      title: "Espace de travail",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { label: "File d'approbation", href: "/approvals", icon: Inbox },
        { label: "Réquisitions", href: "/requisitions", icon: FileText },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    {
      title: "Finance",
      items: [
        { label: "Grand livre budgétaire", href: "/finance/budget", icon: PiggyBank },
        { label: "Trésorerie engagements", href: "/finance/cashflow", icon: Wallet },
      ],
    },
    {
      title: "Pilotage",
      items: [
        { label: "Documents", href: "/documents", icon: FolderArchive },
        { label: "Rapports", href: "/reports", icon: BarChart3 },
      ],
    },
    {
      title: "Aide",
      items: [{ label: "Manuel utilisateur", href: "/aide", icon: HelpCircle }],
    },
  ],
  AUDITOR: [
    {
      title: "Espace de travail",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { label: "Réquisitions", href: "/requisitions", icon: FileText },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    {
      title: "Conformité",
      items: [
        { label: "Journal d'audit", href: "/audit", icon: ShieldCheck },
        { label: "Documents", href: "/documents", icon: FolderArchive },
        { label: "Rapports", href: "/reports", icon: BarChart3 },
      ],
    },
    {
      title: "Aide",
      items: [{ label: "Manuel utilisateur", href: "/aide", icon: HelpCircle }],
    },
  ],
  ADMIN: [
    {
      title: "Espace de travail",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
        { label: "Réquisitions", href: "/requisitions", icon: FileText },
        { label: "File d'approbation", href: "/approvals", icon: Inbox },
        { label: "Notifications", href: "/notifications", icon: Bell },
      ],
    },
    {
      title: "Achats (oversight)",
      items: [
        { label: "Fournisseurs", href: "/suppliers", icon: Truck },
        { label: "Bons de commande", href: "/purchase-orders", icon: ClipboardList },
        { label: "Réceptions", href: "/receipts", icon: PackageCheck },
      ],
    },
    {
      title: "Pilotage",
      items: [
        { label: "Documents", href: "/documents", icon: FolderArchive },
        { label: "Rapports", href: "/reports", icon: BarChart3 },
        { label: "Journal d'audit", href: "/audit", icon: ShieldCheck },
      ],
    },
    {
      title: "Administration",
      items: [
        { label: "Utilisateurs", href: "/admin/users", icon: Users },
        { label: "Départements", href: "/admin/departments", icon: Building2 },
        { label: "Paramètres", href: "/admin/settings", icon: Settings },
      ],
    },
    {
      title: "Aide",
      items: [{ label: "Manuel utilisateur", href: "/aide", icon: HelpCircle }],
    },
  ],
};

const ROLE_TINT: Record<Role, string> = {
  REQUESTER: "from-sky-600 to-sky-800",
  MANAGER: "from-amber-600 to-amber-800",
  PROCUREMENT: "from-purple-600 to-purple-800",
  FINANCE: "from-orange-600 to-orange-800",
  AUDITOR: "from-slate-600 to-slate-800",
  ADMIN: "from-wwf-600 to-wwf-800",
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const sections = NAV_BY_ROLE[role];
  return (
    <aside className="hidden w-64 shrink-0 border-r border-ink-200 bg-gradient-to-b from-white to-ink-50/30 lg:flex lg:flex-col">
      <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-5">
        <div
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br text-white shadow-soft ring-1 ring-black/5",
            ROLE_TINT[role],
          )}
        >
          <Leaf className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <div className="font-serif text-base font-semibold leading-none tracking-tight text-ink-900">
            ProcureFlow
          </div>
          <div className="mt-1 truncate text-[11px] text-ink-500">WWF-RDC</div>
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
                  (cleanHref !== "/dashboard" &&
                    cleanHref !== "/requisitions/new" &&
                    pathname.startsWith(cleanHref));
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
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-500">
          Tech Solutions Congo
        </div>
        <div className="mt-0.5 text-[11px] text-ink-700">
          Plateforme institutionnelle WWF-RDC
        </div>
      </div>
    </aside>
  );
}
