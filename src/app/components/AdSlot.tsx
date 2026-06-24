import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { isPremium } from "../lib/ads";

interface AdSlotProps {
  tipo: "banner" | "card";
  titulo: string;
  descripcion: string;
  textoBoton: string;
  enlace: string;
  acento?: string;
}

export function AdSlot({ tipo, titulo, descripcion, textoBoton, enlace, acento }: AdSlotProps) {
  // Los usuarios premium no ven anuncios
  if (isPremium) return null;

  if (tipo === "banner") {
    return (
      <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-muted/60">
        <Badge
          variant="outline"
          className="text-[10px] uppercase tracking-widest text-muted-foreground/50 border-muted-foreground/20 shrink-0"
        >
          Publicidad
        </Badge>
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <p className="text-sm font-medium text-foreground shrink-0">{titulo}</p>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">
            {descripcion}
          </p>
        </div>
        <a href={enlace} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
            {textoBoton}
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>
    );
  }

  // tipo === "card"
  const acentoColor = acento ?? "#16a34a";

  return (
    <Card
      className="border-[color:var(--ad-acento,#bbf7d0)]"
      style={
        {
          "--ad-acento": `${acentoColor}33`, // 20% opacidad del color acento
          borderColor: `${acentoColor}33`,
          backgroundColor: `${acentoColor}08`,
        } as React.CSSProperties
      }
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-widest text-muted-foreground/50 border-muted-foreground/20"
            >
              Publicidad
            </Badge>
            <p className="text-sm font-semibold text-foreground">{titulo}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{descripcion}</p>
          </div>
          <a href={enlace} target="_blank" rel="noopener noreferrer" className="shrink-0 pt-6">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              style={{ borderColor: `${acentoColor}66`, color: acentoColor }}
            >
              {textoBoton}
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
