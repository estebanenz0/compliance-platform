import React, { useState, useRef } from "react";
import {
  Lock, Upload, Trash2, FileText, CheckSquare,
  Printer, ChevronRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { cn } from "./ui/utils";
import { toast } from "sonner";
import { isPremium } from "../lib/ads";
import {
  getChecklist, saveChecklist,
  getDocFile, saveDocFile, removeDocFile,
  abrirVistaPDF,
  type StoredFile,
} from "../lib/documentStorage";
import { documentos as todosLosDocumentos, categoriaInfo } from "../lib/data";
import type { Documento } from "../lib/data";

// ── Requisitos por categoría ──────────────────────────────────────────────────
// Espejo de los requisitos en renewalGuides (Documentos.tsx).
// BACKEND: reemplazar con GET /api/categorias/:id/requisitos

const requirementsPorCategoria: Record<string, string[]> = {
  sanitario: [
    "DNI del representante legal vigente",
    "RUC activo en SUNAT",
    "Carné de sanidad al día de TODOS los manipuladores de alimentos",
    "Certificado de fumigación (vigencia máx. 3 meses antes de la solicitud)",
    "Planos del establecimiento con áreas claramente identificadas",
    "Declaración jurada de cumplimiento de normas sanitarias",
    "Comprobante de pago de tasas administrativas",
  ],
  bomberos: [
    "RUC activo del negocio",
    "Licencia de funcionamiento vigente",
    "Planos del local con salidas de emergencia marcadas",
    "Extintores con carga vigente (revisados en el último año)",
    "Señalización de emergencia instalada correctamente",
    "Sistema de detección de humo / alarma instalado",
    "Certificado de revisión eléctrica (si aplica)",
  ],
  licencias: [
    "DNI del propietario o representante legal",
    "RUC activo y vigente en SUNAT",
    "Contrato de arrendamiento o título de propiedad del local",
    "Planos de distribución del local",
    "Certificado de Defensa Civil vigente (INDECI)",
    "Permiso de uso de suelo compatible con el giro del negocio",
    "Declaración jurada de observancia de condiciones de seguridad",
  ],
  laboral: [
    "RUC activo del empleador en SUNAT",
    "Clave SOL (SUNAT Operaciones en Línea) activa",
    "Registro de empleados con DNI, fecha de ingreso y salario",
    "Cuentas bancarias de los trabajadores (para depósito de CTS si aplica)",
    "Software PLAME actualizado o acceso al portal web de SUNAT",
  ],
  ambiental: [
    "RUC activo del negocio",
    "Licencia de funcionamiento vigente",
    "Memoria descriptiva del proceso productivo del negocio",
    "Plan de gestión de residuos sólidos y líquidos",
    "Planos del local con instalaciones de agua y desagüe",
    "Constancia de no adeudo a la Municipalidad",
    "Contrato con empresa autorizada de recojo de residuos",
  ],
  alcoholes: [
    "DNI del representante legal o apoderado",
    "Licencia de funcionamiento vigente y en físico",
    "Certificado de no adeudo tributario municipal (original)",
    "Planos del local con zona de bar / almacén de bebidas identificada",
    "Declaración jurada de no venta de alcohol a menores de edad",
    "Croquis de ubicación del establecimiento",
    "Permiso de Bomberos vigente",
    "Certificado de Defensa Civil vigente",
  ],
};

// ── Fila bloqueada para usuarios free ─────────────────────────────────────────

function ProLockedRow() {
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-muted/50 border border-dashed border-border">
      <div className="flex items-center gap-2 min-w-0">
        <Lock className="h-3 w-3 text-violet-500 shrink-0" />
        <span className="text-xs text-muted-foreground truncate">
          Subir digital · Checklist · PDF
        </span>
      </div>
      <a
        href="/"
        className="text-[11px] font-semibold text-violet-600 hover:underline shrink-0"
      >
        Mejora a Pro →
      </a>
    </div>
  );
}

// ── Panel Pro completo (solo para isPremium) ───────────────────────────────────

function DocProPanelInner({ doc }: { doc: Documento }) {
  const requirements = requirementsPorCategoria[doc.categoria] ?? [];
  const [open, setOpen]           = useState(false);
  const [file, setFile]           = useState<StoredFile | null>(() => getDocFile(doc.id));
  const [checklist, setChecklist] = useState<boolean[]>(
    () => getChecklist(doc.id, requirements.length)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completados = checklist.filter(Boolean).length;
  const total       = requirements.length;
  const pct         = total > 0 ? Math.round((completados / total) * 100) : 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("El archivo supera los 10 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const stored: StoredFile = {
        name: f.name,
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
        sizeKb: Math.round(f.size / 1024),
      };
      saveDocFile(doc.id, stored); // BACKEND: POST /api/docs/:id/file
      setFile(stored);
      toast.success("Documento digital guardado");
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }

  function handleRemoveFile() {
    removeDocFile(doc.id); // BACKEND: DELETE /api/docs/:id/file
    setFile(null);
    toast.info("Documento eliminado");
  }

  function handleChecklistChange(index: number, checked: boolean) {
    const next = checklist.map((v, i) => (i === index ? checked : v));
    setChecklist(next);
    saveChecklist(doc.id, next); // BACKEND: PUT /api/docs/:id/checklist
  }

  function handleExportPDF() {
    abrirVistaPDF(todosLosDocumentos, requirementsPorCategoria);
  }

  const catColor = categoriaInfo[doc.categoria]?.color ?? "bg-slate-500";

  return (
    <>
      {/* Fila compacta en la tarjeta */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {file ? (
            <Badge
              variant="outline"
              className="text-[10px] h-5 gap-1 text-green-700 border-green-200 bg-green-50 dark:bg-green-950/20"
            >
              <FileText className="h-2.5 w-2.5" />
              Subido
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground/50">
              Sin archivo
            </Badge>
          )}
          {total > 0 && (
            <Badge
              variant="outline"
              className="text-[10px] h-5 gap-1 text-primary border-primary/20"
            >
              <CheckSquare className="h-2.5 w-2.5" />
              {completados}/{total}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] gap-0.5 px-2 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/20"
          onClick={() => setOpen(true)}
        >
          Pro
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Dialog completo */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div
                className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                  catColor
                )}
              >
                <FileText className="h-3.5 w-3.5 text-white" />
              </div>
              {doc.nombre}
            </DialogTitle>
            <DialogDescription>
              Funciones Pro — documento digital, checklist y exportar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            {/* 1. Documento digital ─────────────────────────────────────── */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Documento digital
              </h3>

              {file ? (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/40">
                  <FileText className="h-8 w-8 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.sizeKb} KB · Subido el{" "}
                      {new Date(file.uploadedAt).toLocaleDateString("es-ES")}
                    </p>
                    {file.dataUrl.startsWith("data:image") && (
                      <img
                        src={file.dataUrl}
                        alt="Vista previa"
                        className="mt-2 max-h-24 rounded border border-border object-contain"
                      />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={handleRemoveFile}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-7 w-7 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra o haz clic para subir
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    PDF, JPG, PNG · Máx. 10 MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              {!file && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Seleccionar archivo
                </Button>
              )}
            </section>

            <Separator />

            {/* 2. Checklist ─────────────────────────────────────────────── */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  Checklist de requisitos
                </h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {completados}/{total}
                </span>
              </div>

              {total > 0 ? (
                <>
                  <Progress value={pct} className="h-1.5" />
                  <ul className="space-y-2.5">
                    {requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Checkbox
                          id={`req-${doc.id}-${i}`}
                          checked={checklist[i] ?? false}
                          onCheckedChange={(v) => handleChecklistChange(i, !!v)}
                          className="mt-0.5 shrink-0"
                        />
                        <label
                          htmlFor={`req-${doc.id}-${i}`}
                          className={cn(
                            "text-xs leading-relaxed cursor-pointer select-none",
                            checklist[i]
                              ? "line-through text-muted-foreground/50"
                              : "text-foreground"
                          )}
                        >
                          {req}
                        </label>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No hay requisitos definidos para esta categoría.
                </p>
              )}
            </section>

            <Separator />

            {/* 3. Exportar PDF ──────────────────────────────────────────── */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Printer className="h-4 w-4 text-primary" />
                Exportar / Imprimir
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Genera un reporte con todos tus documentos, estado y checklist
                de requisitos, ordenado por trámite y listo para presentar.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExportPDF}
              >
                <Printer className="h-3.5 w-3.5" />
                Generar PDF de todos los trámites
              </Button>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Exportación pública ────────────────────────────────────────────────────────

export function DocProPanel({ doc }: { doc: Documento }) {
  if (!isPremium) return <ProLockedRow />;
  return <DocProPanelInner doc={doc} />;
}
