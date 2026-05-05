import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileSignature,
  Inbox,
  Leaf,
  Lock,
  PackageCheck,
  Settings,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { CongoMotif } from "@/components/CongoMotif";
import { loginAction, quickLoginAction } from "@/app/(auth)/actions";

type Account = {
  role: string;
  scope: string;
  email: string;
  icon: LucideIcon;
  tint: string; // gradient classes
};

const accounts: Account[] = [
  {
    role: "Demandeur",
    scope: "Création et soumission",
    email: "requester@tsc.demo",
    icon: FileSignature,
    tint: "from-sky-500 to-sky-700",
  },
  {
    role: "Approbateur Hiérarchique",
    scope: "Validation selon les seuils",
    email: "approver@tsc.demo",
    icon: Inbox,
    tint: "from-amber-500 to-amber-700",
  },
  {
    role: "Officier Achats",
    scope: "Classification & marchés",
    email: "procurement@tsc.demo",
    icon: ClipboardList,
    tint: "from-purple-500 to-purple-700",
  },
  {
    role: "Gestionnaire Fournisseurs",
    scope: "Préqualification & diligence",
    email: "supplier@tsc.demo",
    icon: Truck,
    tint: "from-rose-500 to-rose-700",
  },
  {
    role: "Réceptionnaire",
    scope: "GRN / SAN",
    email: "receiver@tsc.demo",
    icon: PackageCheck,
    tint: "from-teal-500 to-teal-700",
  },
  {
    role: "Officier Documents & Audit",
    scope: "Archivage & traçabilité",
    email: "audit@tsc.demo",
    icon: ShieldCheck,
    tint: "from-slate-500 to-slate-700",
  },
  {
    role: "Responsable Reporting",
    scope: "KPI & exports",
    email: "reporting@tsc.demo",
    icon: BarChart3,
    tint: "from-indigo-500 to-indigo-700",
  },
  {
    role: "Administrateur",
    scope: "Référentiels & paramètres",
    email: "admin@tsc.demo",
    icon: Settings,
    tint: "from-wwf-600 to-wwf-800",
  },
];

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const hasError = searchParams.error === "1";
  return (
    <div className="grid min-h-screen lg:grid-cols-12">
      {/* LEFT — credentials form */}
      <section className="relative col-span-12 flex flex-col justify-center px-8 py-12 lg:col-span-5 lg:px-16">
        <Link
          href="/demo"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-wwf-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la présentation
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-wwf-700 to-wwf-900 text-white shadow-soft">
            <Leaf className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <div className="font-serif text-lg font-semibold tracking-tight text-ink-900">
              ProcureFlow
            </div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-500">
              WWF-RDC · Plateforme institutionnelle
            </div>
          </div>
        </div>

        <h1 className="mt-10 font-serif text-[34px] font-semibold leading-[1.05] tracking-tightest text-ink-900">
          Bienvenue.
        </h1>
        <p className="mt-3 max-w-sm text-sm text-ink-600">
          Connectez-vous avec vos identifiants ou choisissez l&apos;un des
          huit rôles à droite pour explorer la plateforme.
        </p>

        <form action={loginAction} className="mt-8 max-w-sm space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-500">
              Adresse e-mail
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue="requester@tsc.demo"
              className="mt-1.5 block w-full rounded-md border border-ink-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-wwf-500 focus:ring-2 focus:ring-wwf-200"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-500">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              defaultValue="demo123"
              className="mt-1.5 block w-full rounded-md border border-ink-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-wwf-500 focus:ring-2 focus:ring-wwf-200"
            />
          </div>
          {hasError ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
              Identifiants invalides ou compte désactivé.
            </div>
          ) : null}
          <button
            type="submit"
            className="lift inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-wwf-700 to-wwf-800 px-4 py-3 text-sm font-medium text-white shadow-soft hover:from-wwf-800 hover:to-wwf-900"
          >
            Se connecter
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-12 flex items-center gap-2 border-t border-ink-200 pt-5 text-[11px] text-ink-500">
          <Lock className="h-3.5 w-3.5" />
          Démonstration — la production utilisera Keycloak (SSO + MFA).
        </div>
      </section>

      {/* RIGHT — role grid */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-wwf-700 via-wwf-800 to-wwf-950 px-12 py-14 text-white lg:col-span-7 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] opacity-25">
          <CongoMotif className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[440px] w-[440px] opacity-15">
          <CongoMotif className="h-full w-full" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-wwf-50">
            8 rôles · 8 espaces de travail
          </div>
          <h2 className="mt-5 max-w-xl font-serif text-[40px] font-semibold leading-[1.05] tracking-tightest">
            Une interface dédiée à chaque maillon du cycle d&apos;achat.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-wwf-100">
            Aligné sur les modules fonctionnels du TDR §4. Chaque rôle voit
            uniquement ce qu&apos;il doit voir, et le dossier circule de bout
            en bout sans rupture.
          </p>
        </div>

        <div className="relative mt-10 grid flex-1 grid-cols-1 gap-3 xl:grid-cols-2">
          {accounts.map((a) => {
            const Icon = a.icon;
            return (
              <form
                key={a.email}
                action={quickLoginAction}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                <input type="hidden" name="email" value={a.email} />
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${a.tint} text-white shadow-soft`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold leading-tight">
                      {a.role}
                    </div>
                    <div className="mt-0.5 text-[11px] text-wwf-100/85">
                      {a.scope}
                    </div>
                    <div className="mt-2 font-mono text-[10.5px] text-wwf-200/75">
                      {a.email}
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-[11.5px] font-medium text-white transition group-hover:bg-white/20"
                >
                  Connexion d&apos;un clic
                  <ArrowRight className="h-3 w-3" />
                </button>
              </form>
            );
          })}
        </div>

        <div className="relative mt-8 flex items-center gap-3 border-t border-white/10 pt-5 text-[11px] text-wwf-100/85">
          <ShieldCheck className="h-4 w-4 text-wwf-200" />
          Données fictives — toutes les actions sont consignées au journal
          d&apos;audit. Mot de passe commun :{" "}
          <span className="font-mono text-white">demo123</span>.
        </div>
      </aside>
    </div>
  );
}
