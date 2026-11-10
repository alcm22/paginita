"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { PerfilBasico } from "@/features/amigos/consultar-datos-amigos";

type ListaAmigosProps = {
  amigos: PerfilBasico[];
};

export function ListaAmigos({ amigos }: ListaAmigosProps) {
  const router = useRouter();
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function eliminarAmigo(amigoId: string, nombre: string) {
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar a ${nombre} de tus amigos? Esta acción no se puede deshacer.`,
    );

    if (!confirmado) {
      return;
    }

    setEliminandoId(amigoId);
    setError(null);

    try {
      const res = await fetch(`/api/amigos/${amigoId}`, {
        method: "DELETE",
      });

      const datos: unknown = await res.json();

      if (!res.ok) {
        const mensaje =
          typeof datos === "object" &&
          datos !== null &&
          "error" in datos &&
          typeof datos.error === "string"
            ? datos.error
            : "No se ha podido eliminar la amistad.";
        throw new Error(mensaje);
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar la amistad.",
      );
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <section className="seccion-amigos" aria-labelledby="titulo-mis-amigos">
      <h2 id="titulo-mis-amigos">Mis amigos ({amigos.length})</h2>

      {error && (
        <p role="alert" className="mensaje-error">
          {error}
        </p>
      )}

      {amigos.length === 0 ? (
        <p className="amigos-vacio">
          Todavía no tienes amigos agregados. ¡Envía una solicitud para conectar con otras personas!
        </p>
      ) : (
        <ul className="lista-amigos-cuadricula">
          {amigos.map((amigo) => {
            const ocupado = eliminandoId === amigo.id;
            return (
              <li key={amigo.id} className="tarjeta-amigo">
                <div className="avatar-usuario">
                  {amigo.avatarUrl ? (
                    <Image
                      src={amigo.avatarUrl}
                      alt={`Foto de ${amigo.displayName}`}
                      width={48}
                      height={48}
                      className="avatar-imagen"
                    />
                  ) : (
                    <span aria-hidden="true">
                      {amigo.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="datos-usuario">
                  <strong>{amigo.displayName}</strong>
                  <span>@{amigo.username}</span>
                </div>

                <div className="acciones-amigo">
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => eliminarAmigo(amigo.id, amigo.displayName)}
                  >
                    {ocupado ? "Eliminando..." : "Eliminar de amigos"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}