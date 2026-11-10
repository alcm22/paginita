"use client";

import { useState } from "react";
import Link from "next/link";
import { EstadoAmistad } from "@/features/perfiles/consultar-perfil";

type Props = {
  usuarioDestinoId: string;
  estadoInicial: EstadoAmistad;
};

export function BotonAccionPerfil({ usuarioDestinoId, estadoInicial }: Props) {
  const [estado, setEstado] = useState<EstadoAmistad>(estadoInicial);
  const [cargando, setCargando] = useState(false);

  if (estado === "PROPIO") {
    return (
      <Link
        href="/configuracion"
        className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        Editar perfil
      </Link>
    );
  }

  if (estado === "AMIGOS") {
    return (
      <span className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        ✓ Amigos
      </span>
    );
  }

  if (estado === "SOLICITUD_ENVIADA") {
    return (
      <span className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
        Solicitud enviada
      </span>
    );
  }

  if (estado === "SOLICITUD_RECIBIDA") {
    return (
      <Link
        href="/amigos"
        className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Responder solicitud
      </Link>
    );
  }

  async function enviarSolicitud() {
    setCargando(true);
    try {
      const res = await fetch("/api/amigos/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: usuarioDestinoId }),
      });

      if (res.ok) {
        setEstado("SOLICITUD_ENVIADA");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      onClick={enviarSolicitud}
      disabled={cargando}
      className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
    >
      {cargando ? "Enviando..." : "Añadir a amigos"}
    </button>
  );
}