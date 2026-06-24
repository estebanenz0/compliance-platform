import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Sparkles, Bot, User, Paperclip, Loader2 } from "lucide-react";
import { cn } from "./ui/utils";
import { documentos, alertas, metricas } from "../lib/data";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "¿Qué documentos vencen pronto?",
  "Dame un resumen ejecutivo",
  "¿Cuál es mi riesgo de multas?",
  "Tabla de todos mis documentos",
];

// ── response engine ────────────────────────────────────────────────────────────

function has(q: string, ...words: string[]) {
  return words.some((w) => q.includes(w));
}

function generateResponse(input: string): string {
  const q = input.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  // greeting / help
  if (has(q, "hola", "buenos", "buenas") || q.trim().length < 4) {
    return `¡Hola! Soy el asistente IA de **ComplianceHub** ✨\n\nPuedo ayudarte con:\n\n🔍 **Escanear documentos** — detecto fechas, categorías y datos clave automáticamente\n\n📊 **Consultas en tu formato** — tabla, lista, resumen ejecutivo, lo que necesites\n\n⚠️ **Análisis de riesgo** — calculo tu exposición a multas en tiempo real\n\n📅 **Vencimientos** — te digo exactamente qué documentos atender primero\n\nEscribe tu pregunta o elige una sugerencia de abajo.`;
  }

  // what can you do
  if (has(q, "que puedes", "como me ayudas", "funciones", "ayuda")) {
    return `Estas son mis capacidades principales:\n\n**1. Escaneo de documentos 📄**\nSube un archivo y extraigo automáticamente: fecha de emisión, vencimiento, entidad emisora, categoría y multa asociada.\n\n**2. Consultas en formato personalizado 📋**\nPídeme los datos en tabla, lista, CSV, resumen o el formato que prefieras.\n\n**3. Alertas y prioridades ⚠️**\nTe digo cuáles documentos atender primero según urgencia y riesgo económico.\n\n**4. Guías de renovación 🔄**\nPuedo explicarte los pasos para renovar cualquier tipo de permiso.\n\n¿Por dónde empezamos?`;
  }

  // document scan
  if (has(q, "escanea", "detecta", "analiza", "subir", "cargar", "adjunt", "archivo", "pdf")) {
    return `📄 **Análisis de documentos**\n\nPuedo procesar cualquier documento y extraer automáticamente:\n\n• **Fecha de vencimiento** y fecha de emisión\n• Tipo de permiso o certificado\n• Entidad emisora y responsable\n• Multa potencial por incumplimiento\n\nActualmente tengo **${documentos.length} documentos** registrados. Para analizar uno nuevo, adjúntalo con el ícono 📎 o descríbelo con palabras y lo categorizo.\n\n¿Quieres que te muestre el detalle de algún documento específico?`;
  }

  // upcoming expirations
  if (has(q, "vence", "vencen", "proximo", "proximos", "pronto", "vencimiento", "urgente")) {
    const urgentes = documentos
      .filter((d) => d.diasParaVencer !== undefined && d.diasParaVencer > 0 && d.diasParaVencer <= 60)
      .sort((a, b) => (a.diasParaVencer ?? 0) - (b.diasParaVencer ?? 0));

    if (urgentes.length === 0) {
      return `✅ **Sin vencimientos urgentes**\n\nNo tienes documentos próximos a vencer en los próximos 60 días. ¡Buen trabajo manteniendo todo al día!`;
    }

    const rows = urgentes
      .map((d) => {
        const icon = (d.diasParaVencer ?? 0) <= 15 ? "🔴" : (d.diasParaVencer ?? 0) <= 30 ? "🟠" : "🟡";
        return `${icon} **${d.nombre}** — vence en **${d.diasParaVencer} días** (${new Date(d.fechaVencimiento).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })})`;
      })
      .join("\n");

    return `⏰ **Documentos próximos a vencer** (${urgentes.length} en los próximos 60 días)\n\n${rows}\n\n**Prioridad inmediata:** ${urgentes[0].nombre} — gestionar hoy para evitar una multa de hasta $${(urgentes[0].multa ?? 0).toLocaleString()}.`;
  }

  // executive summary
  if (has(q, "resumen", "ejecutivo", "estado general", "overview", "panorama", "como estoy")) {
    const vigentes = documentos.filter((d) => d.estado === "vigente").length;
    const porVencer = documentos.filter((d) => d.estado === "por-vencer").length;
    const vencidos = documentos.filter((d) => d.estado === "vencido").length;

    return `📊 **Resumen Ejecutivo — ${new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}**\n\n**Portafolio documental:**\n• ✅ Vigentes: ${vigentes} documentos\n• ⚠️ Por vencer (< 60 días): ${porVencer} documentos\n• ❌ Vencidos: ${vencidos} documentos\n\n**Indicadores clave:**\n• Cumplimiento promedio: **${metricas.cumplimientoPromedio}%**\n• Alertas activas sin atender: **${metricas.alertasActivas}**\n• Multas evitadas este año: **${metricas.multasEvitadas}**\n• Ahorro acumulado: **$${metricas.ahorroTotal.toLocaleString()}**\n\n¿Necesitas este resumen en formato tabla para presentarlo?`;
  }

  // fines / penalties
  if (has(q, "multa", "multas", "riesgo", "sancion", "penalidad", "clausura", "perdida")) {
    const enRiesgo = documentos.filter((d) => d.diasParaVencer !== undefined && d.diasParaVencer <= 30 && d.diasParaVencer > 0);
    const totalRiesgo = enRiesgo.reduce((sum, d) => sum + (d.multa ?? 0), 0);

    if (enRiesgo.length === 0) {
      return `✅ **Sin riesgo inmediato de multas**\n\nNingún documento vence en los próximos 30 días. El sistema ha evitado **$${metricas.ahorroTotal.toLocaleString()}** en multas este año gracias a la gestión proactiva.\n\nTe recomiendo revisar los vencimientos de los próximos 60 días igualmente.`;
    }

    const detalles = enRiesgo
      .map((d) => `• **${d.nombre}** — ${d.diasParaVencer} días — multa potencial: $${(d.multa ?? 0).toLocaleString()}`)
      .join("\n");

    return `⚠️ **Análisis de riesgo financiero**\n\n**Documentos en zona crítica (≤ 30 días):**\n${detalles}\n\n**Exposición total estimada: $${totalRiesgo.toLocaleString()}**\n\nActuar ahora evita estas sanciones. ¿Quieres un plan de acción priorizado o la guía de renovación para alguno de estos documentos?`;
  }

  // table / format request
  if (has(q, "tabla", "formato", "lista completa", "todos los documentos", "csv", "listado")) {
    const rows = documentos
      .map(
        (d) =>
          `| ${d.nombre} | ${d.categoria} | ${d.estado === "vigente" ? "✅ Vigente" : d.estado === "por-vencer" ? "⚠️ Por Vencer" : "❌ Vencido"} | ${new Date(d.fechaVencimiento).toLocaleDateString("es-ES")} | ${d.diasParaVencer ?? "—"} días |`
      )
      .join("\n");

    return `📋 **Listado completo de documentos**\n\n| Documento | Categoría | Estado | Vencimiento | Días restantes |\n|-----------|-----------|--------|-------------|----------------|\n${rows}\n\n¿Quieres que filtre por categoría o estado específico?`;
  }

  // alerts
  if (has(q, "alerta", "alertas", "notificacion", "aviso", "sin leer")) {
    const noLeidas = alertas.filter((a) => !a.leida);
    const rows = noLeidas
      .map((a) => {
        const icon = a.tipo === "critica" ? "🔴" : a.tipo === "urgente" ? "🟠" : "🟡";
        return `${icon} ${a.mensaje} (${a.diasRestantes} días)`;
      })
      .join("\n");
    return `🔔 **Alertas activas** — ${noLeidas.length} sin leer\n\n${rows}\n\n¿Quieres que te explique cómo renovar alguno de estos documentos?`;
  }

  // renewal / how to renew
  if (has(q, "renovar", "renovacion", "tramite", "como renuevo", "pasos", "requisitos")) {
    return `🔄 **Guía de renovación**\n\nPuedo explicarte los pasos para renovar cualquier documento. ¿Cuál te interesa?\n\n• 🏥 Certificado Sanitario\n• 🔥 Permiso de Bomberos\n• 🏛️ Licencia de Funcionamiento\n• 📋 Planilla de Seguridad Social\n• 🌿 Registro Ambiental\n• 🍺 Licencia de Alcoholes\n\nTambién puedes hacer clic en **"Renovar"** directamente en la tarjeta del documento y verás la guía completa con dirección, tiempo y requisitos.`;
  }

  // category-specific: sanitario
  if (has(q, "sanitario", "salud", "alimentos", "manipulacion", "higiene")) {
    const docs = documentos.filter((d) => d.categoria === "sanitario");
    const rows = docs.map((d) => `• **${d.nombre}** — ${d.estado === "vigente" ? "✅ Vigente" : "⚠️ Por Vencer"} — ${d.diasParaVencer} días`).join("\n");
    return `🏥 **Documentos Sanitarios** (${docs.length} en sistema)\n\n${rows}\n\nResponsable actual: **${docs[0]?.responsable}**. Multa máxima por incumplimiento: **$${Math.max(...docs.map((d) => d.multa ?? 0)).toLocaleString()}**\n\n¿Quieres la guía de renovación del Certificado Sanitario?`;
  }

  // category: bomberos
  if (has(q, "bombero", "incendio", "fuego", "extintor", "seguridad")) {
    const doc = documentos.find((d) => d.categoria === "bomberos");
    return `🔥 **Permiso de Bomberos**\n\n• Estado: **${doc?.estado === "por-vencer" ? "⚠️ Por Vencer" : "✅ Vigente"}**\n• Vencimiento: **${new Date(doc?.fechaVencimiento ?? "").toLocaleDateString("es-ES")}** (${doc?.diasParaVencer} días)\n• Multa potencial: **$${(doc?.multa ?? 0).toLocaleString()}**\n• Responsable: **${doc?.responsable}**\n\nEste permiso requiere inspección presencial en tu Compañía de Bomberos local. ¿Quieres los pasos para renovarlo?`;
  }

  // category: alcoholes
  if (has(q, "alcohol", "licor", "bebida", "bar", "discoteca", "alcoholes")) {
    const doc = documentos.find((d) => d.categoria === "alcoholes");
    return `🍺 **Licencia de Alcoholes**\n\n• Estado: **✅ Vigente**\n• Vencimiento: **${new Date(doc?.fechaVencimiento ?? "").toLocaleDateString("es-ES")}** (${doc?.diasParaVencer} días)\n• Multa por incumplimiento: **$${(doc?.multa ?? 0).toLocaleString()}** + posible clausura\n• Responsable: **${doc?.responsable}**\n\nTienes tiempo suficiente para planificar la renovación con antelación. La licencia se renueva en la Municipalidad Distrital.`;
  }

  // category: laboral
  if (has(q, "laboral", "planilla", "seguridad social", "sunat", "essalud", "empleados")) {
    const doc = documentos.find((d) => d.categoria === "laboral");
    return `👷 **Planilla de Seguridad Social**\n\n• Estado: **✅ Vigente**\n• Próximo pago: **${new Date(doc?.fechaVencimiento ?? "").toLocaleDateString("es-ES")}** (${doc?.diasParaVencer} días)\n• Multa por mora: **$${(doc?.multa ?? 0).toLocaleString()}** + intereses\n• Responsable: **${doc?.responsable}**\n\n⚡ Este es el documento más urgente del sistema. El pago se realiza mensualmente en SUNAT online o bancos autorizados. ¿Necesitas más detalle?`;
  }

  // savings / ROI
  if (has(q, "ahorro", "roi", "valor", "beneficio", "cuanto ahorro", "costo")) {
    return `💰 **Valor del sistema para tu negocio**\n\n**Este año ComplianceHub ha logrado:**\n• Multas evitadas: **${metricas.multasEvitadas}** sanciones\n• Ahorro total: **$${metricas.ahorroTotal.toLocaleString()}**\n• Cumplimiento promedio: **${metricas.cumplimientoPromedio}%**\n\n**Comparación:**\n• Costo de una multa promedio: $8,000–$25,000\n• Tiempo perdido en clausuras: 3–15 días de operación\n• El sistema es completamente **gratuito** para ti\n\nCada alerta atendida a tiempo es dinero que se queda en tu bolsillo. ¿Quieres ver el cálculo detallado en la sección Calculadora ROI?`;
  }

  // inspection / report
  if (has(q, "reporte", "inspeccion", "inspección", "auditoria", "auditoría", "pdf")) {
    return `📑 **Reportes para inspecciones**\n\nPuedo generarte un reporte listo para presentar a cualquier autoridad regulatoria. Incluye:\n\n• Lista completa de documentos con estado y fechas\n• Historial de cumplimiento por categoría\n• Responsables asignados por área\n• Sello digital de ComplianceHub\n\nVe a la sección **Reportes** en el menú para descargar el PDF o Excel. ¿Tienes una inspección programada?`;
  }

  // calendar
  if (has(q, "calendario", "fecha", "cuando", "cronograma", "agenda")) {
    const proximos = documentos
      .filter((d) => d.diasParaVencer !== undefined && d.diasParaVencer > 0)
      .sort((a, b) => (a.diasParaVencer ?? 0) - (b.diasParaVencer ?? 0))
      .slice(0, 4);
    const rows = proximos.map((d) => `• **${new Date(d.fechaVencimiento).toLocaleDateString("es-ES", { day: "2-digit", month: "long" })}** — ${d.nombre}`).join("\n");
    return `📅 **Próximas fechas clave**\n\n${rows}\n\nPuedes ver el calendario visual completo en la sección **Calendario** del menú. Ahí aparecen todos los vencimientos con colores por urgencia.`;
  }

  // default fallback
  return `Entendido. Basándome en tus **${documentos.length} documentos** actuales con un cumplimiento del **${metricas.cumplimientoPromedio}%**, puedo ayudarte mejor si especificas qué necesitas. Por ejemplo:\n\n• *"Lista los documentos que vencen esta semana"*\n• *"¿Cuánto pagaría de multas si no renuevo el permiso de bomberos?"*\n• *"Dame el estado en formato tabla para presentar a mi contador"*\n• *"¿Cómo renuevo el certificado sanitario?"*`;
}

// ── component ──────────────────────────────────────────────────────────────────

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente IA de **ComplianceHub** 👋\n\nPuedo escanear documentos, detectar vencimientos, calcular riesgos de multas y responder cualquier consulta sobre tu cumplimiento. ¿En qué te ayudo hoy?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(content);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: response, timestamp: new Date() },
      ]);
    }, 800 + Math.random() * 600);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function fmt(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!open && (
            <motion.button
              key="fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setOpen(true)}
              className="relative h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/40 transition-shadow"
              aria-label="Abrir asistente IA"
            >
              <Sparkles className="h-6 w-6 text-white" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 animate-ping opacity-20" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Chat panel — height reduced to fit comfortably on screen */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-[360px] sm:w-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/30 border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden"
              style={{
                transformOrigin: "bottom right",
                maxHeight: "min(460px, calc(100vh - 100px))",
                height: "460px",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Asistente ComplianceHub IA</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                    <p className="text-[11px] text-white/70">Acceso a tus {documentos.length} documentos</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-7 w-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth bg-gray-50 dark:bg-gray-900/50">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        msg.role === "assistant"
                          ? "bg-gradient-to-br from-blue-500 to-purple-600"
                          : "bg-gradient-to-br from-gray-400 to-gray-500"
                      )}
                    >
                      {msg.role === "assistant" ? <Bot className="h-3 w-3 text-white" /> : <User className="h-3 w-3 text-white" />}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                        msg.role === "assistant"
                          ? "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm"
                          : "bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-tr-sm"
                      )}
                      dangerouslySetInnerHTML={{ __html: fmt(msg.content) }}
                    />
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Loader2 className="h-3 w-3 text-white animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Suggestions — only at start */}
              {messages.length === 1 && (
                <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-[11px] bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full transition-colors border border-blue-100 dark:border-blue-800"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-4 pb-3 pt-2 flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 transition-all">
                  <button
                    className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0"
                    title="Adjuntar documento"
                    onClick={() => sendMessage("Quiero escanear un documento para detectar sus fechas de vencimiento")}
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Pregunta sobre tus documentos..."
                    className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isTyping}
                    className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
                      input.trim() && !isTyping
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:opacity-90"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
