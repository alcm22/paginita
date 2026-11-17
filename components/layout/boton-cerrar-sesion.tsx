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
      className="mt-2 w-full text-left text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
    >
      {saliendo ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}