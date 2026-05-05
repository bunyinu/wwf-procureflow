// Minimal CSV serializer (UTF-8 + BOM so Excel renders accents correctly).

function escape(field: unknown): string {
  if (field === null || field === undefined) return "";
  const s = String(field);
  if (/[",\n;]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | null | undefined | Date>>,
  delimiter = ";",
): string {
  const lines = [headers.map(escape).join(delimiter)];
  for (const row of rows) {
    lines.push(
      row
        .map((c) =>
          c instanceof Date
            ? escape(c.toISOString())
            : escape(c as string | number | null | undefined),
        )
        .join(delimiter),
    );
  }
  // BOM for Excel
  return "﻿" + lines.join("\r\n");
}

export function csvResponse(filename: string, body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
