"use client";


import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus } from "lucide-react";

import { getEstadoConfig } from "@/lib/ticketUtils";

type Ticket = {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
};

export default function Home() { // Componente principal de la página//

  async function actualizarEstadoTicket(ticketId: number, nuevoEstado: string) {
    try {
      const res = await fetch(`http://127.0.0.1:8001/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: nuevoEstado,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const ticketActualizado = await res.json();

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? ticketActualizado : t))
      );
      localStorage.setItem(
        "tickets",
        JSON.stringify(
          tickets.map((t) => (t.id === ticketId ? ticketActualizado : t))
        )
      );
    } catch (error) {
      console.error("Error al actualizar ticket:", error);
      alert("No se pudo actualizar el ticket. Verifica que el backend esté disponible.");
    }
  }

async function crearTicket() {
  if (!titulo.trim()) {
    alert("Debes escribir un título");
    return;
  }

  setEnviando(true);

  try {
    const res = await fetch("http://127.0.0.1:8000/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo: titulo,
        estado: estado,
      }),
    });

    const nuevoTicket = await res.json();

    setTickets((prev) => [...prev, nuevoTicket]);
    setTitulo("");
    setEstado("abierto");
  } catch (error) {
    console.error(error);
  } finally {
    setEnviando(false);
  }
}

  useEffect(() => {
  // Intentar cargar tickets del backend con timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

  fetch("http://127.0.0.1:8001/tickets", { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const ticketsValidos = data.filter((t: Ticket) => t.titulo && t.titulo !== "string" && t.titulo.trim());
      setTickets(ticketsValidos);
      localStorage.setItem("tickets", JSON.stringify(ticketsValidos));
    })
    .catch((error) => {
      console.warn("No se pudo conectar al backend:", error.message);
      // Usar localStorage como fallback
      const ticketsGuardados = localStorage.getItem("tickets");
      if (ticketsGuardados) {
        console.log("Cargando tickets desde localStorage");
        const tickets = JSON.parse(ticketsGuardados);
        // Filtrar tickets inválidos (sin título válido)
        const ticketsValidos = tickets.filter((t: Ticket) => t.titulo && t.titulo !== "string" && t.titulo.trim());
        setTickets(ticketsValidos);
        // Limpiar localStorage si hay tickets inválidos
        if (ticketsValidos.length !== tickets.length) {
          localStorage.setItem("tickets", JSON.stringify(ticketsValidos));
          console.log("Datos de prueba limpiados");
        }
      } else {
        console.log("Sin tickets guardados");
        setTickets([]);
      }
    })
    .finally(() => clearTimeout(timeoutId));
}, []);


  const [titulo, setTitulo] = useState("");
  const [estado, setEstado] = useState("abierto");
  const [enviando, setEnviando] = useState(false);
  const [open, setOpen] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);




  const isDisabled =
    titulo.trim() === "" || descripcion.trim() === "" || isSubmitting;

  async function handleCreateTicket() {
    setIsSubmitting(true);

    try {
      const nuevoTicket = {
        id: Date.now(),
        titulo,
        descripcion,
        estado: "abierto",
      };

      // Intentar guardar en el backend
      try {
        const res = await fetch("http://127.0.0.1:8001/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevoTicket),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const ticketDelServidor = await res.json();
        
        setTickets((prev) => {
          const ticketsActualizados = [ticketDelServidor, ...prev];
          localStorage.setItem("tickets", JSON.stringify(ticketsActualizados));
          return ticketsActualizados;
        });
      } catch (backendError) {
        console.warn("No se pudo sincronizar con backend, guardando localmente:", backendError);
        // Guardar solo en localStorage si falla el backend
        setTickets((prev) => {
          const ticketsActualizados = [nuevoTicket, ...prev];
          localStorage.setItem("tickets", JSON.stringify(ticketsActualizados));
          return ticketsActualizados;
        });
      }

      setOpen(false);
      setTitulo("");
      setDescripcion("");
    } finally {
      setIsSubmitting(false);
    }
  }
  async function cambiarEstado(id: number, nuevoEstado: string) {
  try {
    const res = await fetch(`http://127.0.0.1:8001/tickets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        estado: nuevoEstado,
      }),
    });

    const actualizado = await res.json();

    // 🔁 Actualizar la lista SIN recargar
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? actualizado : t))
    );
  } catch (error) {
    console.error("Error cambiando estado:", error);
  }
}

async function eliminarTicket(id: number) {
  try {
    const res = await fetch(`http://127.0.0.1:8001/tickets/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar");
    }

    // Actualizar estado local y localStorage
    setTickets((prev) => {
      const actualizado = prev.filter((t) => t.id !== id);
      localStorage.setItem("tickets", JSON.stringify(actualizado));
      return actualizado;
    });

    alert("✅ Ticket eliminado correctamente");
  } catch (error) {
    alert("❌ No se pudo eliminar el ticket");
    console.error(error);
  }
}


  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">🎫 Tickets de Soporte</h1>

          <Button onClick={() => setOpen(true)} className="flex gap-2">
            <Plus className="w-4 h-4" />
            Crear ticket
          </Button>
        </div>

        {/* LISTA CON ANIMACIONES */}
        <div className="space-y-4">
          <AnimatePresence>
            {tickets.map((ticket) => {
              const { color, Icon, spin } = getEstadoConfig(ticket.estado);

              return (
                <motion.div
                  key={ticket.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{ticket.titulo}</CardTitle>
                    </CardHeader>

                    <CardContent className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Estado del ticket
                      </span>

                      <div className="flex items-center gap-3">
                        <Badge className={`${color} flex items-center gap-2 px-3 py-1`}>
                          <Icon className={`w-4 h-4 ${spin ? "animate-spin" : ""}`} />
                          {ticket.estado}
                        </Badge>
                        <div className="flex gap-2">
  {ticket.estado !== "abierto" && (
    <Button
      size="sm"
      variant="outline"
      onClick={() => cambiarEstado(ticket.id, "abierto")}
    >
      Abrir
    </Button>
  )}

  {ticket.estado !== "en proceso" && (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => cambiarEstado(ticket.id, "en proceso")}
    >
      En proceso
    </Button>
  )}

  {ticket.estado !== "cerrado" && (
    <Button
      size="sm"
      onClick={() => cambiarEstado(ticket.id, "cerrado")}
    >
      Cerrar
    </Button>
  )}
  <Button
    size="sm"
    variant="outline"
    onClick={() => eliminarTicket(ticket.id)}
  >
    Eliminar
  </Button>
</div>

                        
                        {/* botones ghost duplicados eliminados (se usan los condicionales previos) */}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* MODAL */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear ticket</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Input
                placeholder="Título del ticket"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={isSubmitting}
              />

              <Textarea
                placeholder="Describe el problema..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>

              <Button onClick={handleCreateTicket} disabled={isDisabled}>
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Crear ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </main>
  );
}
