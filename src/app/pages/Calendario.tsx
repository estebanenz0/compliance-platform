import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Filter
} from "lucide-react";
import { documentos, categoriaInfo } from "../lib/data";
import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

export function Calendario() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filterCategoria, setFilterCategoria] = useState<string>("todas");

  // Filter documents
  const documentosFiltrados = documentos.filter(doc => {
    if (filterCategoria === "todas") return true;
    return doc.categoria === filterCategoria;
  });

  // Get documents for a specific date
  const getDocumentosForDate = (checkDate: Date) => {
    return documentosFiltrados.filter(doc => 
      isSameDay(doc.fechaVencimiento, checkDate)
    );
  };

  // Get documents for selected date or current month
  const selectedDateDocs = selectedDate ? getDocumentosForDate(selectedDate) : [];
  
  const currentMonthDocs = documentosFiltrados.filter(doc =>
    isSameMonth(doc.fechaVencimiento, date)
  ).sort((a, b) => a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime());

  // Dates with events
  const datesWithEvents = documentosFiltrados.map(doc => doc.fechaVencimiento);

  const modifiers = {
    hasEvent: datesWithEvents,
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: "bold" as const,
      textDecoration: "underline",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Vencimientos</h1>
          <p className="text-gray-500 mt-1">Visualiza y planifica las renovaciones de tus documentos</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterCategoria} onValueChange={setFilterCategoria}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {Object.entries(categoriaInfo).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(date, "MMMM yyyy", { locale: es })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(date);
                    newDate.setMonth(date.getMonth() - 1);
                    setDate(newDate);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDate(new Date())}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(date);
                    newDate.setMonth(date.getMonth() + 1);
                    setDate(newDate);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={date}
              onMonthChange={setDate}
              className="rounded-md border w-full"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
            />
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Las fechas subrayadas tienen documentos que vencen. 
                Haz clic en una fecha para ver los detalles.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: es }) : "Este mes"}
            </CardTitle>
            <CardDescription>
              {selectedDate 
                ? `${selectedDateDocs.length} documento(s)` 
                : `${currentMonthDocs.length} vencimiento(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(selectedDate ? selectedDateDocs : currentMonthDocs).length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No hay vencimientos {selectedDate ? "en esta fecha" : "este mes"}
                  </p>
                </div>
              ) : (
                (selectedDate ? selectedDateDocs : currentMonthDocs).map((doc) => (
                  <div 
                    key={doc.id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-1 rounded ${categoriaInfo[doc.categoria].color}`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm text-gray-900">{doc.nombre}</p>
                          {doc.estado === "por-vencer" && (
                            <Badge variant="secondary" className="ml-2">
                              {doc.diasParaVencer}d
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {categoriaInfo[doc.categoria].nombre}
                        </p>
                        <p className="text-xs text-gray-600">
                          Vence: {format(doc.fechaVencimiento, "dd/MM/yyyy")}
                        </p>
                        <p className="text-xs text-gray-500">
                          Responsable: {doc.responsable}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Mensual</CardTitle>
          <CardDescription>
            Vencimientos programados para {format(date, "MMMM yyyy", { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentMonthDocs.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay vencimientos programados este mes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentMonthDocs.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-12 w-12 rounded-lg ${categoriaInfo[doc.categoria].color} flex items-center justify-center text-white font-bold`}>
                      {format(doc.fechaVencimiento, "dd")}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.nombre}</p>
                      <p className="text-sm text-gray-500">{categoriaInfo[doc.categoria].nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">
                        {format(doc.fechaVencimiento, "dd 'de' MMMM", { locale: es })}
                      </p>
                      <p className="text-xs text-gray-500">{doc.responsable}</p>
                    </div>
                    {doc.estado === "por-vencer" && (
                      <Badge variant={
                        (doc.diasParaVencer || 0) <= 15 ? "destructive" : "secondary"
                      }>
                        {doc.diasParaVencer} días
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">Ver</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leyenda de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(categoriaInfo).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded ${value.color}`} />
                <span className="text-sm text-gray-700">{value.nombre}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
