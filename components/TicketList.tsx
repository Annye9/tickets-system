"use client";

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getEstadoConfig } from "@/lib/ticketUtils";
import { AnimatePresence, motion } from "framer-motion";

type Ticket = {
  id: number;
  titulo: string;
  descripcion: string;
  estado: string;
};

export function TicketList({ tickets }: { tickets: Ticket[] }) {

  return (
    <AnimatePresence>
      <div className="space-y-4">
        {tickets.map((ticket) => {
          const { color, Icon, spin } = getEstadoConfig(ticket.estado);

          return (
            <motion.div
              key={ticket.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{ticket.titulo}</CardTitle>
                </CardHeader>

                <CardContent className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Estado del ticket
                  </span>

                  <Badge className={`${color} flex items-center gap-2 px-3 py-1`}>
                    <Icon className={`w-4 h-4 ${spin ? "animate-spin" : ""}`} />
                    {ticket.estado}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
}
