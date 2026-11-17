"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function ContadorNoLeidos({ inicial }: { inicial: number }) {
  const [total, setTotal] = useState(inicial);
  const pathname = usePathname();

  useEffect(() => {
    let activo = true;

    async function actualizar() {
      try {
        const res = await fetch("/api/mensajes/no-leidos", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { totalNoLeidos?: number };
        if (activo && typeof data.totalNoLeidos === "number") {
          setTotal(data.totalNoLeidos);
        }
      } catch {
        // Ignoramos errores puntuales de red al refrescar el contador
      }
    }

    function manejarEvento() {
      void actualizar();
    }

    window.addEventListener("paginita:mensajes-actualizados", manejarEvento);
    void actualizar();

    return () => {
      activo = false;
      window.removeEventListener("paginita:mensajes-actualizados", manejarEvento);
    };
  }, [pathname]);

  if (total <= 0) {
    return null;
  }

  return (
    <span
      aria-label={`${total} mensajes sin leer`}
      className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold"
    >
      {total > 99 ? "99+" : total}
    </span>
  );
}