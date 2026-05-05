"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-md bg-wwf-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-wwf-800"
    >
      <Printer className="h-3.5 w-3.5" />
      Imprimer / PDF
    </button>
  );
}
