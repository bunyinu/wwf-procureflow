import type { ReactNode } from "react";
import { Leaf } from "lucide-react";
import { PrintButton } from "@/components/PrintButton";

export function PrintShell({
  documentLabel,
  documentNumber,
  classification = "Document interne contrôlé",
  children,
}: {
  documentLabel: string;
  documentNumber: string;
  classification?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 print:bg-white">
      <div className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3 text-xs text-ink-500">
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-400">
            Aperçu impression
          </span>
          <span className="text-ink-300">•</span>
          <span>
            {documentLabel} ·{" "}
            <span className="font-mono text-ink-700">{documentNumber}</span>
          </span>
        </div>
        <PrintButton />
      </div>

      <div className="mx-auto my-6 max-w-[210mm] print:my-0 print:max-w-none">
        <div className="pdf-page relative bg-parchment shadow-elevated print:shadow-none">
          {/* Watermark */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <div
              className="select-none font-serif text-[140px] font-bold text-wwf-900"
              style={{
                opacity: 0.04,
                transform: "rotate(-28deg)",
                letterSpacing: "0.18em",
              }}
            >
              WWF · RDC
            </div>
          </div>

          {/* Letterhead band */}
          <header className="relative bg-gradient-to-br from-wwf-800 via-wwf-900 to-wwf-950 px-12 py-8 text-white">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <Leaf className="h-7 w-7" strokeWidth={2.25} />
                </div>
                <div>
                  <div className="font-serif text-xl font-semibold tracking-tight">
                    WWF — République Démocratique du Congo
                  </div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-wwf-100/80">
                    Bureau National du Programme · Kinshasa
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 rounded-sm border border-gold-300/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-gold-200">
                  {documentLabel}
                </div>
                <div className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                  {documentNumber}
                </div>
              </div>
            </div>
            <div
              className="mt-6 h-[3px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(220,185,107,0.85), transparent)",
              }}
            />
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-wwf-100/70">
              <span>4630, av. de la Science · Imm. 365 Offices Building</span>
              <span>{classification}</span>
            </div>
          </header>

          {/* Body */}
          <div className="relative px-12 py-10 text-[12px] leading-relaxed text-ink-900">
            {children}
          </div>

          {/* Bottom strip */}
          <footer className="relative border-t border-gold-200/60 bg-white/40 px-12 py-4 text-[10px] uppercase tracking-[0.18em] text-ink-500">
            <div className="flex items-center justify-between">
              <span>
                Tech Solutions Congo · Plateforme institutionnelle ProcureFlow
              </span>
              <span className="font-mono text-ink-600">{documentNumber}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function PdfSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-700">
        {children}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-gold-200 to-transparent" />
    </div>
  );
}

export function PdfMeta({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-3 rounded-sm border border-ink-200 bg-white/70 p-4">
      {items.map((it) => (
        <div key={it.label}>
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ink-500">
            {it.label}
          </div>
          <div className="mt-1 text-[12.5px] font-medium text-ink-900">
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PdfParty({
  label,
  name,
  lines,
}: {
  label: string;
  name: string;
  lines: ReactNode[];
}) {
  return (
    <div>
      <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold-700">
        {label}
      </div>
      <div className="mt-1 font-serif text-[15px] font-semibold tracking-tight text-ink-900">
        {name}
      </div>
      <div className="mt-1 space-y-0.5 text-[11.5px] text-ink-700">
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}

export function PdfSignatureBlock({
  signatures,
}: {
  signatures: { role: string; line: string }[];
}) {
  return (
    <section className="mt-8 grid grid-cols-3 gap-5">
      {signatures.map((s) => (
        <div key={s.role}>
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-gold-700">
            {s.role}
          </div>
          <div className="mt-12 border-t border-ink-400 pt-1 text-[10.5px] text-ink-600">
            {s.line}
          </div>
          <div className="mt-1 text-[10px] text-ink-500">Date · cachet</div>
        </div>
      ))}
    </section>
  );
}
