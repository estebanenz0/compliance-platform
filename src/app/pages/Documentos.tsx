import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Search,
  Plus,
  Filter,
  FileText,
  Calendar,
  User,
  Upload,
  Download,
  AlertCircle,
  MapPin,
  Clock,
  DollarSign,
  CheckSquare,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { documentos, categoriaInfo, type Documento } from "../lib/data";
import { DocProPanel } from "../components/DocProPanel";
import { toast } from "sonner";

// ── Renewal guide data ─────────────────────────────────────────────────────────

interface RenewalStep {
  step: number;
  title: string;
  desc: string;
}

interface RenewalGuide {
  title: string;
  authority: string;
  address: string;
  duration: string;
  cost: string;
  steps: RenewalStep[];
  requirements: string[];
  tip: string;
}

const renewalGuides: Record<string, RenewalGuide> = {
  sanitario: {
    title: "Renovación de Certificado Sanitario",
    authority: "Dirección Regional de Salud (DIRESA) / MINSA",
    address: "Sede de Salud Pública más cercana a tu establecimiento (consulta minsa.gob.pe)",
    duration: "15 a 30 días hábiles",
    cost: "$800 – $1,200 (varía según categoría del negocio)",
    steps: [
      { step: 1, title: "Solicita cita previa", desc: "Ingresa al portal del MINSA o llama al 113 para reservar una fecha de inspección sanitaria. Hazlo con al menos 45 días de antelación." },
      { step: 2, title: "Prepara la documentación", desc: "Reúne todos los documentos requeridos. Verifica que estén vigentes y en buen estado antes de presentarlos." },
      { step: 3, title: "Inspección del establecimiento", desc: "Un inspector validará las condiciones de higiene, almacenamiento y manipulación de alimentos. Asegúrate de que el local esté en óptimas condiciones." },
      { step: 4, title: "Pago de tasas oficiales", desc: "Realiza el pago en el banco autorizado o en la plataforma digital del Banco de la Nación. Conserva el comprobante." },
      { step: 5, title: "Recepción del certificado", desc: "El certificado se emite en físico y digital. Colócalo en lugar visible del establecimiento; es exigido en toda inspección." },
    ],
    requirements: [
      "DNI del representante legal vigente",
      "RUC activo en SUNAT",
      "Carné de sanidad al día de TODOS los manipuladores de alimentos",
      "Certificado de fumigación (vigencia máx. 3 meses antes de la solicitud)",
      "Planos del establecimiento con áreas claramente identificadas",
      "Declaración jurada de cumplimiento de normas sanitarias",
      "Comprobante de pago de tasas administrativas",
    ],
    tip: "Inicia el trámite al menos 45 días antes del vencimiento. Operar con certificado vencido puede resultar en clausura inmediata además de la multa.",
  },

  bomberos: {
    title: "Renovación de Permiso de Bomberos",
    authority: "Cuerpo General de Bomberos Voluntarios del Perú (CGBVP)",
    address: "Compañía de Bomberos más cercana a tu establecimiento (bomberos.gob.pe/compañias)",
    duration: "10 a 20 días hábiles",
    cost: "$600 – $900 (según área en m² del local)",
    steps: [
      { step: 1, title: "Solicita la inspección", desc: "Comunícate con la compañía de bomberos de tu jurisdicción. Puedes hacerlo por teléfono o en persona. Solicita una fecha de visita." },
      { step: 2, title: "Prepara el local para la revisión", desc: "Verifica que extintores estén vigentes, señalización de emergencia instalada, rutas de evacuación despejadas y sistema contra incendios operativo." },
      { step: 3, title: "Inspección de los brigadistas", desc: "El equipo de bomberos revisará el local. Si hay observaciones, tendrás un plazo para subsanarlas antes de una segunda inspección." },
      { step: 4, title: "Pago de la tasa correspondiente", desc: "La tasa se calcula según el área del establecimiento. El pago se realiza en las instalaciones de bomberos o en el banco autorizado." },
      { step: 5, title: "Retiro del permiso", desc: "Recoge el permiso físico en la compañía. Debe estar visible en el establecimiento en todo momento." },
    ],
    requirements: [
      "RUC activo del negocio",
      "Licencia de funcionamiento vigente",
      "Planos del local con salidas de emergencia marcadas",
      "Extintores con carga vigente (revisados en el último año)",
      "Señalización de emergencia instalada correctamente",
      "Sistema de detección de humo / alarma instalado",
      "Certificado de revisión eléctrica (si aplica)",
    ],
    tip: "Antes de la inspección, contrata a un técnico para revisar los extintores y la instalación eléctrica. Los observaciones más comunes son fácilmente prevenibles.",
  },

  licencias: {
    title: "Renovación de Licencia de Funcionamiento",
    authority: "Municipalidad Distrital de tu localidad",
    address: "Oficina de Licencias y Autorizaciones – Municipalidad de tu distrito (consulta el portal municipal)",
    duration: "15 a 30 días hábiles (puede variar por municipalidad)",
    cost: "$1,500 – $2,500 (según giro y área del negocio)",
    steps: [
      { step: 1, title: "Acércate a la Municipalidad", desc: "Visita la oficina de Licencias y Autorizaciones o consulta si tu municipio tiene trámite en línea en su portal web." },
      { step: 2, title: "Entrega la documentación completa", desc: "Presenta todos los documentos requeridos. La falta de alguno puede retrasar el proceso o rechazar la solicitud." },
      { step: 3, title: "Inspección municipal del local", desc: "Un inspector verificará que el negocio cumple con las condiciones declaradas: zonificación, seguridad y uso de suelo." },
      { step: 4, title: "Pago de los derechos municipales", desc: "Paga en la caja municipal o por transferencia según indique el inspector. El monto varía por giro y área del establecimiento." },
      { step: 5, title: "Recepción de la licencia", desc: "La licencia renovada se entrega en físico. Colócala en lugar visible; es el primer documento que solicita cualquier inspector municipal." },
    ],
    requirements: [
      "DNI del propietario o representante legal",
      "RUC activo y vigente en SUNAT",
      "Contrato de arrendamiento o título de propiedad del local",
      "Planos de distribución del local",
      "Certificado de Defensa Civil vigente (INDECI)",
      "Permiso de uso de suelo compatible con el giro del negocio",
      "Declaración jurada de observancia de condiciones de seguridad",
    ],
    tip: "Verifica con anticipación el zoning (zonificación) de tu local. Si el giro del negocio no es compatible, deberás tramitar primero un cambio de zonificación.",
  },

  laboral: {
    title: "Renovación / Pago de Planilla Seguridad Social",
    authority: "SUNAT / ESSALUD / ONP",
    address: "Portal SUNAT en línea: sunat.gob.pe — Banco de la Nación o bancos autorizados",
    duration: "Mismo día (trámite mensual obligatorio)",
    cost: "Variable según nómina: 9% del salario bruto para ESSALUD + 13% para ONP (si aplica)",
    steps: [
      { step: 1, title: "Calcula los aportes del mes", desc: "Con base en los salarios brutos de todos los empleados, calcula el 9% para ESSALUD y el descuento de ONP o AFP según corresponda." },
      { step: 2, title: "Genera el formulario en SUNAT", desc: "Ingresa al portal sunat.gob.pe, accede a PLAME (Planilla Mensual de Pagos) y registra los ingresos de cada trabajador." },
      { step: 3, title: "Declara y valida en PLAME", desc: "Completa el formulario virtual PDT 601 o el módulo PLAME. Verifica que los datos de cada trabajador sean correctos antes de declarar." },
      { step: 4, title: "Realiza el pago", desc: "Paga antes del vencimiento (entre el 9 y 15 de cada mes según el último dígito del RUC) en el banco autorizado o en línea." },
      { step: 5, title: "Conserva los comprobantes", desc: "Guarda la constancia de pago y la declaración PLAME. Son exigibles en cualquier auditoría laboral del Ministerio de Trabajo." },
    ],
    requirements: [
      "RUC activo del empleador en SUNAT",
      "Clave SOL (SUNAT Operaciones en Línea) activa",
      "Registro de empleados con DNI, fecha de ingreso y salario",
      "Cuentas bancarias de los trabajadores (para depósito de CTS si aplica)",
      "Software PLAME actualizado o acceso al portal web de SUNAT",
    ],
    tip: "⚠️ Este documento vence en 9 días. El pago fuera de fecha genera multas del 100% del tributo omitido más intereses diarios. Priorízalo HOY.",
  },

  ambiental: {
    title: "Renovación de Registro Ambiental",
    authority: "Ministerio del Ambiente (MINAM) / Dirección Regional Ambiental",
    address: "Sede del MINAM: Av. Javier Prado Oeste 1440, San Isidro, Lima — o la oficina regional más cercana",
    duration: "30 a 60 días hábiles (incluye elaboración del EIA)",
    cost: "$1,000 – $2,500 (más honorarios del consultor ambiental: $500 – $1,500)",
    steps: [
      { step: 1, title: "Contrata un consultor ambiental certificado", desc: "El trámite requiere un profesional registrado en el SENACE. Solicita cotizaciones con al menos 90 días de antelación." },
      { step: 2, title: "Elabora el Estudio de Impacto Ambiental (EIA)", desc: "El consultor preparará el EIA o la Declaración de Impacto Ambiental (DIA) según la categoría de tu establecimiento." },
      { step: 3, title: "Presenta la documentación ante la autoridad", desc: "Ingresa el expediente completo en la oficina del MINAM o DIRESA regional. Recibirás un número de expediente para seguimiento." },
      { step: 4, title: "Inspección y revisión técnica", desc: "Un técnico ambiental visitará el local para verificar el plan de gestión de residuos, manejo de aguas y emisiones." },
      { step: 5, title: "Resolución de aprobación", desc: "Una vez aprobado, recibirás la resolución directoral. Este documento tiene vigencia de 2 a 5 años según categoría." },
    ],
    requirements: [
      "RUC activo del negocio",
      "Licencia de funcionamiento vigente",
      "Memoria descriptiva del proceso productivo del negocio",
      "Plan de gestión de residuos sólidos y líquidos",
      "Planos del local con instalaciones de agua y desagüe",
      "Constancia de no adeudo a la Municipalidad",
      "Contrato con empresa autorizada de recojo de residuos",
    ],
    tip: "Inicia este trámite con 90 días de antelación. Es el más largo y técnico. Un consultor ambiental con experiencia en el sector hospitalidad reducirá el tiempo significativamente.",
  },

  alcoholes: {
    title: "Renovación de Licencia de Alcoholes",
    authority: "Municipalidad Distrital — Área de Licencias Especiales / Licencias de Funcionamiento",
    address: "Oficina de Licencias Especiales de tu Municipalidad Distrital — planta baja del edificio municipal",
    duration: "20 a 45 días hábiles",
    cost: "$2,000 – $3,500 (el monto más alto de todas las licencias — priorizar presupuesto)",
    steps: [
      { step: 1, title: "Verifica la vigencia de tu licencia de funcionamiento", desc: "La licencia de alcoholes es una extensión de la licencia de funcionamiento. Ambas deben estar vigentes simultáneamente." },
      { step: 2, title: "Solicita el certificado de no adeudo", desc: "Tramita el certificado de no adeudo tributario municipal. Es requisito previo e indispensable para cualquier licencia especial." },
      { step: 3, title: "Presenta el expediente completo", desc: "Entrega toda la documentación en la oficina de Licencias Especiales. Un técnico revisará la completitud del expediente en el momento." },
      { step: 4, title: "Inspección del establecimiento", desc: "Inspectores municipales verificarán el aforo, señalización de no venta a menores, horario de funcionamiento y condiciones de seguridad." },
      { step: 5, title: "Aprobación, pago y entrega", desc: "Una vez aprobada la inspección, pagas los derechos municipales y recibes la licencia renovada. Debe estar visible junto a la de funcionamiento." },
    ],
    requirements: [
      "DNI del representante legal o apoderado",
      "Licencia de funcionamiento vigente y en físico",
      "Certificado de no adeudo tributario municipal (original)",
      "Planos del local con zona de bar / almacén de bebidas identificada",
      "Declaración jurada de no venta de alcohol a menores de edad",
      "Croquis de ubicación del establecimiento",
      "Permiso de Bomberos vigente",
      "Certificado de Defensa Civil vigente",
    ],
    tip: "Esta es la licencia con mayor multa potencial ($15,000) y la que más demora. Inicia la renovación 60 días antes. Operar sin ella puede implicar clausura definitiva.",
  },
};

// ── RenewalModal component ─────────────────────────────────────────────────────

function RenewalModal({ doc }: { doc: Documento }) {
  const guide = renewalGuides[doc.categoria];
  if (!guide) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Renovar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className={`h-8 w-8 rounded-lg ${categoriaInfo[doc.categoria].color} flex items-center justify-center flex-shrink-0`}>
              <FileText className="h-4 w-4 text-white" />
            </div>
            {guide.title}
          </DialogTitle>
          <DialogDescription>
            Guía completa para renovar <strong>{doc.nombre}</strong> a tiempo y sin complicaciones
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Key info row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Tiempo estimado</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">{guide.duration}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
              <DollarSign className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-800 dark:text-green-300">Costo aproximado</p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">{guide.cost}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
              <MapPin className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">Autoridad competente</p>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">{guide.authority}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 p-3 rounded-lg border border-border bg-muted/30">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">Dónde realizar el trámite</p>
              <p className="text-xs text-muted-foreground mt-0.5">{guide.address}</p>
            </div>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              Pasos a seguir
            </h3>
            <div className="space-y-3">
              {guide.steps.map((s) => (
                <div key={s.step} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-green-500" />
              Documentos y requisitos necesarios
            </h3>
            <div className="space-y-2">
              {guide.requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{req}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI disclaimer */}
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed border-t border-border pt-3 italic">
            * La información sobre requisitos, pasos y entidades presentada en esta guía es de carácter orientativo y ha sido elaborada con asistencia de inteligencia artificial. Se recomienda verificar los requisitos exactos y vigentes directamente con la autoridad competente correspondiente antes de iniciar cualquier trámite.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => toast.info("Recordatorio configurado — te avisaremos 30 días antes")}
            >
              Configurar recordatorio
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => toast.success("¡Trámite iniciado! El estado se actualizará cuando subas el nuevo documento.")}
            >
              Marcar en proceso
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function Documentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("todas");
  const [filterEstado, setFilterEstado] = useState<string>("todos");

  const documentosFiltrados = documentos.filter((doc) => {
    const matchSearch = doc.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = filterCategoria === "todas" || doc.categoria === filterCategoria;
    const matchEstado = filterEstado === "todos" || doc.estado === filterEstado;
    return matchSearch && matchCategoria && matchEstado;
  });

  const handleUploadDocument = () => {
    toast.success("Documento subido exitosamente", {
      description: "El documento ha sido agregado a tu repositorio",
    });
  };

  const estadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "vigente": return "default";
      case "por-vencer": return "secondary";
      case "vencido": return "destructive";
      default: return "outline";
    }
  };

  const estadoLabel = (estado: string) => {
    switch (estado) {
      case "vigente": return "Vigente";
      case "por-vencer": return "Por Vencer";
      case "vencido": return "Vencido";
      case "en-tramite": return "En Trámite";
      default: return estado;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Todos tus permisos, licencias y certificados en un solo lugar — con estado y vencimiento siempre visible
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Documento</DialogTitle>
              <DialogDescription>
                Sube un nuevo documento al sistema para mantener tu cumplimiento actualizado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Documento</Label>
                  <Input id="nombre" placeholder="Ej: Licencia de Funcionamiento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoriaInfo).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emision">Fecha de Emisión</Label>
                  <Input id="emision" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vencimiento">Fecha de Vencimiento</Label>
                  <Input id="vencimiento" type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsable">Responsable</Label>
                  <Input id="responsable" placeholder="Nombre del responsable" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costo">Costo de Renovación ($)</Label>
                  <Input id="costo" type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="archivo">Archivo del Documento</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-muted-foreground">Arrastra el archivo o haz clic para seleccionar</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPG, PNG (máx. 10MB)</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={handleUploadDocument}>Guardar Documento</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre de documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {Object.entries(categoriaInfo).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="vigente">✅ Vigente</SelectItem>
                <SelectItem value="por-vencer">⚠️ Por Vencer</SelectItem>
                <SelectItem value="vencido">❌ Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{documentosFiltrados.length}</span> de <span className="font-semibold text-foreground">{documentos.length}</span> documentos
        </p>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Lista
        </Button>
      </div>

      {/* Documents List */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Vista de Tarjetas</TabsTrigger>
          <TabsTrigger value="list">Vista de Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentosFiltrados.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`h-12 w-12 rounded-lg ${categoriaInfo[doc.categoria].color} flex items-center justify-center`}>
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant={estadoBadgeVariant(doc.estado)}>
                      {estadoLabel(doc.estado)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{doc.nombre}</CardTitle>
                  <CardDescription>{categoriaInfo[doc.categoria].descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Vence:</span>
                    <span className="font-medium text-foreground">
                      {doc.fechaVencimiento.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Responsable:</span>
                    <span className="font-medium text-foreground">{doc.responsable}</span>
                  </div>
                  {doc.multa && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Multa por vencer:</span>
                      <span className="font-medium text-red-500">${doc.multa.toLocaleString()}</span>
                    </div>
                  )}
                  {doc.estado === "por-vencer" && (
                    <div className="flex items-center gap-2 text-sm bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg border border-orange-100 dark:border-orange-800">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-orange-700 dark:text-orange-400 font-medium">
                        Vence en {doc.diasParaVencer} días — actúa pronto
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">Ver Detalles</Button>
                    <RenewalModal doc={doc} />
                  </div>
                  {/* Funciones Pro: upload digital, checklist, PDF */}
                  <div className="pt-1 border-t border-border mt-1">
                    <DocProPanel doc={doc} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {documentosFiltrados.map((doc) => (
                  <div key={doc.id} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`h-10 w-10 rounded-lg ${categoriaInfo[doc.categoria].color} flex items-center justify-center`}>
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{doc.nombre}</p>
                          <p className="text-sm text-muted-foreground">{categoriaInfo[doc.categoria].nombre}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-muted-foreground">Vencimiento</p>
                          <p className="text-sm font-medium text-foreground">
                            {doc.fechaVencimiento.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-muted-foreground">Responsable</p>
                          <p className="text-sm font-medium text-foreground">{doc.responsable}</p>
                        </div>
                        <Badge variant={estadoBadgeVariant(doc.estado)} className="w-24 justify-center">
                          {estadoLabel(doc.estado)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Ver</Button>
                          <RenewalModal doc={doc} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
