import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileSignature,
  Inbox,
  Lock,
  PackageCheck,
  Settings,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { loginAction, quickLoginAction } from "@/app/(auth)/actions";

type Account = {
  role: string;
  scope: string;
  email: string;
  icon: LucideIcon;
};

const accounts: Account[] = [
  { role: "Demandeur", scope: "Création et soumission", email: "requester@tsc.demo", icon: FileSignature },
  { role: "Approbateur Hiérarchique", scope: "Validation selon les seuils", email: "approver@tsc.demo", icon: Inbox },
  { role: "Officier Achats", scope: "Classification & marchés", email: "procurement@tsc.demo", icon: ClipboardList },
  { role: "Gestionnaire Fournisseurs", scope: "Préqualification & diligence", email: "supplier@tsc.demo", icon: Truck },
  { role: "Réceptionnaire", scope: "GRN / SAN", email: "receiver@tsc.demo", icon: PackageCheck },
  { role: "Officier Documents & Audit", scope: "Archivage & traçabilité", email: "audit@tsc.demo", icon: ShieldCheck },
  { role: "Responsable Reporting", scope: "KPI & exports", email: "reporting@tsc.demo", icon: BarChart3 },
  { role: "Administrateur", scope: "Référentiels & paramètres", email: "admin@tsc.demo", icon: Settings },
];

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const hasError = searchParams.error === "1";
  return (
    <div className="grid min-h-screen bg-[#f5f8fb] lg:grid-cols-12">
      <section className="col-span-12 flex flex-col justify-center px-8 py-10 lg:col-span-5 lg:px-16">
        <Link href="/demo" className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700">
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f0c94b]/45 bg-[#062c55] text-[#f0c94b]">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-[#0f2945]">e-Procurement</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">WWF-RDC · ProcureFlow</div>
          </div>
        </div>

        <h1 className="mt-9 text-[34px] font-bold leading-tight tracking-tight text-[#0f2945]">Connexion</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
          Connectez-vous ou sélectionnez directement un rôle de démonstration.
        </p>

        <form action={loginAction} className="mt-8 max-w-sm space-y-4 rounded-[4px] border border-[#dbe3ef] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#0f2945]">Adresse e-mail</label>
            <input name="email" type="email" required autoComplete="email" defaultValue="requester@tsc.demo" className="mt-1.5 block w-full rounded-[4px] border border-[#dbe3ef] bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#0f2945]">Mot de passe</label>
            <input name="password" type="password" required defaultValue="demo123" className="mt-1.5 block w-full rounded-[4px] border border-[#dbe3ef] bg-white px-3 py-2 text-sm" />
          </div>
          {hasError ? <div className="rounded-[4px] bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">Identifiants invalides ou compte désactivé.</div> : null}
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#0b62c8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0957b3]">
            Se connecter
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-500">
          <Lock className="h-3.5 w-3.5" />
          Démonstration — mot de passe commun : <span className="font-mono text-[#0f2945]">demo123</span>
        </div>
      </section>

      <aside className="hidden bg-[#031f3d] px-10 py-10 text-white lg:col-span-7 lg:flex lg:flex-col">
        <div className="rounded-[4px] border border-white/10 bg-[#062c55] px-4 py-1.5 text-center text-[13px] font-bold uppercase tracking-wide text-white">
          8 RÔLES · 8 WORKSPACES DISTINCTS
        </div>
        <div className="mt-8">
          <h2 className="max-w-xl text-[34px] font-bold leading-tight">Choisir un workspace</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Chaque rôle ouvre sa propre route et ne voit que son périmètre fonctionnel.</p>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-1 gap-3 xl:grid-cols-2">
          {accounts.map((account) => {
            const Icon = account.icon;
            return (
              <form key={account.email} action={quickLoginAction} className="rounded-[4px] border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.07]">
                <input type="hidden" name="email" value={account.email} />
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#0b62c8] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold leading-tight">{account.role}</div>
                    <div className="mt-0.5 text-[11px] text-white/70">{account.scope}</div>
                    <div className="mt-2 font-mono text-[10.5px] text-white/55">{account.email}</div>
                  </div>
                </div>
                <button type="submit" className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-[4px] bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-white/20">
                  Connexion d&apos;un clic
                  <ArrowRight className="h-3 w-3" />
                </button>
              </form>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
