"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function esUrlHttpValida(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function FormularioPublicacion() {
  const router = useRouter();
  const [contenido, setContenido] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const imagenLimpia = imageUrl.trim();
  const mostrarPreview = esUrlHttpValida(imagenLimpia);

  async function publicar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");

    const texto = contenido.trim();

    if (!texto && !imagenLimpia) {
      setMensaje("Escribe algo o añade una imagen antes de publicar.");
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch("/api/publicaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: texto,
          imageUrl: imagenLimpia || null,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.error || "No se ha podido publicar.");
        return;
      }

      setContenido("");
      setImageUrl("");
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
          disabled={enviando}
        />

        <div className="mt-1">
          <label htmlFor="imagen-publicacion" className="block mb-1">
            Imagen (URL opcional)
          </label>
          <input
            id="imagen-publicacion"
            name="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://ejemplo.com/foto.jpg"
            disabled={enviando}
            className="pg-input"
          />
        </div>

        {mostrarPreview && (
          <div className="mt-2 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)] max-w-md">
            <Image
              src={imagenLimpia}
              alt="Vista previa de la imagen"
              width={480}
              height={320}
              unoptimized
              className="w-full max-h-64 object-cover"
            />
          </div>
        )}

        <div className="publicacion-formulario-pie">
          <span>{contenido.length}/5000 caracteres</span>

          <button
            type="submit"
            disabled={enviando || (!contenido.trim() && !imagenLimpia)}
          >
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