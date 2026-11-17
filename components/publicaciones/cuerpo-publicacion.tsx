"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  publicacionId: string;
  contenidoInicial: string;
  imagenUrl?: string | null;
  esAutor: boolean;
};

export function CuerpoPublicacion({
  publicacionId,
  contenidoInicial,
  imagenUrl,
  esAutor,
}: Props) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [contenido, setContenido] = useState(contenidoInicial);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardarEdicion(e: React.FormEvent) {
    e.preventDefault();
    const limpio = contenido.trim();
    if (!limpio) return;

    setGuardando(true);
    setError(null);

    try {
      const res = await fetch(`/api/publicaciones/${publicacionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: limpio }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al editar");
      }

      setEditando(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!window.confirm("¿Seguro que quieres eliminar esta publicación?")) {
      return;
    }

    setEliminando(true);
    try {
      const res = await fetch(`/api/publicaciones/${publicacionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
      setEliminando(false);
    }
  }

  if (editando) {
    return (
      <form onSubmit={guardarEdicion} className="mt-3 flex flex-col gap-2">
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={3}
          maxLength={5000}
          required
          className="pg-input"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={guardando || !contenido.trim()}
            className="pg-btn text-xs px-3 py-1.5"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditando(false);
              setContenido(contenidoInicial);
            }}
            className="pg-btn-secundario text-xs px-3 py-1.5"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-3">
      {contenidoInicial && (
        <p className="texto-publicacion">{contenidoInicial}</p>
      )}

      {imagenUrl && (
        <div className="mt-3 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)]">
          <Image
            src={imagenUrl}
            alt="Imagen de la publicación"
            width={800}
            height={600}
            unoptimized
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {esAutor && (
        <div className="flex gap-4 mt-3 text-xs text-[var(--muted)]">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="hover:text-[var(--accent-strong)] cursor-pointer font-semibold"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={eliminar}
            disabled={eliminando}
            className="hover:text-red-400 cursor-pointer disabled:opacity-50 font-semibold"
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      )}
    </div>
  );
}