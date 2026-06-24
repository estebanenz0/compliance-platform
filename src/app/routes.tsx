import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Documentos } from "./pages/Documentos";
import { Calendario } from "./pages/Calendario";
import { Alertas } from "./pages/Alertas";
import { Reportes } from "./pages/Reportes";
import { Calculadora } from "./pages/Calculadora";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "documentos", Component: Documentos },
      { path: "calendario", Component: Calendario },
      { path: "alertas", Component: Alertas },
      { path: "reportes", Component: Reportes },
      { path: "calculadora", Component: Calculadora },
    ],
  },
]);
