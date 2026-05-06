import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { WWF_TDR } from "@/lib/tdr";

const workspaces = [
  "Demandeur",
  "Approbateur hiérarchique",
  "Officier Achats",
  "Gestionnaire fournisseurs",
  "Réceptionnaire",
  "Archive & Audit",
  "Reporting",
  "Admin",
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#f5f8fb] text-[#0f2945]">
      <header className="border-b border-[#dbe3ef] bg-[#031f3d] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/demo" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#f0c94b]/45 bg-[#062c55] text-[#f0c94b]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold">e-Procurement</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-[4px] bg-[#0b62c8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0957b3]"
          >
            Se connecter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="overflow-hidden rounded-[4px] border border-[#dbe3ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
          <div className="bg-[#062c55] px-4 py-1.5 text-center text-[13px] font-bold uppercase tracking-wide text-white">
            ProcureFlow · WWF-RDC
          </div>
          <div className="grid gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">
                Plateforme institutionnelle de gestion des achats
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-[#0f2945] sm:text-5xl">
                8 workspaces séparés. Circuit d’achat complet.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Réquisition, validation hiérarchique, achats, fournisseurs,
                réception GRN/SAN, audit, reporting et administration — sans dashboard à filtre de rôle.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-[4px] bg-[#0b62c8] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0957b3]"
                >
                  Accéder à la plateforme
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Date limite TDR : {WWF_TDR.submissionDeadline}
              </p>
            </div>

            <div className="rounded-[4px] border border-[#dbe3ef] bg-[#f8fafc] p-4">
              <div className="text-[13px] font-bold text-[#0f2945]">Workspaces</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {workspaces.map((workspace, index) => (
                  <div key={workspace} className="rounded-[4px] border border-[#dbe3ef] bg-white px-3 py-2 text-[12px] font-semibold text-slate-700">
                    <span className="mr-2 font-mono text-blue-700">{String(index + 1).padStart(2, "0")}</span>
                    {workspace}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[12px] text-slate-500">Demo password: <span className="font-mono text-[#0f2945]">demo123</span></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
