
import { FormularioPublicacion } from "@/components/publicaciones/formulario-publicacion";
import { consultarPublicaciones } from "@/features/publicaciones/consultar-publicaciones";
import { formatearTiempo } from "@/features/fechas/formatear-tiempo";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BotonMeGusta } from "@/components/publicaciones/boton-me-gusta";
import { ListaComentarios } from "@/components/publicaciones/lista-comentarios";

export default async function InicioPage() {
  const session = await getServerSession(authOptions);
  const publicaciones = await consultarPublicaciones(session?.user?.id);

  return (
    <section className="inicio">
      <header className="inicio-cabecera">
        <p className="eyebrow">Tu comunidad</p>
        <h1>Inicio</h1>
        <p>Comparte tus ideas y cuéntales a tus amistades qué tal estás.</p>
      </header>

      <FormularioPublicacion />

      <section className="muro-publicaciones" aria-labelledby="titulo-muro">
        <h2 id="titulo-muro">Publicaciones recientes</h2>

        {publicaciones.length === 0 ? (
          <p className="muro-vacio">
            Todavía no hay publicaciones. ¡Sé la primera persona en compartir algo!
          </p>
        ) : (
          <div className="lista-publicaciones">
            {publicaciones.map((publicacion) => (
              <article className="tarjeta-publicacion" key={publicacion.id}>
                <header className="publicacion-autor">
                  <div className="avatar-publicacion">
                    {publicacion.author.avatarUrl ? (
                      <Image
                        src={publicacion.author.avatarUrl}
                        alt={`Foto de perfil de ${publicacion.author.displayName}`}
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

                <p className="texto-publicacion">{publicacion.content}</p>
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
