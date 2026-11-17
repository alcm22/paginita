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
      <Link href="/configuracion" className="pg-btn-secundario">
        Editar perfil
      </Link>
    );
  }

  if (estado === "AMIGOS") {
    return (
      <span className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#172b20] text-[var(--accent-strong)] border border-[#3c694d]">
        ✓ Amigos
      </span>
    );
  }

  if (estado === "SOLICITUD_ENVIADA") {
    return (
      <span className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--surface-raised)] text-[var(--muted)] border border-[var(--border)]">
        Solicitud enviada
      </span>
    );
  }

  if (estado === "SOLICITUD_RECIBIDA") {
    return (
      <Link href="/amigos" className="pg-btn text-xs">
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
      className="pg-btn text-xs"
    >
      {cargando ? "Enviando..." : "Añadir a amigos"}
    </button>
  );
}