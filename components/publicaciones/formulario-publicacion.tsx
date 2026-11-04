
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FormularioPublicacion() {
  const router = useRouter();  
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function publicar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");

    const texto = contenido.trim();

    if (!texto) {
      setMensaje("Escribe algo antes de publicar.");
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch("/api/publicaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: texto }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.error || "No se ha podido publicar.");
        return;
      }

      setContenido("");
      setMensaje("¡Tu publicación se ha creado correctamente!");
      router.refresh();
    } catch {
      setMensaje("No se ha podido conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="publicacion-formulario" aria-labelledby="titulo-publicacion">
      <h2 id="titulo-publicacion">¿Qué quieres compartir?</h2>

      <form onSubmit={publicar}>
        <label htmlFor="contenido-publicacion">
          Escribe tu publicación
        </label>

        <textarea
          id="contenido-publicacion"
          name="content"
          value={contenido}
          onChange={(event) => setContenido(event.target.value)}
          placeholder="¿Qué tienes en mente?"
          maxLength={5000}
          rows={4}
          required
          disabled={enviando}
        />

        <div className="publicacion-formulario-pie">
          <span>{contenido.length}/5000 caracteres</span>

          <button type="submit" disabled={enviando || !contenido.trim()}>
            {enviando ? "Publicando..." : "Publicar"}
          </button>
        </div>

        {mensaje && (
          <p role="status" aria-live="polite">
            {mensaje}
          </p>
        )}
      </form>
    </section>
  );
}
