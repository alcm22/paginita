
"use client";

import { FormEvent, useState } from "react";

type FormularioComentarioProps = {
  publicacionId: string;
  alCrearComentario: () => void;
};

export function FormularioComentario({
  publicacionId,
  alCrearComentario,
}: FormularioComentarioProps) {
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  async function enviarComentario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const texto = contenido.trim();

    if (!texto) {
      setError("Escribe algo antes de enviar el comentario.");
      setExito("");
      return;
    }

    if (texto.length > 2000) {
      setError("El comentario no puede superar los 2000 caracteres.");
      setExito("");
      return;
    }

    setCargando(true);
    setError("");
    setExito("");

    try {
      const respuesta = await fetch(
        `/api/publicaciones/${publicacionId}/comentarios`,
        {
          method: "POST",
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
            : "No se ha podido publicar el comentario.";

        throw new Error(mensaje);
      }

      setContenido("");
      setExito("Comentario publicado.");
      alCrearComentario();
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "Ha ocurrido un error. Inténtalo de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <form className="formulario-comentario" onSubmit={enviarComentario}>
      <label htmlFor={`comentario-${publicacionId}`}>
        Escribe un comentario
      </label>

      <textarea
        id={`comentario-${publicacionId}`}
        value={contenido}
        onChange={(evento) => setContenido(evento.target.value)}
        placeholder="¿Qué te gustaría comentar?"
        maxLength={2000}
        rows={3}
        disabled={cargando}
        required
      />

      <div className="formulario-comentario-pie">
        <span>{contenido.length}/2000</span>

        <button type="submit" disabled={cargando || !contenido.trim()}>
          {cargando ? "Publicando..." : "Comentar"}
        </button>
      </div>

      {error && <p role="alert">{error}</p>}
      {exito && <p role="status">{exito}</p>}
    </form>
  );
}
