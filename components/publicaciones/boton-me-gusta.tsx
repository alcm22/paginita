
"use client";

import { useState } from "react";

type BotonMeGustaProps = {
  publicacionId: string;
  meGustaInicial: boolean;
  cantidadInicial: number;
};

export function BotonMeGusta({
  publicacionId,
  meGustaInicial,
  cantidadInicial,
}: BotonMeGustaProps) {
  const [meGusta, setMeGusta] = useState(meGustaInicial);
  const [cantidad, setCantidad] = useState(cantidadInicial);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function cambiarMeGusta() {
    if (cargando) return;

    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(
        `/api/publicaciones/${publicacionId}/me-gusta`,
        { method: "POST" },
      );

      const datos: unknown = await respuesta.json();

      if (
        !respuesta.ok ||
        typeof datos !== "object" ||
        datos === null ||
        !("liked" in datos) ||
        typeof datos.liked !== "boolean" ||
        !("likesCount" in datos) ||
        typeof datos.likesCount !== "number"
      ) {
        throw new Error("No se ha podido actualizar el Me gusta.");
      }

      setMeGusta(datos.liked);
      setCantidad(datos.likesCount);
    } catch {
      setError("No se ha podido actualizar el Me gusta. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="acciones-publicacion">
      <button
        type="button"
        onClick={cambiarMeGusta}
        disabled={cargando}
        aria-pressed={meGusta}
      >
        {meGusta ? "♥ Te gusta" : "♡ Me gusta"}
      </button>

      <span aria-live="polite">
        {cantidad} {cantidad === 1 ? "Me gusta" : "Me gusta"}
      </span>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
