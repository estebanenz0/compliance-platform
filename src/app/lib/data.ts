export interface Documento {
  id: string;
  nombre: string;
  categoria: "sanitario" | "bomberos" | "licencias" | "laboral" | "ambiental" | "alcoholes";
  estado: "vigente" | "por-vencer" | "vencido" | "en-tramite";
  fechaEmision: Date;
  fechaVencimiento: Date;
  responsable: string;
  archivo?: string;
  costo?: number;
  multa?: number;
  diasParaVencer?: number;
}

export interface Alerta {
  id: string;
  documentoId: string;
  tipo: "critica" | "urgente" | "recordatorio";
  mensaje: string;
  diasRestantes: number;
  fecha: Date;
  leida: boolean;
}

export interface Metrica {
  multasEvitadas: number;
  ahorroTotal: number;
  documentosGestionados: number;
  cumplimientoPromedio: number;
  alertasActivas: number;
}

// Datos mock para la demo
export const documentos: Documento[] = [
  {
    id: "1",
    nombre: "Licencia de Funcionamiento",
    categoria: "licencias",
    estado: "vigente",
    fechaEmision: new Date(2025, 5, 1),
    fechaVencimiento: new Date(2026, 11, 31),
    responsable: "María González",
    costo: 1500,
    multa: 5000,
    diasParaVencer: 193,
  },
  {
    id: "2",
    nombre: "Certificado Sanitario",
    categoria: "sanitario",
    estado: "por-vencer",
    fechaEmision: new Date(2025, 8, 15),
    fechaVencimiento: new Date(2026, 7, 14),
    responsable: "Carlos Ruiz",
    costo: 800,
    multa: 8000,
    diasParaVencer: 54,
  },
  {
    id: "3",
    nombre: "Permiso de Bomberos",
    categoria: "bomberos",
    estado: "por-vencer",
    fechaEmision: new Date(2025, 6, 1),
    fechaVencimiento: new Date(2026, 6, 30),
    responsable: "Ana Martínez",
    costo: 600,
    multa: 10000,
    diasParaVencer: 39,
  },
  {
    id: "4",
    nombre: "Licencia de Alcoholes",
    categoria: "alcoholes",
    estado: "vigente",
    fechaEmision: new Date(2025, 0, 10),
    fechaVencimiento: new Date(2026, 11, 31),
    responsable: "María González",
    costo: 2000,
    multa: 15000,
    diasParaVencer: 193,
  },
  {
    id: "5",
    nombre: "Certificado de Manipulación de Alimentos",
    categoria: "sanitario",
    estado: "por-vencer",
    fechaEmision: new Date(2026, 4, 1),
    fechaVencimiento: new Date(2026, 6, 30),
    responsable: "Carlos Ruiz",
    costo: 400,
    multa: 3000,
    diasParaVencer: 39,
  },
  {
    id: "6",
    nombre: "Registro Ambiental",
    categoria: "ambiental",
    estado: "vigente",
    fechaEmision: new Date(2025, 3, 15),
    fechaVencimiento: new Date(2027, 3, 14),
    responsable: "Ana Martínez",
    costo: 1000,
    multa: 12000,
    diasParaVencer: 662,
  },
  {
    id: "7",
    nombre: "Planilla de Seguridad Social",
    categoria: "laboral",
    estado: "vigente",
    fechaEmision: new Date(2026, 5, 1),
    fechaVencimiento: new Date(2026, 5, 30),
    responsable: "María González",
    costo: 0,
    multa: 20000,
    diasParaVencer: 9,
  },
  {
    id: "8",
    nombre: "Permiso de Uso de Suelo",
    categoria: "licencias",
    estado: "vigente",
    fechaEmision: new Date(2024, 0, 1),
    fechaVencimiento: new Date(2029, 0, 1),
    responsable: "Ana Martínez",
    costo: 3000,
    multa: 25000,
    diasParaVencer: 1290,
  },
];

export const alertas: Alerta[] = [
  {
    id: "a1",
    documentoId: "7",
    tipo: "critica",
    mensaje: "Planilla de Seguridad Social vence en 9 días",
    diasRestantes: 9,
    fecha: new Date(2026, 5, 12),
    leida: false,
  },
  {
    id: "a2",
    documentoId: "3",
    tipo: "urgente",
    mensaje: "Permiso de Bomberos vence en 39 días",
    diasRestantes: 39,
    fecha: new Date(2026, 5, 12),
    leida: false,
  },
  {
    id: "a3",
    documentoId: "5",
    tipo: "urgente",
    mensaje: "Certificado de Manipulación de Alimentos vence en 39 días",
    diasRestantes: 39,
    fecha: new Date(2026, 5, 12),
    leida: false,
  },
  {
    id: "a4",
    documentoId: "2",
    tipo: "recordatorio",
    mensaje: "Certificado Sanitario vence en 54 días",
    diasRestantes: 54,
    fecha: new Date(2026, 5, 12),
    leida: false,
  },
];

export const metricas: Metrica = {
  multasEvitadas: 8,
  ahorroTotal: 86000,
  documentosGestionados: 8,
  cumplimientoPromedio: 87.5,
  alertasActivas: 4,
};

export const categoriaInfo = {
  sanitario: {
    nombre: "Sanitario",
    color: "bg-blue-500",
    descripcion: "Certificados y permisos de salud pública",
  },
  bomberos: {
    nombre: "Bomberos",
    color: "bg-red-500",
    descripcion: "Permisos de prevención de incendios",
  },
  licencias: {
    nombre: "Licencias",
    color: "bg-purple-500",
    descripcion: "Licencias de funcionamiento y operación",
  },
  laboral: {
    nombre: "Laboral",
    color: "bg-green-500",
    descripcion: "Documentación de empleados y nómina",
  },
  ambiental: {
    nombre: "Ambiental",
    color: "bg-emerald-500",
    descripcion: "Permisos ambientales y gestión de residuos",
  },
  alcoholes: {
    nombre: "Alcoholes",
    color: "bg-orange-500",
    descripcion: "Licencias para venta de bebidas alcohólicas",
  },
};

export function calcularDiasParaVencer(fecha: Date): number {
  const hoy = new Date();
  const diff = fecha.getTime() - hoy.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function obtenerEstadoDocumento(diasParaVencer: number): Documento["estado"] {
  if (diasParaVencer < 0) return "vencido";
  if (diasParaVencer <= 30) return "por-vencer";
  return "vigente";
}
