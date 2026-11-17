import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { formatearTiempo } from "@/features/fechas/formatear-tiempo";
import { consultarPerfil } from "@/features/perfiles/consultar-perfil";
import { BotonMeGusta } from "@/components/publicaciones/boton-me-gusta";
import { ListaComentarios } from "@/components/publicaciones/lista-comentarios";
import { BotonAccionPerfil } from "@/components/perfil/boton-accion-perfil";
import { CuerpoPublicacion } from "@/components/publicaciones/cuerpo-publicacion";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function PerfilUsuarioPage({ params }: PageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const datos = await consultarPerfil(username, session?.user?.id);

  if (!datos) {
    notFound();
  }

  const { usuario, estadoAmistad, publicaciones } = datos;

  return (
    <section className="max-w-2xl mx-auto py-6 px-4">
      {/* Cabecera del perfil */}
      <header className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-600 dark:text-zinc-300">
              {usuario.avatarUrl ? (
                <Image
                  src={usuario.avatarUrl}
                  alt={usuario.displayName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                usuario.displayName.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{usuario.displayName}</h1>
              <p className="text-zinc-500">@{usuario.username}</p>
            </div>
          </div>

          <BotonAccionPerfil
            usuarioDestinoId={usuario.id}
            estadoInicial={estadoAmistad}
          />
        </div>

        {usuario.bio && (
          <p className="mt-4 text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
            {usuario.bio}
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          <div>
            <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
              {usuario.totalPublicaciones}
            </strong>{" "}
            publicaciones
          </div>
          <div>
            <strong className="text-zinc-900 dark:text-zinc-100 font-bold">
              {usuario.totalAmigos}
            </strong>{" "}
            amigos
          </div>
          <div className="text-xs text-zinc-400">
            Se unió en {new Date(usuario.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </div>
        </div>
      </header>

      {/* Muro de publicaciones del usuario */}
      <section aria-labelledby="titulo-publicaciones">
        <h2 id="titulo-publicaciones" className="text-lg font-bold mb-4">
          Publicaciones
        </h2>

        {publicaciones.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl text-zinc-500">
            <p>Este usuario todavía no ha compartido ninguna publicación.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {publicaciones.map((publicacion) => (
              <article className="tarjeta-publicacion" key={publicacion.id}>
                <header className="publicacion-autor">
                  <div className="avatar-publicacion">
                    {publicacion.author.avatarUrl ? (
                      <Image
                        src={publicacion.author.avatarUrl}
                        alt={`Foto de ${publicacion.author.displayName}`}
                        width={44}
                        height={44}
                        className="avatar-imagen"
                      />
                    ) : (
                      <span aria-hidden="true">
                        {publicacion.author.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <strong>{publicacion.author.displayName}</strong>
                    <p>@{publicacion.author.username}</p>
                    <time dateTime={publicacion.createdAt.toISOString()}>
                      {formatearTiempo(publicacion.createdAt)}
                    </time>
                  </div>
                </header>

                <CuerpoPublicacion
                publicacionId={publicacion.id}
                contenidoInicial={publicacion.content}
                esAutor={session?.user?.id === publicacion.author.id}
                />
                
                <BotonMeGusta
                  publicacionId={publicacion.id}
                  meGustaInicial={publicacion.likes.length > 0}
                  cantidadInicial={publicacion._count.likes}
                />

                <ListaComentarios
                  publicacionId={publicacion.id}
                  usuarioActualId={session?.user?.id ?? ""}
                  comentarios={publicacion.comments}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}