
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormularioComentario } from "@/components/publicaciones/formulario-comentarios";
import { formatearTiempo } from "@/features/fechas/formatear-tiempo";
import { FormularioRespuesta } from "@/components/publicaciones/formulario-respuesta";

type RespuestaComentario = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
};

type Comentario = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  replies: RespuestaComentario[];
};

type ListaComentariosProps = {
  publicacionId: string;
  usuarioActualId: string;
  comentarios: Comentario[];
};

export function ListaComentarios({
  publicacionId,
  usuarioActualId,
  comentarios,
}: ListaComentariosProps) {
    
    const router = useRouter();
    const [comentarioEnEdicion, setComentarioEnEdicion] = useState<string | null>(null);
    const [contenidoEditado, setContenidoEditado] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [errorEdicion, setErrorEdicion] = useState("");
    const [errorEliminacion, setErrorEliminacion] = useState("");
    const [respuestaEnEdicion, setRespuestaEnEdicion] = useState<string | null>(null);
    const [contenidoRespuestaEditado, setContenidoRespuestaEditado] = useState("");
    const [errorEdicionRespuesta, setErrorEdicionRespuesta] = useState("");
    const [errorEliminacionRespuesta, setErrorEliminacionRespuesta] = useState("");
 
    function actualizarComentarios() {
    router.refresh();
  }


async function guardarComentario(comentarioId: string) {
  const texto = contenidoEditado.trim();

  if (!texto) {
    setErrorEdicion("El comentario no puede estar vacío.");
    return;
  }

  if (texto.length > 2000) {
    setErrorEdicion("El comentario no puede superar los 2000 caracteres.");
    return;
  }

  setGuardando(true);
  setErrorEdicion("");

  try {
    const respuesta = await fetch(
      `/api/publicaciones/${publicacionId}/comentarios/${comentarioId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: texto }),
      },
    );

    const datos: unknown = await respuesta.json();

    if (
      !respuesta.ok ||
      typeof datos !== "object" ||
      datos === null ||
      !("comentario" in datos)
    ) {
      const mensaje =
        typeof datos === "object" &&
        datos !== null &&
        "error" in datos &&
        typeof datos.error === "string"
          ? datos.error
          : "No se ha podido actualizar el comentario.";

      throw new Error(mensaje);
    }

    setComentarioEnEdicion(null);
    setContenidoEditado("");
    router.refresh();
  } catch (errorDesconocido) {
    setErrorEdicion(
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "Ha ocurrido un error al guardar el comentario.",
    );
  } finally {
    setGuardando(false);
  }
}


async function eliminarComentario(comentarioId: string) {
  const confirmado = window.confirm(
    "¿Seguro que quieres eliminar este comentario? Esta acción no se puede deshacer.",
  );

  if (!confirmado) {
    return;
  }

  setErrorEliminacion("");
  setGuardando(true);

  try {
    const respuesta = await fetch(
      `/api/publicaciones/${publicacionId}/comentarios/${comentarioId}`,
      {
        method: "DELETE",
      },
    );

    const datos: unknown = await respuesta.json();

    if (
      !respuesta.ok ||
      typeof datos !== "object" ||
      datos === null ||
      !("eliminado" in datos) ||
      datos.eliminado !== true
    ) {
      const mensaje =
        typeof datos === "object" &&
        datos !== null &&
        "error" in datos &&
        typeof datos.error === "string"
          ? datos.error
          : "No se ha podido eliminar el comentario.";

      throw new Error(mensaje);
    }

    if (comentarioEnEdicion === comentarioId) {
      setComentarioEnEdicion(null);
      setContenidoEditado("");
    }

    router.refresh();
  } catch (errorDesconocido) {
      setErrorEliminacion(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "Ha ocurrido un error al eliminar el comentario.",
      );
  } finally {
    setGuardando(false);
  }
}
async function guardarRespuesta(
  comentarioId: string,
  respuestaId: string,
) {
  const texto = contenidoRespuestaEditado.trim();

  if (!texto) {
    setErrorEdicionRespuesta("La respuesta no puede estar vacía.");
    return;
  }

  if (texto.length > 2000) {
    setErrorEdicionRespuesta(
      "La respuesta no puede superar los 2000 caracteres.",
    );
    return;
  }

  setGuardando(true);
  setErrorEdicionRespuesta("");

  try {
    const respuesta = await fetch(
      `/api/publicaciones/${publicacionId}/comentarios/${comentarioId}/respuestas/${respuestaId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: texto }),
      },
    );

    const datos: unknown = await respuesta.json();

    if (
      !respuesta.ok ||
      typeof datos !== "object" ||
      datos === null ||
      !("respuesta" in datos)
    ) {
      const mensaje =
        typeof datos === "object" &&
        datos !== null &&
        "error" in datos &&
        typeof datos.error === "string"
          ? datos.error
          : "No se ha podido actualizar la respuesta.";

      throw new Error(mensaje);
    }

    setRespuestaEnEdicion(null);
    setContenidoRespuestaEditado("");
    router.refresh();
  } catch (errorDesconocido) {
    setErrorEdicionRespuesta(
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "Ha ocurrido un error al guardar la respuesta.",
    );
  } finally {
    setGuardando(false);
  }
}
async function eliminarRespuesta(
  comentarioId: string,
  respuestaId: string,
) {
  const confirmado = window.confirm(
    "¿Seguro que quieres eliminar esta respuesta? Esta acción no se puede deshacer.",
  );

  if (!confirmado) {
    return;
  }

  setErrorEliminacionRespuesta("");
  setGuardando(true);

  try {
    const respuesta = await fetch(
      `/api/publicaciones/${publicacionId}/comentarios/${comentarioId}/respuestas/${respuestaId}`,
      {
        method: "DELETE",
      },
    );

    const datos: unknown = await respuesta.json();

    if (
      !respuesta.ok ||
      typeof datos !== "object" ||
      datos === null ||
      !("eliminado" in datos) ||
      datos.eliminado !== true
    ) {
      const mensaje =
        typeof datos === "object" &&
        datos !== null &&
        "error" in datos &&
        typeof datos.error === "string"
          ? datos.error
          : "No se ha podido eliminar la respuesta.";

      throw new Error(mensaje);
    }

    if (respuestaEnEdicion === respuestaId) {
      setRespuestaEnEdicion(null);
      setContenidoRespuestaEditado("");
    }

    router.refresh();
  } catch (errorDesconocido) {
    setErrorEliminacionRespuesta(
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "Ha ocurrido un error al eliminar la respuesta.",
    );
  } finally {
    setGuardando(false);
  }
}


  return (
    <section
      className="lista-comentarios"
      aria-label="Comentarios de la publicación"
    >
      <h3>Comentarios ({comentarios.length})</h3>

      {comentarios.length === 0 ? (
        <p className="comentarios-vacios">
          Todavía no hay comentarios. ¡Sé la primera persona en comentar!
        </p>
      ) : (
        <ul>
          {comentarios.map((comentario) => (
            <li key={comentario.id} className="comentario">
              <div className="comentario-cabecera">
                <strong>{comentario.author.displayName}</strong>
                <span>@{comentario.author.username}</span>
                <time dateTime={comentario.createdAt.toISOString()}>
                  {formatearTiempo(comentario.createdAt)}
                </time>

                {comentario.author.id === usuarioActualId && (
                  <div className="comentario-acciones">
                    <button
                      type="button"
                      disabled={guardando}
                      onClick={() => {
                        setComentarioEnEdicion(comentario.id);
                        setContenidoEditado(comentario.content);
                        setErrorEdicion("");
                      }}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={guardando}
                      onClick={() => eliminarComentario(comentario.id)}
                    >
                      Eliminar
                    </button>

                    {errorEliminacion && (
                      <p role="alert">{errorEliminacion}</p>
                    )}
                  </div>
                )}
              </div>

              {comentarioEnEdicion === comentario.id ? (
                <div className="comentario-edicion">
                  <textarea
                    value={contenidoEditado}
                    onChange={(evento) =>
                      setContenidoEditado(evento.target.value)
                    }
                    maxLength={2000}
                    rows={3}
                    aria-label="Editar comentario"
                    disabled={guardando}
                  />

                  {errorEdicion && <p role="alert">{errorEdicion}</p>}

                  <div className="comentario-edicion-acciones">
                    <button
                      type="button"
                      disabled={guardando}
                      onClick={() => {
                        setComentarioEnEdicion(null);
                        setContenidoEditado("");
                        setErrorEdicion("");
                      }}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      disabled={guardando || !contenidoEditado.trim()}
                      onClick={() => guardarComentario(comentario.id)}
                    >
                      {guardando ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              ) : (
                <p>{comentario.content}</p>
              )}

              {comentario.replies.length > 0 && (
                <ul className="lista-respuestas">
                  {comentario.replies.map((respuesta) => (
                    <li
                      key={respuesta.id}
                      className="respuesta-comentario"
                    >
                      <div className="comentario-cabecera">
                        <strong>{respuesta.author.displayName}</strong>
                        <span>@{respuesta.author.username}</span>
                        <time dateTime={respuesta.createdAt.toISOString()}>
                          {formatearTiempo(respuesta.createdAt)}
                        </time>

                        {respuesta.author.id === usuarioActualId && (
                          <div className="comentario-acciones">
                            <button
                              type="button"
                              disabled={guardando}
                              onClick={() => {
                                setRespuestaEnEdicion(respuesta.id);
                                setContenidoRespuestaEditado(
                                  respuesta.content
                                );
                                setErrorEdicionRespuesta("");
                              }}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              disabled={guardando}
                              onClick={() =>
                                eliminarRespuesta(
                                  comentario.id,
                                  respuesta.id
                                )
                              }
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>

                      {errorEliminacionRespuesta && (
                        <p role="alert">{errorEliminacionRespuesta}</p>
                      )}

                      {respuestaEnEdicion === respuesta.id ? (
                        <div className="comentario-edicion">
                          <textarea
                            value={contenidoRespuestaEditado}
                            onChange={(evento) =>
                              setContenidoRespuestaEditado(
                                evento.target.value
                              )
                            }
                            maxLength={2000}
                            rows={3}
                            aria-label="Editar respuesta"
                            disabled={guardando}
                          />

                          {errorEdicionRespuesta && (
                            <p role="alert">{errorEdicionRespuesta}</p>
                          )}

                          <div className="comentario-edicion-acciones">
                            <button
                              type="button"
                              disabled={guardando}
                              onClick={() => {
                                setRespuestaEnEdicion(null);
                                setContenidoRespuestaEditado("");
                                setErrorEdicionRespuesta("");
                              }}
                            >
                              Cancelar
                            </button>

                            <button
                              type="button"
                              disabled={
                                guardando ||
                                !contenidoRespuestaEditado.trim()
                              }
                              onClick={() =>
                                guardarRespuesta(
                                  comentario.id,
                                  respuesta.id
                                )
                              }
                            >
                              {guardando ? "Guardando..." : "Guardar"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p>{respuesta.content}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <FormularioRespuesta
                publicacionId={publicacionId}
                comentarioId={comentario.id}
              />
            </li>
          ))}
        </ul>
      )}

      <FormularioComentario
        publicacionId={publicacionId}
        alCrearComentario={actualizarComentarios}
      />
    </section>
  );
}