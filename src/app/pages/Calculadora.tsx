import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import {
  ShieldCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Star,
  Utensils,
  Music,
  Coffee,
  Building2,
  Store,
  ArrowRight,
  Gift,
  RefreshCw,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const tiposNegocio = [
  { value: "restaurante", label: "Restaurante", icon: Utensils, color: "text-orange-500", docs: 6, horas: 8 },
  { value: "discoteca", label: "Discoteca / Bar", icon: Music, color: "text-purple-500", docs: 8, horas: 10 },
  { value: "cafeteria", label: "Cafetería", icon: Coffee, color: "text-amber-500", docs: 5, horas: 6 },
  { value: "hotel", label: "Hotel", icon: Building2, color: "text-blue-500", docs: 10, horas: 14 },
  { value: "centro-comercial", label: "Centro Comercial", icon: Store, color: "text-green-500", docs: 12, horas: 18 },
];

interface DocRiesgo {
  key: string;
  nombre: string;
  multa: number;
  activo: boolean;
  descripcion: string;
}

const documentosBase: Omit<DocRiesgo, "activo">[] = [
  { key: "sanitario", nombre: "Certificado Sanitario", multa: 8000, descripcion: "Salud pública e higiene" },
  { key: "bomberos", nombre: "Permiso de Bomberos", multa: 10000, descripcion: "Prevención de incendios" },
  { key: "licencia", nombre: "Licencia de Funcionamiento", multa: 5000, descripcion: "Autorización municipal" },
  { key: "alcoholes", nombre: "Licencia de Alcoholes", multa: 15000, descripcion: "Venta de bebidas" },
  { key: "laboral", nombre: "Planilla Seg. Social", multa: 20000, descripcion: "Obligaciones laborales" },
  { key: "ambiental", nombre: "Permiso Ambiental", multa: 12000, descripcion: "Gestión de residuos" },
];

const beneficiosGratuitos = [
  "Alertas automáticas 90, 60, 30, 15 y 7 días antes del vencimiento",
  "Repositorio digital de todos tus documentos",
  "Guías paso a paso para renovar cada permiso",
  "Calendario visual de vencimientos",
  "Reportes listos para inspecciones",
  "Asistente IA disponible 24/7",
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Calculadora() {
  const [tipoNegocio, setTipoNegocio] = useState("restaurante");
  const [docs, setDocs] = useState<DocRiesgo[]>(
    documentosBase.map((d) => ({ ...d, activo: true }))
  );
  const [vistaAhorro, setVistaAhorro] = useState<"ahorro" | "multa">("ahorro");

  const negocioInfo = tiposNegocio.find((t) => t.value === tipoNegocio)!;
  const docsActivos = docs.filter((d) => d.activo);
  const multaTotal = docsActivos.reduce((sum, d) => sum + d.multa, 0);
  const horasAhorradas = negocioInfo.horas * 12; // horas/año
  const valorHora = 15; // $15/hora promedio
  const valorTiempo = horasAhorradas * valorHora;
  const ahorroTotal = multaTotal + valorTiempo;

  const toggleDoc = (key: string) => {
    setDocs((prev) => prev.map((d) => (d.key === key ? { ...d, activo: !d.activo } : d)));
  };

  const resetDocs = () => setDocs(documentosBase.map((d) => ({ ...d, activo: true })));

  const NegocioCard = ({ tipo }: { tipo: typeof tiposNegocio[0] }) => {
    const isSelected = tipoNegocio === tipo.value;
    return (
      <button
        onClick={() => setTipoNegocio(tipo.value)}
        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
          isSelected
            ? "border-blue-500 bg-blue-600/10 dark:bg-blue-600/20"
            : "border-border hover:border-blue-400 hover:bg-accent"
        }`}
      >
        <tipo.icon className={`h-6 w-6 ${isSelected ? "text-blue-500" : tipo.color}`} />
        <span className={`text-xs font-medium leading-tight ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-foreground"}`}>
          {tipo.label}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">¿Cuánto te protege SEGURA?</h1>
          <p className="text-muted-foreground mt-1">
            Calcula el riesgo real de no gestionar tus permisos — y lo que te ahorra nuestro sistema, que es <span className="text-green-500 font-semibold">completamente gratuito</span>
          </p>
        </div>
        {/* Free badge */}
        <div className="flex items-center gap-2 bg-green-600/10 dark:bg-green-600/20 border border-green-500/30 rounded-xl px-4 py-2.5 flex-shrink-0">
          <Gift className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">100% Gratuito</p>
            <p className="text-[11px] text-green-700/70 dark:text-green-400/70">Sin costo, sin letra pequeña</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Calculator inputs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1: Type of business */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                ¿Qué tipo de negocio tienes?
              </CardTitle>
              <CardDescription>Selecciona el que más se parezca a tu establecimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {tiposNegocio.map((t) => <NegocioCard key={t.value} tipo={t} />)}
              </div>
              <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-accent/40 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                Un {negocioInfo.label} típico gestiona aprox. <strong className="text-foreground mx-1">{negocioInfo.docs} documentos</strong> y destina hasta <strong className="text-foreground mx-1">{negocioInfo.horas} horas/mes</strong> en gestión de cumplimiento sin un sistema.
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Documents */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    ¿Qué documentos maneja tu negocio?
                  </CardTitle>
                  <CardDescription className="mt-1">Desmarca los que no aplican a tu establecimiento</CardDescription>
                </div>
                <button onClick={resetDocs} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-0.5">
                  <RefreshCw className="h-3 w-3" /> Todos
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {docs.map((doc) => (
                  <button
                    key={doc.key}
                    onClick={() => toggleDoc(doc.key)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${
                      doc.activo
                        ? "border-blue-400/60 bg-blue-600/5 dark:bg-blue-600/10"
                        : "border-border bg-transparent opacity-50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${doc.activo ? "text-foreground" : "text-muted-foreground"}`}>
                        {doc.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">{doc.descripcion}</p>
                    </div>
                    <div className="flex flex-col items-end ml-3 flex-shrink-0">
                      <p className="text-sm font-bold text-red-500">${doc.multa.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">multa</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Results panel */}
        <div className="space-y-4">
          {/* Toggle ahorro / multa */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setVistaAhorro("ahorro")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${vistaAhorro === "ahorro" ? "bg-green-600 text-white" : "text-muted-foreground hover:bg-accent"}`}
            >
              Ahorro estimado
            </button>
            <button
              onClick={() => setVistaAhorro("multa")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${vistaAhorro === "multa" ? "bg-red-600 text-white" : "text-muted-foreground hover:bg-accent"}`}
            >
              Multas evitadas
            </button>
          </div>

          {/* Main result card */}
          <Card className="border-2 border-green-500/30">
            <CardContent className="pt-5 pb-4 space-y-4">
              {vistaAhorro === "ahorro" ? (
                <>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Ahorro estimado anual</p>
                    <p className="text-4xl font-bold text-green-600">${ahorroTotal.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">usando SEGURA gratis</p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Multas que podrías evitar</span>
                      <span className="font-semibold text-green-600">+${multaTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tiempo de gestión ahorrado</span>
                      <span className="font-semibold text-blue-600">+${valorTiempo.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Costo de SEGURA</span>
                      <span className="font-bold text-green-500">$0 — Gratis</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Multas que evitas al año</p>
                    <p className="text-4xl font-bold text-red-500">${multaTotal.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">en {docsActivos.length} documentos gestionados</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {docsActivos.map((d) => (
                      <div key={d.key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate">{d.nombre}</span>
                        <span className="font-semibold text-red-500 ml-2">${d.multa.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Time savings */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{horasAhorradas} horas ahorradas</p>
                  <p className="text-xs text-muted-foreground">al año en gestión manual de documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Free pitch */}
          <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-xl p-4 text-center">
            <Gift className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground">SEGURA es 100% gratuito</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              No hay plan premium, no hay versión de pago. Toda esta protección es gratis para tu negocio.
            </p>
          </div>
        </div>
      </div>

      {/* What you get free */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-yellow-500" />
            Todo esto incluido — sin costo
          </CardTitle>
          <CardDescription>
            Lo que obtienes al usar SEGURA, completamente gratis para restaurantes, bares, hoteles y cualquier establecimiento del sector
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {beneficiosGratuitos.map((b) => (
              <div key={b} className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground leading-snug">{b}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reference fines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Referencia de multas en el sector hospitalidad
          </CardTitle>
          <CardDescription>
            Montos orientativos de sanciones por incumplimiento en restaurantes, discotecas, hoteles y afines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {documentosBase.map((d) => (
              <div key={d.key} className="p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors">
                <p className="text-sm font-medium text-foreground">{d.nombre}</p>
                <p className="text-xs text-muted-foreground mb-1">{d.descripcion}</p>
                <p className="text-lg font-bold text-red-500">${d.multa.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground/70">multa típica por incumplimiento</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/60 mt-4 italic">
            * Los montos son valores de referencia orientativos. Las multas reales varían según la jurisdicción, el tipo de infracción y los antecedentes del establecimiento. Verifique con la autoridad competente de su localidad.
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <ShieldCheck className="h-14 w-14 flex-shrink-0 opacity-90" />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold mb-1">Tu negocio merece estar protegido — y es gratis</h3>
            <p className="text-blue-100 text-sm">
              Miles de restaurantes, bares, hoteles y cafeterías ya evitan clausuras y multas con SEGURA. Únete sin costo.
            </p>
          </div>
          <Button variant="secondary" size="lg" className="flex-shrink-0 gap-2 font-semibold">
            Empezar gratis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
