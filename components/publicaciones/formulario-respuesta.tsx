"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormularioRespuestaProps = {
  publicacionId: string;
  comentarioId: string;
};

export function FormularioRespuesta({
  publicacionId,
  comentarioId,
}: FormularioRespuestaProps) {
  const router = useRouter();
  const [contenido, setContenido] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function enviarRespuesta(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const texto = contenido.trim();

    if (!texto) {
      setError("La respuesta no puede estar vacía.");
      return;
    }

    if (texto.length > 2000) {
      setError("La respuesta no puede superar los 2000 caracteres.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const respuesta = await fetch(
        `/api/publicaciones/${publicacionId}/comentarios/${comentarioId}/respuestas`,
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
        !("respuesta" in datos)
      ) {
        const mensaje =
          typeof datos === "object" &&
          datos !== null &&
          "error" in datos &&
          typeof datos.error === "string"
            ? datos.error
            : "No se ha podido guardar la respuesta.";

        throw new Error(mensaje);
      }

      setContenido("");
      router.refresh();
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "Ha ocurrido un error al guardar la respuesta.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviarRespuesta} className="formulario-respuesta">
      <label htmlFor={`respuesta-${comentarioId}`}>
        Escribe una respuesta
      </label>

      <textarea
        id={`respuesta-${comentarioId}`}
        value={contenido}
        onChange={(evento) => setContenido(evento.target.value)}
        maxLength={2000}
        rows={2}
        disabled={guardando}
        placeholder="Responde a este comentario..."
      />

      {error && <p role="alert">{error}</p>}

      <button
        type="submit"
        disabled={guardando || !contenido.trim()}
      >
        {guardando ? "Enviando..." : "Responder"}
      </button>
    </form>
  );
}
