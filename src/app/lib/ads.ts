// CONECTAR AQUÍ: reemplazar isPremium con el estado real del usuario
// cuando se implemente autenticación (ej. user.plan === "premium")
export const isPremium = false;

export interface Ad {
  id: string;
  tipo: "banner" | "card";
  titulo: string;
  descripcion: string;
  textoBoton: string;
  enlace: string;
  acento?: string; // color hex opcional para el acento del card
}

// CONECTAR AQUÍ: reemplazar este array con una llamada a AdSense, servidor de
// anuncios propio, o fetch dinámico cuando esté disponible la integración real.
// Ejemplo: const ads = await fetchAds({ placement: "dashboard", plan: "free" });
export const ads: Ad[] = [
  {
    id: "banner-dashboard",
    tipo: "banner",
    titulo: "Seguro de responsabilidad civil para tu negocio",
    descripcion:
      "Cobertura especializada para restaurantes, hoteles y locales de entretenimiento.",
    textoBoton: "Ver planes",
    enlace: "#",
  },
  {
    id: "card-dashboard",
    tipo: "card",
    titulo: "Simplifica tu contabilidad regulatoria",
    descripcion:
      "Software contable integrado con los requisitos legales vigentes. Prueba gratuita por 30 días.",
    textoBoton: "Probar gratis",
    enlace: "#",
    acento: "#16a34a",
  },
];
