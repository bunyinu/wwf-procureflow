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
      title: "e-Procurement",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: FileText },
        { label: "Mes réquisitions", href: "/workspaces/requester", icon: FileSignature },
        { label: "Nouvelle réquisition", href: "/requisitions/new", icon: FileSignature },
        { label: "Mes brouillons", href: "/requisitions?scope=mine&status=DRAFT", icon: FileText },
        { label: "Mes documents", href: "/requisitions?scope=mine", icon: FolderArchive },
        { label: "Mes commentaires", href: "/notifications", icon: Bell },
      ],
    },
    { title: "Profil", items: [{ label: "Profil", href: "/aide", icon: HelpCircle }] },
  ],
  APPROVER: [
    {
      title: "e-Procurement",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: FileText },
        { label: "File d'approbation", href: "/workspaces/approver", icon: Inbox },
        { label: "Mes décisions", href: "/approvals", icon: FileText },
        { label: "Suivi des SLA", href: "/reports", icon: BarChart3 },
        { label: "Réquisitions", href: "/requisitions", icon: FileText },
        { label: "Rapports", href: "/reports", icon: BarChart3 },
        { label: "Paramètres", href: "/aide", icon: Settings },
      ],
    },
  ],
  PROCUREMENT: [
    {
      title: "e-Procurement",
      items: [
        { label: "Tableau de bord", href: "/dashboard", icon: FileText },
        { label: "Réquisitions approuvées", href: "/workspaces/procurement", icon: ClipboardList },
        { label: "Plan de passation", href: "/procurement", icon: ClipboardList },
        { label: "Demande de cotations / AO", href: "/procurement", icon: FileSignature },
        { label: "Analyse des offres", href: "/procurement", icon: FileText },
        { label: "Commandes (PO)", href: "/purchase-orders", icon: ClipboardList },
        { label: "Suivi des marchés", href: "/purchase-orders", icon: BarChart3 },
        { label: "Fournisseurs", href: "/suppliers", icon: Truck },
        { label: "Rapports", href: "/reports", icon: BarChart3 },
        { label: "Paramètres", href: "/aide", icon: Settings },
      ],
    },
  ],
  SUPPLIER_MANAGER: [
    {
      title: "e-Procurement",
      items: [
        { label: "Fournisseurs", href: "/workspaces/supplier-manager", icon: Truck },
        { label: "Préqualification", href: "/suppliers", icon: ShieldCheck },
        { label: "Documents", href: "/documents", icon: FolderArchive },
        { label: "Évaluations", href: "/suppliers", icon: BarChart3 },
        { label: "Commandes", href: "/purchase-orders", icon: ClipboardList },
        { label: "Historique", href: "/audit", icon: FileText },
        { label: "Paramètres", href: "/aide", icon: Settings },
      ],
    },
  ],
  RECEIVER: [
    {
      title: "e-Procurement",
      items: [
        { label: "Fournisseur", href: "/suppliers", icon: Truck },
        { label: "Réceptions en attente", href: "/workspaces/receiver", icon: PackageCheck },
        { label: "Réceptions (GRN/SAN)", href: "/receipts", icon: PackageCheck },
        { label: "Réceptions effectuées", href: "/receipts", icon: FileText },
        { label: "Rapports", href: "/reports", icon: BarChart3 },
        { label: "Paramètres", href: "/aide", icon: Settings },
      ],
    },
  ],
  AUDITOR: [
    {
      title: "e-Procurement",
      items: [
        { label: "Recherche globale", href: "/workspaces/archive-audit", icon: ShieldCheck },
        { label: "Réquisitions", href: "/requisitions", icon: FileText },
        { label: "Fournisseurs", href: "/suppliers", icon: Truck },
        { label: "Documents", href: "/documents", icon: FolderArchive },
        { label: "Audit & Traçabilité", href: "/audit", icon: ShieldCheck },
        { label: "Journaux d'accès", href: "/audit", icon: FileText },
        { label: "Exports & Rapports", href: "/reports", icon: BarChart3 },
        { label: "Paramètres", href: "/aide", icon: Settings },
      ],
    },
  ],
  REPORTING: [
    {
      title: "e-Procurement",
      items: [
        { label: "Tableau de bord", href: "/workspaces/reporting", icon: BarChart3 },
        { label: "KPIs", href: "/reports", icon: BarChart3 },
        { label: "Réquisitions", href: "/requisitions", icon: FileText },
        { label: "Fournisseurs", href: "/suppliers", icon: Truck },
        { label: "Commandes (PO)", href: "/purchase-orders", icon: ClipboardList },
        { label: "Délais & SLA", href: "/reports", icon: BarChart3 },
        { label: "Rapports", href: "/reports", icon: FileText },
        { label: "Exports", href: "/api/export/requisitions", icon: FolderArchive },
        { label: "Paramètres", href: "/aide", icon: Settings },
      ],
    },
  ],
  ADMIN: [
    {
      title: "e-Procurement",
      items: [
        { label: "Utilisateurs", href: "/workspaces/admin", icon: Users },
        { label: "Rôles & Droits", href: "/admin/users", icon: ShieldCheck },
        { label: "Matrice permissions", href: "/admin/settings", icon: Settings },
        { label: "Départements", href: "/admin/departments", icon: Building2 },
        { label: "Projets", href: "/admin/projects", icon: FolderArchive },
        { label: "Lignes budgétaires", href: "/admin/budget-lines", icon: PiggyBank },
        { label: "Seuils d'approbation", href: "/admin/settings", icon: BarChart3 },
        { label: "Règles de workflow", href: "/admin/settings", icon: ClipboardList },
        { label: "Données de référence", href: "/admin/projects", icon: FileText },
        { label: "Paramètres système", href: "/admin/settings", icon: Settings },
        { label: "Journaux système", href: "/audit", icon: FileText },
      ],
    },
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
    <aside className="hidden w-[226px] shrink-0 border-r border-[#08284d] bg-[#031f3d] text-white shadow-[18px_0_50px_-42px_rgba(15,23,42,0.8)] lg:flex lg:flex-col">
      <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">
        <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-soft ring-1 ring-white/20",
            ROLE_TINT[role],
          )}
        >
          <WorkspaceIcon className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold leading-none tracking-tight text-white">
            e-Procurement
          </div>
          <div className="mt-1 truncate text-[11px] text-white/58">
            {workspace.shortTitle}
          </div>
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
                        "group flex items-center gap-2.5 rounded-md px-3 py-2 text-[12px] transition-colors",
                        active
                          ? "bg-[#0b62c8] font-semibold text-white shadow-soft"
                          : "text-white/78 hover:bg-white/[0.08] hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-white"
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
        <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-white/45">
          <Leaf className="h-3 w-3 text-wwf-300" /> WWF-RDC
        </div>
      </div>
    </aside>
  );
}
