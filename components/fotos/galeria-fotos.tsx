"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatearTiempo } from "@/features/fechas/formatear-tiempo";

export type FotoItem = {
  id: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
};

export function GaleriaFotos({ fotos }: { fotos: FotoItem[] }) {
  const [fotoActiva, setFotoActiva] = useState<FotoItem | null>(null);

  useEffect(() => {
    if (!fotoActiva) return;

    function manejarTecla(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFotoActiva(null);
      }
    }

    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [fotoActiva]);

  if (fotos.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500">
        <p className="mb-3">Todavía no hay fotos en esta vista.</p>
        <Link
          href="/inicio"
          className="inline-block px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-medium hover:opacity-90"
        >
          Publicar una foto en Inicio
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {fotos.map((foto) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => setFotoActiva(foto)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-left cursor-pointer"
          >
            <Image
              src={foto.imageUrl}
              alt={foto.content || `Foto de ${foto.author.displayName}`}
              width={400}
              height={400}
              unoptimized
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-2.5 text-white">
              <p className="text-xs font-semibold truncate">
                {foto.author.displayName}
              </p>
              <p className="text-[11px] opacity-80 truncate">
                @{foto.author.username}
              </p>
            </div>
          </button>
        ))}
      </div>

      {fotoActiva && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detalle de foto"
          onClick={() => setFotoActiva(null)}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <Link
                href={`/perfil/${fotoActiva.author.username}`}
                className="flex items-center gap-2 hover:underline"
              >
                <span className="font-semibold text-sm">
                  {fotoActiva.author.displayName}
                </span>
                <span className="text-xs text-zinc-500">
                  @{fotoActiva.author.username}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setFotoActiva(null)}
                className="text-xs px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-black flex items-center justify-center max-h-[65vh] overflow-hidden">
              <Image
                src={fotoActiva.imageUrl}
                alt={fotoActiva.content || "Foto ampliada"}
                width={900}
                height={700}
                unoptimized
                className="w-full max-h-[65vh] object-contain"
              />
            </div>

            <div className="p-4 flex flex-col gap-2">
              {fotoActiva.content && (
                <p className="text-sm whitespace-pre-wrap">{fotoActiva.content}</p>
              )}
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>
                  {fotoActiva._count.likes} me gusta · {fotoActiva._count.comments}{" "}
                  comentarios
                </span>
                <time>{formatearTiempo(new Date(fotoActiva.createdAt))}</time>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}