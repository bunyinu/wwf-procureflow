import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Leaf,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CongoMotif } from "@/components/CongoMotif";
import { loginAction, quickLoginAction } from "@/app/(auth)/actions";

const demoAccounts = [
  { role: "Demandeur", email: "requester@tsc.demo" },
  { role: "Manager Approbateur", email: "manager@tsc.demo" },
  { role: "Officier Achats", email: "procurement@tsc.demo" },
  { role: "Approbateur Finance", email: "finance@tsc.demo" },
  { role: "Auditeur", email: "auditor@tsc.demo" },
  { role: "Administrateur", email: "admin@tsc.demo" },
];

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const hasError = searchParams.error === "1";
  return (
    <div className="grid min-h-screen lg:grid-cols-5">
      <section className="relative col-span-2 flex flex-col justify-center px-8 py-12 lg:px-14">
        <Link
          href="/demo"
          className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-wwf-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la présentation
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br from-wwf-600 to-wwf-800 text-white shadow-sm">
            <Leaf className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <div className="text-base font-semibold text-ink-900">
              ProcureFlow
            </div>
            <div className="text-xs text-ink-500">WWF-RDC · Connexion</div>
          </div>
        </div>

        <h1 className="mt-9 text-3xl font-semibold tracking-tight text-ink-900">
          Connexion à la démonstration
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-600">
          Saisissez vos identifiants ou utilisez la connexion rapide d&apos;un
          clic à droite.
        </p>

        <form action={loginAction} className="mt-8 max-w-sm space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-ink-700"
            >
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue="requester@tsc.demo"
              className="mt-1 block w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-wwf-500 focus:ring-2 focus:ring-wwf-200"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-ink-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="demo123"
              className="mt-1 block w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-wwf-500 focus:ring-2 focus:ring-wwf-200"
            />
          </div>
          {hasError ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 ring-1 ring-red-200">
              Identifiants invalides ou compte désactivé.
            </div>
          ) : null}
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-wwf-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-wwf-800"
          >
            Se connecter
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-12 flex items-center gap-3 border-t border-ink-200 pt-5 text-[11px] text-ink-500">
          <Lock className="h-3.5 w-3.5" />
          Démonstration locale — la production utilisera Keycloak (SSO + MFA).
        </div>
      </section>

      <aside className="relative col-span-3 hidden overflow-hidden bg-gradient-to-br from-wwf-700 via-wwf-800 to-wwf-950 px-12 py-14 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-20 -top-20 h-[520px] w-[520px] opacity-25">
          <CongoMotif className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-[440px] w-[440px] opacity-15">
          <CongoMotif className="h-full w-full" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-wwf-50">
            <Sparkles className="h-3 w-3" />
            Prototype fonctionnel illustratif
          </div>
          <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Choisissez un rôle pour explorer la plateforme
          </h2>
          <p className="mt-3 max-w-md text-sm text-wwf-100">
            Chaque rôle voit une interface adaptée à ses responsabilités.
            Toutes les transitions de statut sont vérifiées côté serveur,
            chaque action est consignée au journal d&apos;audit.
          </p>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-2.5 xl:grid-cols-2">
          {demoAccounts.map((a) => (
            <form
              key={a.email}
              action={quickLoginAction}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur transition hover:bg-white/10"
            >
              <div>
                <div className="text-sm font-medium">{a.role}</div>
                <div className="font-mono text-[11px] text-wwf-200">
                  {a.email}
                </div>
              </div>
              <input type="hidden" name="email" value={a.email} />
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/25"
              >
                Connexion
                <ArrowRight className="h-3 w-3" />
              </button>
            </form>
          ))}
        </div>

        <div className="relative mt-auto flex items-center gap-3 pt-10 text-xs text-wwf-100/90">
          <ShieldCheck className="h-4 w-4 text-wwf-200" />
          Toutes les données présentées sont fictives — usage démonstration
          uniquement.
        </div>
      </aside>
    </div>
  );
}
