import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart as PieChartIcon,
  FileBarChart
} from "lucide-react";
import { documentos, categoriaInfo, metricas } from "../lib/data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

export function Reportes() {
  // Data for charts
  const cumplimientoPorMes = [
    { mes: "Ene", cumplimiento: 85, multas: 0 },
    { mes: "Feb", cumplimiento: 82, multas: 1 },
    { mes: "Mar", cumplimiento: 88, multas: 0 },
    { mes: "Abr", cumplimiento: 90, multas: 0 },
    { mes: "May", cumplimiento: 87, multas: 0 },
    { mes: "Jun", cumplimiento: 92, multas: 0 },
  ];

  const documentosPorCategoria = Object.entries(
    documentos.reduce((acc, doc) => {
      acc[doc.categoria] = (acc[doc.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([categoria, cantidad]) => ({
    nombre: categoriaInfo[categoria as keyof typeof categoriaInfo].nombre,
    cantidad,
  }));

  const costosPorCategoria = Object.entries(
    documentos.reduce((acc, doc) => {
      const key = doc.categoria;
      acc[key] = (acc[key] || 0) + (doc.costo || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([categoria, costo]) => ({
    categoria: categoriaInfo[categoria as keyof typeof categoriaInfo].nombre,
    costo,
  }));

  const multasPotenciales = Object.entries(
    documentos.reduce((acc, doc) => {
      const key = doc.categoria;
      acc[key] = (acc[key] || 0) + (doc.multa || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([categoria, multa]) => ({
    categoria: categoriaInfo[categoria as keyof typeof categoriaInfo].nombre,
    multa,
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  const exportarReporte = (tipo: string) => {
    // Mock export functionality
    const blob = new Blob([`Reporte ${tipo} - ComplianceHub`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes e Informes</h1>
          <p className="text-gray-500 mt-1">Análisis detallado de tu cumplimiento regulatorio</p>
        </div>
        <Button className="gap-2" onClick={() => exportarReporte('completo')}>
          <Download className="h-4 w-4" />
          Exportar Reporte Completo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tasa de Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{metricas.cumplimientoPromedio}%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +5% vs mes anterior
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Docs. Gestionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{documentos.length}</p>
                <p className="text-xs text-gray-500 mt-1">Total activos</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Ahorro YTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">${metricas.ahorroTotal.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Año actual</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Alertas Resueltas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">24</p>
                <p className="text-xs text-gray-500 mt-1">Últimos 30 días</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="cumplimiento" className="w-full">
        <TabsList>
          <TabsTrigger value="cumplimiento">Cumplimiento</TabsTrigger>
          <TabsTrigger value="distribucion">Distribución</TabsTrigger>
          <TabsTrigger value="costos">Costos</TabsTrigger>
          <TabsTrigger value="riesgos">Riesgos</TabsTrigger>
        </TabsList>

        <TabsContent value="cumplimiento" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolución del Cumplimiento</CardTitle>
              <CardDescription>Tendencia de cumplimiento y multas en los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cumplimientoPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="cumplimiento" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="% Cumplimiento"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="multas" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Multas Recibidas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Vigentes
                      </span>
                      <span className="text-sm font-bold">
                        {documentos.filter(d => d.estado === "vigente").length}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Por Vencer
                      </span>
                      <span className="text-sm font-bold">
                        {documentos.filter(d => d.estado === "por-vencer").length}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Vencidos
                      </span>
                      <span className="text-sm font-bold">
                        {documentos.filter(d => d.estado === "vencido").length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiempo promedio de renovación</span>
                    <Badge>3.5 días</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Documentos renovados a tiempo</span>
                    <Badge variant="secondary">95%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Alertas generadas</span>
                    <Badge>127</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Responsables activos</span>
                    <Badge>3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribucion" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Categoría</CardTitle>
                <CardDescription>Distribución de documentos activos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={documentosPorCategoria}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nombre, cantidad }) => `${nombre}: ${cantidad}`}
                      outerRadius={100}
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

            <Card>
              <CardHeader>
                <CardTitle>Responsables</CardTitle>
                <CardDescription>Distribución de documentos por responsable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(documentos.map(d => d.responsable))).map((responsable) => {
                    const count = documentos.filter(d => d.responsable === responsable).length;
                    return (
                      <div key={responsable} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
                            {responsable.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{responsable}</p>
                            <p className="text-xs text-gray-500">{count} documento{count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <Badge>{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Costos de Renovación por Categoría</CardTitle>
              <CardDescription>Inversión anual en cumplimiento regulatorio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costosPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Bar dataKey="costo" fill="#3b82f6" name="Costo de Renovación ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Costo Total Anual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  ${documentos.reduce((sum, doc) => sum + (doc.costo || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">En renovaciones</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Costo Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  ${Math.round(documentos.reduce((sum, doc) => sum + (doc.costo || 0), 0) / documentos.length).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Por documento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">ROI Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">14,566%</p>
                <p className="text-xs text-gray-500 mt-1">Retorno anual</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="riesgos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Multas Potenciales por Categoría</CardTitle>
              <CardDescription>Exposición a riesgo financiero por incumplimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={multasPotenciales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Legend />
                  <Bar dataKey="multa" fill="#ef4444" name="Multa Potencial ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Análisis de Riesgo</CardTitle>
              <CardDescription>Documentos que requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documentos
                  .filter(doc => doc.estado === "por-vencer" || doc.estado === "vencido")
                  .sort((a, b) => (a.diasParaVencer || 0) - (b.diasParaVencer || 0))
                  .map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.nombre}</p>
                        <p className="text-xs text-gray-500">{categoriaInfo[doc.categoria].nombre}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">
                            ${(doc.multa || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Multa potencial</p>
                        </div>
                        <Badge variant="destructive">
                          {doc.diasParaVencer}d
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Reportes</CardTitle>
          <CardDescription>Descarga reportes específicos para auditorías y análisis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start gap-2" onClick={() => exportarReporte('cumplimiento')}>
              <FileBarChart className="h-4 w-4" />
              Reporte de Cumplimiento
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => exportarReporte('costos')}>
              <DollarSign className="h-4 w-4" />
              Análisis de Costos
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => exportarReporte('vencimientos')}>
              <Calendar className="h-4 w-4" />
              Calendario de Vencimientos
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => exportarReporte('auditoria')}>
              <FileText className="h-4 w-4" />
              Reporte de Auditoría
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
