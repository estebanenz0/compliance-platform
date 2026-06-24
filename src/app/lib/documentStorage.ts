import type { Documento } from "./data";

// BACKEND: todas las funciones de este módulo usan localStorage como capa de datos
// temporal. Cada comentario BACKEND indica el endpoint real que la reemplazará.

const CHECKLIST_KEY = "segura_checklist_v1";
const DOCFILES_KEY  = "segura_docfiles_v1";

export interface StoredFile {
  name: string;
  dataUrl: string;   // BACKEND: reemplazar con URL firmada de S3 / bucket propio
  uploadedAt: string;
  sizeKb: number;
}

function readStore<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, T>;
  } catch {
    return {};
  }
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export function getChecklist(docId: string, totalItems: number): boolean[] {
  // BACKEND: GET /api/docs/:id/checklist
  const all = readStore<boolean[]>(CHECKLIST_KEY);
  return all[docId] ?? Array<boolean>(totalItems).fill(false);
}

export function saveChecklist(docId: string, checked: boolean[]): void {
  // BACKEND: PUT /api/docs/:id/checklist  body: { checked: boolean[] }
  const all = readStore<boolean[]>(CHECKLIST_KEY);
  all[docId] = checked;
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify(all));
}

// ── Archivos digitales ────────────────────────────────────────────────────────

export function getDocFile(docId: string): StoredFile | null {
  // BACKEND: GET /api/docs/:id/file → devuelve { url: string, name: string, ... }
  const all = readStore<StoredFile>(DOCFILES_KEY);
  return all[docId] ?? null;
}

export function saveDocFile(docId: string, file: StoredFile): void {
  // BACKEND: POST /api/docs/:id/file  multipart/form-data → upload a S3/bucket
  const all = readStore<StoredFile>(DOCFILES_KEY);
  all[docId] = file;
  localStorage.setItem(DOCFILES_KEY, JSON.stringify(all));
}

export function removeDocFile(docId: string): void {
  // BACKEND: DELETE /api/docs/:id/file
  const all = readStore<StoredFile>(DOCFILES_KEY);
  delete all[docId];
  localStorage.setItem(DOCFILES_KEY, JSON.stringify(all));
}

// ── PDF / Impresión ───────────────────────────────────────────────────────────

export function abrirVistaPDF(
  docs: Documento[],
  requirementsPorCategoria: Record<string, string[]>
): void {
  // BACKEND: reemplazar con generación server-side (Puppeteer, PDFKit, WeasyPrint)
  // endpoint: POST /api/reportes/tramites → { url: string } para descarga directa

  const allChecklists = readStore<boolean[]>(CHECKLIST_KEY);

  const sections = docs
    .map((doc) => {
      const reqs = requirementsPorCategoria[doc.categoria] ?? [];
      const checked = (allChecklists[doc.id] as boolean[] | undefined) ?? Array<boolean>(reqs.length).fill(false);
      const completados = checked.filter(Boolean).length;

      const reqRows = reqs
        .map(
          (req, i) =>
            `<tr>
              <td style="width:22px;padding:3px 6px;font-size:14px">${checked[i] ? "✅" : "⬜"}</td>
              <td style="padding:3px 6px;font-size:12px;color:#334155">${req}</td>
            </tr>`
        )
        .join("");

      const vence = doc.fechaVencimiento.toLocaleDateString("es-ES", {
        day: "2-digit", month: "long", year: "numeric",
      });
      const dias = doc.diasParaVencer !== undefined ? `${doc.diasParaVencer} días` : "—";

      return `
        <div style="margin-bottom:28px;break-inside:avoid">
          <h2 style="font-size:15px;font-weight:700;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:0 0 6px">${doc.nombre}</h2>
          <p style="font-size:11px;color:#64748b;margin:0 0 10px">
            Categoría: <strong>${doc.categoria}</strong>&nbsp;·&nbsp;
            Vence: <strong>${vence}</strong>&nbsp;·&nbsp;
            Días restantes: <strong>${dias}</strong>
          </p>
          <h3 style="font-size:12px;font-weight:600;color:#1e40af;margin:0 0 6px">
            Requisitos — ${completados} de ${reqs.length} completados
          </h3>
          ${reqs.length > 0
            ? `<table style="width:100%;border-collapse:collapse"><tbody>${reqRows}</tbody></table>`
            : `<p style="font-size:11px;color:#94a3b8">Sin requisitos definidos.</p>`}
        </div>`;
    })
    .join(`<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>`);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>SEGURA — Reporte de Trámites</title>
  <style>
    body { font-family: system-ui,-apple-system,sans-serif; padding:32px; color:#0f172a; max-width:800px; margin:0 auto; }
    h1   { font-size:22px; font-weight:700; margin:0 0 4px; }
    .meta{ font-size:11px; color:#64748b; margin:0 0 28px; }
    @media print { body { padding:0; } @page { margin:20mm; } }
  </style>
</head>
<body>
  <h1>SEGURA — Reporte de Trámites</h1>
  <p class="meta">
    Generado el ${new Date().toLocaleDateString("es-ES", { dateStyle: "long" })}
    &nbsp;·&nbsp; Restaurant "El Buen Sabor"
  </p>
  ${sections}
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    // eslint-disable-next-line no-alert
    alert("Permite ventanas emergentes en tu navegador para generar el PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.addEventListener("load", () => win.print());
}
