import { Paperclip, UploadCloud } from "lucide-react";

export function AttachmentsZone({
  hint,
}: {
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-ink-300 bg-ink-50/50 p-4">
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
            Dans le prototype, la zone de dépôt de documents est désactivée.
            La version production s&apos;appuiera sur MinIO pour le stockage
            objet sécurisé (chiffrement au repos, versionnage, droits par
            dossier).
          </p>
          {hint ? (
            <p className="mt-1 text-[11px] italic text-ink-500">{hint}</p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-500">
          Désactivé
        </span>
      </div>
    </div>
  );
}
