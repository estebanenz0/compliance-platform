import { CheckCircle2, Zap } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { isPremium } from "../lib/ads";

const beneficiosPro = [
  "Sin anuncios en toda la plataforma",
  "Alertas automáticas ilimitadas por correo y WhatsApp",
  "Reportes exportables en PDF y Excel",
  "Soporte prioritario con respuesta en menos de 24 h",
  "Historial completo de documentos y auditoría de cambios",
];

export function UpgradeProCard() {
  if (isPremium) {
    return (
      <div className="flex justify-end">
        <Badge className="bg-violet-100 text-violet-700 border border-violet-200 gap-1.5 px-3 py-1 font-medium">
          <CheckCircle2 className="h-3 w-3" />
          Plan Pro activo
        </Badge>
      </div>
    );
  }

  return (
    <Card className="border-violet-200 bg-violet-50/40 dark:bg-violet-950/10 dark:border-violet-900/40">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Texto y beneficios */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet-600" />
              <span className="text-xs font-semibold uppercase tracking-widest text-violet-600">
                Plan Pro
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground leading-snug">
                ¿Listo para proteger tu negocio al máximo?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pasa a Pro y elimina el riesgo regulatorio por completo.
              </p>
            </div>
            <ul className="space-y-2">
              {beneficiosPro.map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" />
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-stretch sm:items-end gap-2 sm:pt-10 sm:min-w-[220px]">
            <Button
              size="lg"
              className="bg-violet-700 hover:bg-violet-800 text-white w-full sm:w-auto"
            >
              Comenzar prueba gratuita de 30 días
            </Button>
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Sin tarjeta de crédito · Cancela cuando quieras
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
