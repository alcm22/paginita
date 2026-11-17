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
    <section className="max-w-3xl mx-auto">
      {/* Cabecera del perfil */}
      <header className="pg-card p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-center text-2xl font-bold text-[var(--accent-strong)] flex-shrink-0">
              {usuario.avatarUrl ? (
                <Image
                  src={usuario.avatarUrl}
                  alt={usuario.displayName}
                  width={80}
                  height={80}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                usuario.displayName.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold m-0">{usuario.displayName}</h1>
              <p className="text-sm text-[var(--muted)] m-0 mt-0.5">@{usuario.username}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <BotonAccionPerfil
              usuarioDestinoId={usuario.id}
              estadoInicial={estadoAmistad}
            />

            {estadoAmistad !== "PROPIO" &&
              (usuario.allowMessagesFrom === "EVERYONE" ||
              estadoAmistad === "AMIGOS" ? (
                <Link
                  href={`/mensajes?con=${usuario.username}`}
                  className="pg-btn-secundario text-xs"
                >
                  Enviar mensaje
                </Link>
              ) : (
                <span className="text-xs text-[var(--muted)]">
                  Solo acepta mensajes de amistades
                </span>
              ))}
          </div>
        </div>

        {usuario.bio && (
          <p className="mt-4 text-sm text-[var(--text)] whitespace-pre-line">
            {usuario.bio}
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-[var(--border)] flex flex-wrap items-center gap-6 text-sm text-[var(--muted)]">
          <div>
            <strong className="text-[var(--text)] font-bold">
              {usuario.totalPublicaciones}
            </strong>{" "}
            publicaciones
          </div>
          <div>
            <strong className="text-[var(--text)] font-bold">
              {usuario.totalAmigos}
            </strong>{" "}
            amigos
          </div>
          <div className="text-xs">
            Se unió en{" "}
            {new Date(usuario.createdAt).toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </header>

      {/* Muro de publicaciones del usuario */}
      <section aria-labelledby="titulo-publicaciones">
        <h2 id="titulo-publicaciones" className="text-lg font-bold mb-4">
          Publicaciones
        </h2>

        {publicaciones.length === 0 ? (
          <div className="pg-vacio">
            <p>Este usuario todavía no ha compartido ninguna publicación.</p>
          </div>
        ) : (
          <div className="lista-publicaciones">
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
                        unoptimized
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
                  imagenUrl={publicacion.imageUrl}
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