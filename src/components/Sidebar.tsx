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
  LucideIcon,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Role } from "@/lib/enums";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

// Per-role navigation. Each role sees only what its mandate allows;
// shared items have all roles listed.
const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Espace de travail",
    items: [
      {
        label: "Tableau de bord",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["REQUESTER", "MANAGER", "PROCUREMENT", "FINANCE", "AUDITOR", "ADMIN"],
      },
      {
        label: "Nouvelle réquisition",
        href: "/requisitions/new",
        icon: PlusCircle,
        roles: ["REQUESTER", "ADMIN"],
      },
      {
        label: "Mes réquisitions",
        href: "/requisitions?scope=mine",
        icon: FileText,
        roles: ["REQUESTER"],
      },
      {
        label: "Réquisitions",
        href: "/requisitions",
        icon: FileText,
        roles: ["MANAGER", "PROCUREMENT", "FINANCE", "AUDITOR", "ADMIN"],
      },
      {
        label: "File d'approbation",
        href: "/approvals",
        icon: Inbox,
        roles: ["MANAGER", "PROCUREMENT", "FINANCE", "ADMIN"],
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
        roles: ["REQUESTER", "MANAGER", "PROCUREMENT", "FINANCE", "AUDITOR", "ADMIN"],
      },
    ],
  },
  {
    title: "Achats",
    items: [
      {
        label: "Fournisseurs",
        href: "/suppliers",
        icon: Truck,
        roles: ["PROCUREMENT", "FINANCE", "AUDITOR", "ADMIN"],
      },
      {
        label: "Bons de commande",
        href: "/purchase-orders",
        icon: ClipboardList,
        roles: ["PROCUREMENT", "FINANCE", "AUDITOR", "ADMIN"],
      },
      {
        label: "Réceptions",
        href: "/receipts",
        icon: PackageCheck,
        roles: ["PROCUREMENT", "AUDITOR", "ADMIN"],
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Ledger budgétaire",
        href: "/finance/budget",
        icon: BarChart3,
        roles: ["FINANCE", "ADMIN"],
      },
      {
        label: "Cash-flow engagements",
        href: "/finance/cashflow",
        icon: BarChart3,
        roles: ["FINANCE", "ADMIN"],
      },
    ],
  },
  {
    title: "Pilotage",
    items: [
      {
        label: "Documents",
        href: "/documents",
        icon: FolderArchive,
        roles: ["REQUESTER", "MANAGER", "PROCUREMENT", "FINANCE", "AUDITOR", "ADMIN"],
      },
      {
        label: "Rapports",
        href: "/reports",
        icon: BarChart3,
        roles: ["MANAGER", "PROCUREMENT", "FINANCE", "AUDITOR", "ADMIN"],
      },
      {
        label: "Journal d'audit",
        href: "/audit",
        icon: ShieldCheck,
        roles: ["AUDITOR", "ADMIN"],
      },
    ],
  },
  {
    title: "Aide",
    items: [
      {
        label: "Manuel utilisateur",
        href: "/aide",
        icon: HelpCircle,
        roles: ["REQUESTER", "MANAGER", "PROCUREMENT", "FINANCE", "AUDITOR", "ADMIN"],
      },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Utilisateurs", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
      { label: "Paramètres", href: "/admin/settings", icon: Settings, roles: ["ADMIN"] },
    ],
  },
];

const ROLE_TINT: Record<Role, string> = {
  REQUESTER: "from-sky-600 to-sky-800",
  MANAGER: "from-amber-600 to-amber-800",
  PROCUREMENT: "from-purple-600 to-purple-800",
  FINANCE: "from-orange-600 to-orange-800",
  AUDITOR: "from-slate-600 to-slate-800",
  ADMIN: "from-wwf-600 to-wwf-800",
};

const ROLE_BADGE: Record<Role, string> = {
  REQUESTER: "Espace Demandeur",
  MANAGER: "Espace Manager",
  PROCUREMENT: "Espace Achats",
  FINANCE: "Espace Finance",
  AUDITOR: "Espace Audit (lecture seule)",
  ADMIN: "Console Administrateur",
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
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
          <div className="mt-1 truncate text-[11px] text-ink-500">
            WWF-RDC
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {SECTIONS.map((section) => {
          const items = section.items.filter((i) => i.roles.includes(role));
          if (items.length === 0) return null;
          return (
            <div key={section.title} className="mb-5">
              <div className="px-2 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {items.map((item) => {
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
          );
        })}
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
