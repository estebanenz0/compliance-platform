import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign,
  FileCheck,
  Clock,
  ArrowRight,
  Shield
} from "lucide-react";
import { documentos, alertas, metricas, categoriaInfo } from "../lib/data";
import { ads } from "../lib/ads";
import { AdSlot } from "../components/AdSlot";
import { UpgradeProCard } from "../components/UpgradeProCard";
import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function Dashboard() {
  const documentosPorEstado = {
    vigente: documentos.filter(d => d.estado === "vigente").length,
    porVencer: documentos.filter(d => d.estado === "por-vencer").length,
    vencido: documentos.filter(d => d.estado === "vencido").length,
  };

  const documentosPorCategoria = Object.entries(
    documentos.reduce((acc, doc) => {
      acc[doc.categoria] = (acc[doc.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([categoria, cantidad]) => ({
    nombre: categoriaInfo[categoria as keyof typeof categoriaInfo].nombre,
    cantidad,
    color: categoriaInfo[categoria as keyof typeof categoriaInfo].color,
  }));

  const proximosVencimientos = [...documentos]
    .filter(d => d.estado !== "vencido" && d.diasParaVencer && d.diasParaVencer <= 60)
    .sort((a, b) => (a.diasParaVencer || 0) - (b.diasParaVencer || 0))
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  const bannerAd = ads.find(a => a.tipo === "banner");
  const cardAd = ads.find(a => a.tipo === "card");

  return (
    <div className="space-y-6">
      {/* Slot publicitario — banner superior */}
      {bannerAd && <AdSlot {...bannerAd} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visión general de tu cumplimiento regulatorio — revisa si tu negocio está protegido</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Diseñado para <span className="text-primary font-medium">restaurantes · discotecas · cafeterías · hoteles · centros comerciales</span>
          </p>
        </div>
        {/* Tip del día — moved from sidebar */}
        <div className="bg-muted rounded-lg px-4 py-3 border border-border max-w-xs">
          <p className="text-xs font-semibold text-foreground mb-0.5">Consejo del día</p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Inicia la renovación de tus permisos 45 días antes del vencimiento para evitar contratiempos de última hora.
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {alertas.some(a => a.tipo === "critica") && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">Atención: Tienes alertas críticas</p>
                <p className="text-sm text-muted-foreground">Algunos documentos vencen en menos de 15 días</p>
              </div>
              <Link to="/alertas">
                <Button variant="destructive" size="sm">
                  Ver Alertas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Multas Evitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{metricas.multasEvitadas}</p>
                <p className="text-xs text-muted-foreground mt-1">Últimos 12 meses</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Sanciones que no llegaron a tu bolsillo</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ahorro Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">${metricas.ahorroTotal.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +23% vs mes anterior
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Dinero ahorrado en multas evitadas</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-3xl font-bold text-foreground">{metricas.cumplimientoPromedio}%</p>
                <Progress value={metricas.cumplimientoPromedio} className="mt-2" />
                <p className="text-[11px] text-muted-foreground mt-1">Documentos al día vs total registrado</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ml-3">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">{metricas.alertasActivas}</p>
                <p className="text-xs text-amber-700 mt-1">Requieren atención</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Documentos próximos a vencer</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slot publicitario — tarjeta intercalada */}
      {cardAd && <AdSlot {...cardAd} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Documentos</CardTitle>
            <CardDescription>Distribución por estado de cumplimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    Vigentes
                  </span>
                  <span className="text-sm font-bold">{documentosPorEstado.vigente}</span>
                </div>
                <Progress value={(documentosPorEstado.vigente / documentos.length) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500" />
                    Por Vencer
                  </span>
                  <span className="text-sm font-bold">{documentosPorEstado.porVencer}</span>
                </div>
                <Progress value={(documentosPorEstado.porVencer / documentos.length) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    Vencidos
                  </span>
                  <span className="text-sm font-bold">{documentosPorEstado.vencido}</span>
                </div>
                <Progress value={(documentosPorEstado.vencido / documentos.length) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentos por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos por Categoría</CardTitle>
            <CardDescription>Distribución de documentos gestionados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={documentosPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, cantidad }) => `${nombre}: ${cantidad}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {documentosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Vencimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Vencimientos</CardTitle>
          <CardDescription>Documentos que requieren tu atención próximamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {proximosVencimientos.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`h-10 w-10 rounded-lg ${categoriaInfo[doc.categoria].color} flex items-center justify-center`}>
                    <FileCheck className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{doc.nombre}</p>
                    <p className="text-sm text-muted-foreground">{categoriaInfo[doc.categoria].nombre}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {doc.diasParaVencer} días
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.fechaVencimiento.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {(doc.diasParaVencer || 0) <= 15 ? (
                    <Badge className="bg-red-50 text-red-700 border-red-200">Urgente</Badge>
                  ) : (doc.diasParaVencer || 0) <= 30 ? (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200">Próximo</Badge>
                  ) : (
                    <Badge variant="secondary">Normal</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link to="/documentos">
            <Button variant="outline" className="w-full mt-4">
              Ver Todos los Documentos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Upgrade a Pro / badge de plan activo */}
      <UpgradeProCard />
    </div>
  );
}
