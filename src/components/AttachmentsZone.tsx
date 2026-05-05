"use client";

import { Paperclip, UploadCloud } from "lucide-react";
import { DOCUMENT_CATEGORY_LABEL } from "@/lib/enums";
import { useRef, useState } from "react";
import { attachDocumentAction } from "@/app/(app)/requisitions/documents/actions";

export function AttachmentsZone({
  requisitionId,
  hint,
}: {
  /** Required to actually attach. If absent, render info-only mode. */
  requisitionId?: string;
  hint?: string;
}) {
  if (!requisitionId) return <InfoOnly hint={hint} />;
  return <Active requisitionId={requisitionId} hint={hint} />;
}

function InfoOnly({ hint }: { hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-ink-300 bg-ink-50/40 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-white text-ink-500 ring-1 ring-ink-200">
          <UploadCloud className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-ink-800">
            <Paperclip className="h-3.5 w-3.5 text-ink-500" />
            Pièces jointes
          </div>
          <p className="mt-1 text-xs text-ink-600">
            Les pièces seront attachables au dossier après création de la
            réquisition. Les catégories disponibles : devis, contrat, facture,
            justification, GRN, SAN, autres.
          </p>
          {hint ? (
            <p className="mt-1 text-[11px] italic text-ink-500">{hint}</p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-500">
          Après création
        </span>
      </div>
    </div>
  );
}

function Active({ requisitionId, hint }: { requisitionId: string; hint?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<{ name: string; size: number } | null>(
    null,
  );

  return (
    <form
      action={attachDocumentAction}
      className="rounded-lg border border-dashed border-ink-300 bg-ink-50/40 p-4"
    >
      <input type="hidden" name="requisitionId" value={requisitionId} />
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-white text-ink-500 ring-1 ring-ink-200">
          <UploadCloud className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-ink-800">
            <Paperclip className="h-3.5 w-3.5 text-ink-500" />
            Ajouter une pièce jointe
          </div>
          <p className="text-[11.5px] text-ink-600">
            Sélectionnez le fichier et la catégorie. Le prototype conserve les
            métadonnées (nom, taille, catégorie). Le stockage objet réel
            utilisera MinIO en production.
          </p>
          {hint ? (
            <p className="text-[11px] italic text-ink-500">{hint}</p>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-2 text-xs text-ink-700 hover:bg-ink-50">
              <input
                ref={inputRef}
                type="file"
                name="file"
                required
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setSelected(f ? { name: f.name, size: f.size } : null);
                }}
              />
              <span className="font-medium">
                {selected ? "Changer le fichier" : "Choisir un fichier…"}
              </span>
              {selected ? (
                <span className="truncate text-ink-500">
                  · {selected.name} ({(selected.size / 1024).toFixed(0)} Ko)
                </span>
              ) : (
                <span className="text-ink-400">PDF, image, bureautique</span>
              )}
            </label>
            <select
              name="documentCategory"
              defaultValue="JUSTIFICATION"
              className="rounded-md border border-ink-200 bg-white px-3 py-2 text-xs shadow-sm"
            >
              {Object.entries(DOCUMENT_CATEGORY_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!selected}
            className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3 py-1.5 text-xs font-medium text-white shadow-soft transition hover:bg-wwf-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Joindre au dossier
          </button>
        </div>
      </div>
    </form>
  );
}
