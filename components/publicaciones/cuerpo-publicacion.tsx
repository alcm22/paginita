"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  publicacionId: string;
  contenidoInicial: string;
  esAutor: boolean;
};

export function CuerpoPublicacion({
  publicacionId,
  contenidoInicial,
  esAutor,
}: Props) {
  const router = useRouter();
  const [contenido, setContenido] = useState(contenidoInicial);
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState(contenidoInicial);
  const [cargando, setCargando] = useState(false);
  const [eliminado, setEliminado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (eliminado) {
    return null; // Ocultar inmediatamente la publicación al borrarla
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!textoEditado.trim()) return;

    setCargando(true);
    setError(null);

    try {
      const res = await fetch(`/api/publicaciones/${publicacionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textoEditado.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar la publicación");
      }

      const postActualizado = await res.json();
      setContenido(postActualizado.content);
      setEditando(false);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error inesperado al guardar los cambios.");
      }
    } finally {
      setCargando(false);
    }
  }

  async function handleEliminar() {
    const seguro = window.confirm(
      "¿Estás seguro de que quieres eliminar esta publicación?",
    );
    if (!seguro) return;

    setCargando(true);
    try {
      const res = await fetch(`/api/publicaciones/${publicacionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }

      setEliminado(true);
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar la publicación");
    } finally {
      setCargando(false);
    }
  }

  if (editando) {
    return (
      <form onSubmit={handleGuardar} className="my-3 flex flex-col gap-2">
        <textarea
          value={textoEditado}
          onChange={(e) => setTextoEditado(e.target.value)}
          className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={cargando}
          required
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              setTextoEditado(contenido);
              setEditando(false);
              setError(null);
            }}
            disabled={cargando}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando || !textoEditado.trim()}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {cargando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="my-2">
      <p className="texto-publicacion">{contenido}</p>

      {esAutor && (
        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
          <button
            onClick={() => setEditando(true)}
            className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Editar
          </button>
          <span>·</span>
          <button
            onClick={handleEliminar}
            className="hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}