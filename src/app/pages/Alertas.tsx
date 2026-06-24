import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Calendar,
  FileText,
  RefreshCw,
} from "lucide-react";
import { alertas as alertasIniciales, documentos, categoriaInfo } from "../lib/data";
import { toast } from "sonner";

interface AlertaExtendida {
  id: string;
  documentoId: string;
  tipo: "critica" | "urgente" | "recordatorio";
  mensaje: string;
  diasRestantes: number;
  fecha: Date;
  leida: boolean;
  renovada?: boolean;
}

export function Alertas() {
  const [alertasState, setAlertasState] = useState<AlertaExtendida[]>(alertasIniciales);
  const [renovarId, setRenovarId] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");

  // Only show non-renovated alerts
  const alertasActivas = alertasState.filter((a) => !a.renovada);
  const alertasCriticas = alertasActivas.filter((a) => a.tipo === "critica");
  const alertasUrgentes = alertasActivas.filter((a) => a.tipo === "urgente");
  const alertasRecordatorio = alertasActivas.filter((a) => a.tipo === "recordatorio");

  const marcarRenovada = (id: string, fecha: string) => {
    if (!fecha) {
      toast.error("Por favor indica la nueva fecha de vencimiento");
      return;
    }
    setAlertasState((prev) =>
      prev.map((a) => (a.id === id ? { ...a, renovada: true } : a))
    );
    setRenovarId(null);
    setNuevaFecha("");
    toast.success("¡Documento marcado como renovado!", {
      description: `Nueva fecha de vencimiento registrada: ${new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    });
  };

  const marcarTodasRenovadas = () => {
    if (alertasActivas.length === 0) return;
    setAlertasState((prev) => prev.map((a) => ({ ...a, renovada: true })));
    toast.success("Todas las alertas marcadas como renovadas");
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case "critica": return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "urgente": return <Clock className="h-5 w-5 text-orange-600" />;
      default: return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case "critica": return "border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10";
      case "urgente": return "border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/10";
      default: return "border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10";
    }
  };

  const AlertCard = ({ alerta }: { alerta: AlertaExtendida }) => {
    const documento = documentos.find((d) => d.id === alerta.documentoId);
    if (!documento) return null;

    return (
      <Card className={getAlertColor(alerta.tipo)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex-shrink-0">{getAlertIcon(alerta.tipo)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{alerta.mensaje}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {documento.nombre} · {categoriaInfo[documento.categoria].nombre}
                  </p>
                </div>
                <Badge
                  variant={alerta.tipo === "critica" ? "destructive" : "secondary"}
                  className="flex-shrink-0"
                >
                  {alerta.diasRestantes} días
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="h-3 w-3" />
                Vencimiento actual:{" "}
                {documento.fechaVencimiento.toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => { setRenovarId(alerta.id); setNuevaFecha(""); }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Ya renovado
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Ver Documento
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <p className="text-lg font-semibold text-foreground">¡Todo al día!</p>
      <p className="text-sm text-muted-foreground mt-1">No tienes alertas pendientes en esta categoría.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro de Alertas</h1>
          <p className="text-muted-foreground mt-1">
            Documentos que necesitan renovación — marca cada uno como renovado para mantener tu historial al día
          </p>
        </div>
        {alertasActivas.length > 0 && (
          <Button variant="outline" className="gap-2" onClick={marcarTodasRenovadas}>
            <CheckCircle2 className="h-4 w-4" />
            Marcar todas como renovadas
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Críticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-red-600">{alertasCriticas.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Vencen en menos de 15 días</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Urgentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-600">{alertasUrgentes.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Vencen en 15–30 días</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recordatorios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{alertasRecordatorio.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Vencen en 30–60 días</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Tabs defaultValue="todas" className="w-full">
        <TabsList>
          <TabsTrigger value="todas">Todas ({alertasActivas.length})</TabsTrigger>
          <TabsTrigger value="criticas">Críticas ({alertasCriticas.length})</TabsTrigger>
          <TabsTrigger value="urgentes">Urgentes ({alertasUrgentes.length})</TabsTrigger>
          <TabsTrigger value="recordatorios">Recordatorios ({alertasRecordatorio.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-3 mt-6">
          {alertasActivas.length === 0 ? <EmptyState /> : alertasActivas.map((a) => <AlertCard key={a.id} alerta={a} />)}
        </TabsContent>
        <TabsContent value="criticas" className="space-y-3 mt-6">
          {alertasCriticas.length === 0 ? <EmptyState /> : alertasCriticas.map((a) => <AlertCard key={a.id} alerta={a} />)}
        </TabsContent>
        <TabsContent value="urgentes" className="space-y-3 mt-6">
          {alertasUrgentes.length === 0 ? <EmptyState /> : alertasUrgentes.map((a) => <AlertCard key={a.id} alerta={a} />)}
        </TabsContent>
        <TabsContent value="recordatorios" className="space-y-3 mt-6">
          {alertasRecordatorio.length === 0 ? <EmptyState /> : alertasRecordatorio.map((a) => <AlertCard key={a.id} alerta={a} />)}
        </TabsContent>
      </Tabs>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Notificaciones</CardTitle>
          <CardDescription>Personaliza cómo y cuándo recibes alertas de vencimiento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Canales de Notificación</h3>
            <div className="space-y-3">
              {[
                { icon: Mail, label: "Correo Electrónico", sub: "admin@elbeunsabor.com", defaultOn: true },
                { icon: MessageSquare, label: "WhatsApp", sub: "+51 999 888 777", defaultOn: true },
                { icon: Smartphone, label: "Notificaciones Push", sub: "App móvil", defaultOn: false },
              ].map(({ icon: Icon, label, sub, defaultOn }) => (
                <div key={label} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={defaultOn} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Anticipación de Alertas</h3>
            <div className="space-y-3">
              {[
                { id: "90", label: "Primera alerta (90 días antes)", defaultOn: true },
                { id: "60", label: "Segunda alerta (60 días antes)", defaultOn: true },
                { id: "30", label: "Tercera alerta (30 días antes)", defaultOn: true },
                { id: "15", label: "Alerta urgente (15 días antes)", defaultOn: true },
                { id: "7", label: "Alerta crítica (7 días antes)", defaultOn: true },
              ].map(({ id, label, defaultOn }) => (
                <div key={id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <Label htmlFor={`alert-${id}`} className="cursor-pointer text-sm text-foreground">{label}</Label>
                  <Switch id={`alert-${id}`} defaultChecked={defaultOn} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline">Restablecer</Button>
            <Button onClick={() => toast.success("Configuración guardada exitosamente")}>Guardar Cambios</Button>
          </div>
        </CardContent>
      </Card>

      {/* Renewal date dialog */}
      <Dialog open={!!renovarId} onOpenChange={(open) => { if (!open) setRenovarId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-600" />
              Confirmar renovación
            </DialogTitle>
            <DialogDescription>
              Indica la nueva fecha de vencimiento del documento renovado para mantener tu historial actualizado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="nueva-fecha">Nueva fecha de vencimiento</Label>
              <Input
                id="nueva-fecha"
                type="date"
                value={nuevaFecha}
                onChange={(e) => setNuevaFecha(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setRenovarId(null)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => renovarId && marcarRenovada(renovarId, nuevaFecha)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
