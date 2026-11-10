"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type {
  SolicitudRecibida,
  SolicitudEnviada,
} from "@/features/amigos/consultar-datos-amigos";

type SolicitudesAmistadProps = {
  solicitudesRecibidas: SolicitudRecibida[];
  solicitudesEnviadas: SolicitudEnviada[];
};

export function SolicitudesAmistad({
  solicitudesRecibidas,
  solicitudesEnviadas,
}: SolicitudesAmistadProps) {
  const router = useRouter();
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function aceptarSolicitud(id: string) {
    setProcesandoId(id);
    setError(null);

    try {
      const res = await fetch(`/api/amigos/solicitudes/${id}/aceptar`, {
        method: "POST",
      });
      const datos: unknown = await res.json();

      if (!res.ok) {
        const mensaje =
          typeof datos === "object" && datos !== null && "error" in datos && typeof datos.error === "string"
            ? datos.error
            : "No se ha podido aceptar la solicitud.";
        throw new Error(mensaje);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al aceptar la solicitud.");
    } finally {
      setProcesandoId(null);
    }
  }

  async function rechazarSolicitud(id: string) {
    setProcesandoId(id);
    setError(null);

    try {
      const res = await fetch(`/api/amigos/solicitudes/${id}/rechazar`, {
        method: "POST",
      });
      const datos: unknown = await res.json();

      if (!res.ok) {
        const mensaje =
          typeof datos === "object" && datos !== null && "error" in datos && typeof datos.error === "string"
            ? datos.error
            : "No se ha podido rechazar la solicitud.";
        throw new Error(mensaje);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al rechazar la solicitud.");
    } finally {
      setProcesandoId(null);
    }
  }

  async function cancelarSolicitud(id: string) {
    setProcesandoId(id);
    setError(null);

    try {
      const res = await fetch(`/api/amigos/solicitudes/${id}/cancelar`, {
        method: "DELETE",
      });
      const datos: unknown = await res.json();

      if (!res.ok) {
        const mensaje =
          typeof datos === "object" && datos !== null && "error" in datos && typeof datos.error === "string"
            ? datos.error
            : "No se ha podido cancelar la solicitud.";
        throw new Error(mensaje);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cancelar la solicitud.");
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <div className="seccion-solicitudes">
      {error && <p role="alert" className="mensaje-error">{error}</p>}

      {/* Solicitudes Recibidas */}
      <section className="solicitudes-recibidas" aria-labelledby="titulo-solicitudes-recibidas">
        <h2 id="titulo-solicitudes-recibidas">
          Solicitudes recibidas ({solicitudesRecibidas.length})
        </h2>

        {solicitudesRecibidas.length === 0 ? (
          <p className="solicitudes-vacias">No tienes solicitudes de amistad pendientes.</p>
        ) : (
          <ul className="lista-solicitudes">
            {solicitudesRecibidas.map((solicitud) => {
              const ocupado = procesandoId === solicitud.id;
              return (
                <li key={solicitud.id} className="tarjeta-solicitud">
                  <div className="avatar-usuario">
                    {solicitud.sender.avatarUrl ? (
                      <Image
                        src={solicitud.sender.avatarUrl}
                        alt={`Foto de ${solicitud.sender.displayName}`}
                        width={40}
                        height={40}
                        className="avatar-imagen"
                      />
                    ) : (
                      <span aria-hidden="true">
                        {solicitud.sender.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="datos-usuario">
                    <strong>{solicitud.sender.displayName}</strong>
                    <span>@{solicitud.sender.username}</span>
                  </div>

                  <div className="acciones-solicitud">
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => aceptarSolicitud(solicitud.id)}
                    >
                      {ocupado ? "Aceptando..." : "Aceptar"}
                    </button>
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => rechazarSolicitud(solicitud.id)}
                    >
                      {ocupado ? "Rechazando..." : "Rechazar"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Solicitudes Enviadas */}
      <section className="solicitudes-enviadas" aria-labelledby="titulo-solicitudes-enviadas">
        <h2 id="titulo-solicitudes-enviadas">
          Solicitudes enviadas ({solicitudesEnviadas.length})
        </h2>

        {solicitudesEnviadas.length === 0 ? (
          <p className="solicitudes-vacias">No tienes solicitudes enviadas pendientes.</p>
        ) : (
          <ul className="lista-solicitudes">
            {solicitudesEnviadas.map((solicitud) => {
              const ocupado = procesandoId === solicitud.id;
              return (
                <li key={solicitud.id} className="tarjeta-solicitud">
                  <div className="avatar-usuario">
                    {solicitud.receiver.avatarUrl ? (
                      <Image
                        src={solicitud.receiver.avatarUrl}
                        alt={`Foto de ${solicitud.receiver.displayName}`}
                        width={40}
                        height={40}
                        className="avatar-imagen"
                      />
                    ) : (
                      <span aria-hidden="true">
                        {solicitud.receiver.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="datos-usuario">
                    <strong>{solicitud.receiver.displayName}</strong>
                    <span>@{solicitud.receiver.username}</span>
                  </div>

                  <div className="acciones-solicitud">
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => cancelarSolicitud(solicitud.id)}
                    >
                      {ocupado ? "Cancelando..." : "Cancelar"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}