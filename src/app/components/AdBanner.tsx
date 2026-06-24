import { cn } from "./ui/utils";
import { ExternalLink, Megaphone } from "lucide-react";

interface AdBannerProps {
  variant: "sidebar" | "horizontal" | "card";
  className?: string;
}

const adContent = {
  sidebar: {
    brand: "Seguros Hostelería",
    tagline: "Protege tu negocio con cobertura total para restaurantes y hoteles.",
    cta: "Ver planes →",
    accent: "from-emerald-500 to-teal-600",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    sub: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
  horizontal: {
    brand: "Consultora RegulaTech",
    tagline: "Asesoría legal especializada en cumplimiento para el sector hospitalidad. Primera consulta gratis.",
    cta: "Consulta gratis",
    accent: "from-blue-500 to-indigo-600",
    bg: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    text: "text-blue-900",
    sub: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  card: {
    brand: "Proveedor de Licencias Pro",
    tagline: "Gestiona todas tus licencias municipales desde un solo lugar.",
    cta: "Saber más →",
    accent: "from-violet-500 to-purple-600",
    bg: "from-violet-50 to-purple-50",
    border: "border-violet-200",
    text: "text-violet-900",
    sub: "text-violet-600",
    badge: "bg-violet-100 text-violet-700",
  },
};

export function AdBanner({ variant, className }: AdBannerProps) {
  const ad = adContent[variant];

  if (variant === "sidebar") {
    return (
      <div className={cn("rounded-xl border overflow-hidden", ad.border, className)}>
        <div className={cn("px-2 py-1 flex items-center justify-between bg-gradient-to-r", ad.accent)}>
          <span className="text-[10px] font-semibold text-white/80 uppercase tracking-widest">Publicidad</span>
          <Megaphone className="h-3 w-3 text-white/70" />
        </div>
        <div className={cn("p-3 bg-gradient-to-br", ad.bg)}>
          <p className={cn("text-xs font-bold mb-1", ad.text)}>{ad.brand}</p>
          <p className={cn("text-[11px] leading-snug mb-2", ad.sub)}>{ad.tagline}</p>
          <button
            className={cn(
              "text-[11px] font-semibold px-2 py-1 rounded-md w-full text-center transition-opacity hover:opacity-80",
              ad.badge
            )}
          >
            {ad.cta}
          </button>
        </div>
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div
        className={cn(
          "rounded-xl border flex items-center gap-4 px-5 py-3 bg-gradient-to-r overflow-hidden",
          ad.border,
          ad.bg,
          className
        )}
      >
        <div
          className={cn(
            "hidden sm:flex h-10 w-10 rounded-lg items-center justify-center bg-gradient-to-br flex-shrink-0",
            ad.accent
          )}
        >
          <Megaphone className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("text-[10px] font-semibold uppercase tracking-widest", ad.sub)}>Publicidad</span>
            <span className={cn("text-xs font-bold", ad.text)}>{ad.brand}</span>
          </div>
          <p className={cn("text-xs truncate", ad.sub)}>{ad.tagline}</p>
        </div>
        <button
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80",
            ad.badge
          )}
        >
          {ad.cta}
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // card variant
  return (
    <div className={cn("rounded-xl border overflow-hidden", ad.border, className)}>
      <div className={cn("px-3 py-1.5 flex items-center justify-between bg-gradient-to-r", ad.accent)}>
        <span className="text-[10px] font-semibold text-white/80 uppercase tracking-widest">Espacio Publicitario</span>
        <Megaphone className="h-3 w-3 text-white/70" />
      </div>
      <div className={cn("p-4 bg-gradient-to-br", ad.bg)}>
        <p className={cn("text-sm font-bold mb-1", ad.text)}>{ad.brand}</p>
        <p className={cn("text-xs leading-relaxed mb-3", ad.sub)}>{ad.tagline}</p>
        <button
          className={cn(
            "text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-opacity hover:opacity-80",
            ad.badge
          )}
        >
          {ad.cta}
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function AdPlaceholder({ label = "Espacio para anuncio" }: { label?: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1.5 p-4 text-center">
      <Megaphone className="h-5 w-5 text-gray-300" />
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-[10px] text-gray-300">Contacta: ads@compliancehub.com</p>
    </div>
  );
}
