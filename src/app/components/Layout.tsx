import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Bell,
  FileBarChart,
  Calculator,
  Menu,
  Sun,
  Moon,
  Instagram,
  Facebook,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { cn } from "./ui/utils";
import { AIAssistant } from "./AIAssistant";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, desc: "Visión general de tu cumplimiento" },
  { name: "Documentos", href: "/documentos", icon: FileText, desc: "Permisos, licencias y certificados" },
  { name: "Calendario", href: "/calendario", icon: Calendar, desc: "Fechas clave de vencimiento" },
  { name: "Alertas", href: "/alertas", icon: Bell, badge: 4, desc: "Avisos que necesitan atención" },
  { name: "Reportes", href: "/reportes", icon: FileBarChart, desc: "Análisis y métricas exportables" },
  { name: "Calculadora ROI", href: "/calculadora", icon: Calculator, desc: "Cuánto te protege este sistema" },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
    </svg>
  );
}

function LayoutInner() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border fixed top-0 left-0 right-0 z-30 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              {/* Logo + Brand */}
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 border border-border/40">
                  <img
                    src="/logo.jpeg"
                    alt="SEGURA logo"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: "center" }}
                  />
                </div>
                <div>
                  <h1 className="font-bold text-lg tracking-wide text-foreground">SEGURA</h1>
                  <p className="text-[11px] text-muted-foreground leading-none">Sistema Operativo de Cumplimiento</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title={isDark ? "Modo claro" : "Modo oscuro"}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">Restaurant "El Buen Sabor"</p>
                <p className="text-xs text-muted-foreground">Plan gratuito</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                EB
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-20 transition-transform lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center px-1.5 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    "text-[11px] font-normal leading-snug mt-0.5 truncate",
                    isActive ? "text-primary/70" : "text-muted-foreground/60"
                  )}>
                    {item.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="flex-shrink-0 p-4 space-y-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold">
              Soporte & Redes
            </span>
          </div>
          <div className="flex items-center gap-3 px-1">
            <a href="#" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors" title="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors" title="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors" title="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors" title="TikTok">
              <TikTokIcon className="h-4 w-4" />
            </a>
          </div>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent transition-colors border border-transparent hover:border-border">
            <MessageCircle className="h-3.5 w-3.5" />
            Contactar soporte
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <AIAssistant />
    </div>
  );
}

export function Layout() {
  return (
    <ThemeProvider>
      <LayoutInner />
    </ThemeProvider>
  );
}
