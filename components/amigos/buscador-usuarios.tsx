"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { PerfilBasico } from "@/features/amigos/consultar-datos-amigos";

export function BuscadorUsuarios() {
  const router = useRouter();
  const [termino, setTermino] = useState("");
  const [resultados, setResultados] = useState<PerfilBasico[]>([]);
  const [cargando, setCargando] = useState(false);
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState<string[]>([]);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    const busqueda = termino.trim();

    if (busqueda.length < 2) {
      return;
    }

    let cancelado = false;

    const temporizador = setTimeout(async () => {
      setCargando(true);
      setMensajeError(null);

      try {
        const res = await fetch(
          `/api/usuarios/buscar?q=${encodeURIComponent(busqueda)}`,
        );

        if (!res.ok) {
          throw new Error("No se pudo realizar la búsqueda.");
        }

        const datos: PerfilBasico[] = await res.json();
        if (!cancelado) {
          setResultados(datos);
        }
      } catch (err) {
        if (!cancelado) {
          setMensajeError(
            err instanceof Error
              ? err.message
              : "Ha ocurrido un error al buscar usuarios.",
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [termino]);

  function handleChangeTermino(e: React.ChangeEvent<HTMLInputElement>) {
    const nuevoValor = e.target.value;
    setTermino(nuevoValor);

    if (nuevoValor.trim().length < 2) {
      setResultados([]);
      setCargando(false);
      setMensajeError(null);
    }
  }

  async function enviarSolicitud(destinatarioId: string) {
    setEnviandoId(destinatarioId);
    setMensajeError(null);

    try {
      const res = await fetch("/api/amigos/solicitudes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: destinatarioId }),
      });

      const datos: unknown = await res.json();

      if (!res.ok) {
        const mensaje =
          typeof datos === "object" &&
          datos !== null &&
          "error" in datos &&
          typeof datos.error === "string"
            ? datos.error
            : "No se ha podido enviar la solicitud.";
        throw new Error(mensaje);
      }

      setSolicitudesEnviadas((prev) => [...prev, destinatarioId]);
      router.refresh();
    } catch (err) {
      setMensajeError(
        err instanceof Error
          ? err.message
          : "Error al enviar la solicitud de amistad.",
      );
    } finally {
      setEnviandoId(null);
    }
  }

  const resultadosVisibles = termino.trim().length < 2 ? [] : resultados;

  return (
    <section className="seccion-buscar-amigos" aria-labelledby="titulo-buscar-amigos">
      <h2 id="titulo-buscar-amigos">Buscar nuevas amistades</h2>

      <div className="campo-busqueda">
        <label htmlFor="busqueda-usuarios" className="sr-only">
          Buscar por nombre o usuario
        </label>
        <input
          id="busqueda-usuarios"
          type="search"
          value={termino}
          onChange={handleChangeTermino}
          placeholder="Escribe al menos 2 letras para buscar personas..."
          autoComplete="off"
        />
      </div>

      {cargando && <p className="texto-ayuda">Buscando personas...</p>}

      {mensajeError && (
        <p role="alert" className="mensaje-error">
          {mensajeError}
        </p>
      )}

      {termino.trim().length >= 2 && !cargando && resultadosVisibles.length === 0 && (
        <p className="texto-ayuda">No se encontraron personas con ese nombre o usuario.</p>
      )}

      {resultadosVisibles.length > 0 && (
        <ul className="lista-resultados-busqueda">
          {resultadosVisibles.map((usuario) => {
            const yaEnviada = solicitudesEnviadas.includes(usuario.id);
            const enviando = enviandoId === usuario.id;

            return (
              <li key={usuario.id} className="tarjeta-usuario-resultado">
                <div className="avatar-usuario">
                  {usuario.avatarUrl ? (
                    <Image
                      src={usuario.avatarUrl}
                      alt={`Foto de ${usuario.displayName}`}
                      width={44}
                      height={44}
                      className="avatar-imagen"
                    />
                  ) : (
                    <span aria-hidden="true">
                      {usuario.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="datos-usuario">
                  <strong>{usuario.displayName}</strong>
                  <span>@{usuario.username}</span>
                </div>

                <div className="acciones-resultado">
                  <button
                    type="button"
                    disabled={enviando || yaEnviada}
                    onClick={() => enviarSolicitud(usuario.id)}
                  >
                    {enviando
                      ? "Enviando..."
                      : yaEnviada
                        ? "Solicitud enviada"
                        : "Añadir amigo"}
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