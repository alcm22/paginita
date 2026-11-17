import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { FormularioPublicacion } from "@/components/publicaciones/formulario-publicacion";
import { consultarPublicaciones, FiltroFeed } from "@/features/publicaciones/consultar-publicaciones";
import { formatearTiempo } from "@/features/fechas/formatear-tiempo";
import { BotonMeGusta } from "@/components/publicaciones/boton-me-gusta";
import { ListaComentarios } from "@/components/publicaciones/lista-comentarios";
import { CuerpoPublicacion } from "@/components/publicaciones/cuerpo-publicacion";

type InicioPageProps = {
  searchParams?: Promise<{ filtro?: string }> | { filtro?: string };
};

export default async function InicioPage({ searchParams }: InicioPageProps) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await searchParams;

  const estaAutenticado = Boolean(session?.user?.id);
  const filtro: FiltroFeed =
    resolvedParams?.filtro === "todos" || !estaAutenticado ? "todos" : "amigos";

  const publicaciones = await consultarPublicaciones(session?.user?.id, filtro);

  return (
    <section className="inicio">
      <header className="inicio-cabecera">
        <p className="eyebrow">Tu comunidad</p>
        <h1>Inicio</h1>
        <p>Comparte tus ideas y cuéntales a tus amistades qué tal estás.</p>
      </header>

      <FormularioPublicacion />

      <section className="muro-publicaciones" aria-labelledby="titulo-muro">
        <div className="flex items-center justify-between border-b pb-3 mb-6">
          <h2 id="titulo-muro" className="text-xl font-bold m-0">
            {filtro === "amigos" ? "Publicaciones de amigos" : "Todas las publicaciones"}
          </h2>

          <nav className="flex gap-2" aria-label="Filtro de publicaciones">
            <Link
              href="/inicio?filtro=amigos"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filtro === "amigos"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              Amigos
            </Link>
            <Link
              href="/inicio?filtro=todos"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filtro === "todos"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              Todos
            </Link>
          </nav>
        </div>

        {publicaciones.length === 0 ? (
          <div className="muro-vacio">
            {filtro === "amigos" ? (
              <div>
                <p>Todavía no hay publicaciones de tus amigos.</p>
                <p className="mt-2 text-sm opacity-80">
                  Puedes buscar a otras personas en la sección de{" "}
                  <Link href="/amigos" className="underline font-semibold">
                    Amigos
                  </Link>{" "}
                  o explorar el muro{" "}
                  <Link href="/inicio?filtro=todos" className="underline font-semibold">
                    Global (Todos)
                  </Link>.
                </p>
              </div>
            ) : (
              <p>Todavía no hay publicaciones. ¡Sé la primera persona en compartir algo!</p>
            )}
          </div>
        ) : (
          <div className="lista-publicaciones">
            {publicaciones.map((publicacion) => (
              <article className="tarjeta-publicacion" key={publicacion.id}>
                <header className="publicacion-autor">
                  <Link
                    href={`/perfil/${publicacion.author.username}`}
                    className="avatar-publicacion hover:opacity-85 transition-opacity"
                  >
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
                  </Link>

                  <div>
                    <Link
                      href={`/perfil/${publicacion.author.username}`}
                      className="hover:underline font-bold text-inherit block"
                    >
                      {publicacion.author.displayName}
                    </Link>
                    <Link
                      href={`/perfil/${publicacion.author.username}`}
                      className="text-xs text-zinc-500 hover:underline block"
                    >
                      @{publicacion.author.username}
                    </Link>
                    <time dateTime={publicacion.createdAt.toISOString()}>
                      {formatearTiempo(publicacion.createdAt)}
                    </time>
                  </div>
                </header>

              <CuerpoPublicacion
                imagenUrl={publicacion.imageUrl}
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