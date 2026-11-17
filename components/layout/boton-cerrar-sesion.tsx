"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function BotonCerrarSesion() {
  const [saliendo, setSaliendo] = useState(false);

  async function cerrarSesion() {
    setSaliendo(true);
    await signOut({ callbackUrl: "/acceso" });
  }

  return (
    <button
      type="button"
      onClick={() => void cerrarSesion()}
      disabled={saliendo}
      className="pg-btn-secundario logout-btn"
    >
      {saliendo ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );
}