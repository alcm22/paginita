"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BotonMarcarLeidas() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function marcarLeidas() {
    setCargando(true);
    try {
      const res = await fetch("/api/notificaciones/marcar-leidas", {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error al marcar como leídas:", error);
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      onClick={marcarLeidas}
      disabled={cargando}
      className="pg-btn-secundario text-xs"
    >
      {cargando ? "Marcando..." : "Marcar todas como leídas"}
    </button>
  );
}