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
      <div className="pg-vacio">
        <p className="mb-3">Todavía no hay fotos en esta vista.</p>
        <Link href="/inicio" className="pg-btn text-xs">
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
            className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] text-left cursor-pointer"
          >
            <Image
              src={foto.imageUrl}
              alt={foto.content || `Foto de ${foto.author.displayName}`}
              width={400}
              height={400}
              unoptimized
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-2.5 text-white">
              <p className="text-xs font-semibold truncate m-0">
                {foto.author.displayName}
              </p>
              <p className="text-[11px] opacity-85 truncate m-0">
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
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pg-card max-w-2xl w-full overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <Link
                href={`/perfil/${fotoActiva.author.username}`}
                className="flex items-center gap-2 hover:underline"
              >
                <span className="font-semibold text-sm text-[var(--text)]">
                  {fotoActiva.author.displayName}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  @{fotoActiva.author.username}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setFotoActiva(null)}
                className="pg-btn-secundario text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-[var(--background)] flex items-center justify-center max-h-[65vh] overflow-hidden">
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
                <p className="text-sm text-[var(--text)] whitespace-pre-wrap m-0">
                  {fotoActiva.content}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
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