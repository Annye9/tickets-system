import { CheckCircle, Loader2, XCircle } from "lucide-react";

export function getEstadoConfig(estado: string) {
  const e = estado.toLowerCase();

  if (e.includes("abierto")) {
    return { color: "bg-green-500 text-white", Icon: CheckCircle };
  }
  if (e.includes("proceso")) {
    return { color: "bg-yellow-500 text-white", Icon: Loader2, spin: true };
  }
  return { color: "bg-red-500 text-white", Icon: XCircle };
}
