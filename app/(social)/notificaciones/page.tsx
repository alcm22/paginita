import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { formatearTiempo } from "@/features/fechas/formatear-tiempo";
import { consultarNotificaciones } from "@/features/notificaciones/consultar-notificaciones";
import { BotonMarcarLeidas } from "@/components/notificaciones/boton-marcar-leidas";

export default async function NotificacionesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/iniciar-sesion");
  }

  const notificaciones = await consultarNotificaciones(session.user.id);
  const tieneNoLeidas = notificaciones.some((n) => !n.read);

  function textoNotificacion(tipo: string) {
    switch (tipo) {
      case "LIKE":
        return "le ha gustado tu publicación.";
      case "COMMENT":
        return "ha comentado en tu publicación.";
      case "REPLY":
        return "ha respondido a tu comentario.";
      case "FRIEND_REQUEST":
        return "te ha enviado una solicitud de amistad.";
      default:
        return "ha interactuado contigo.";
    }
  }

  return (
    <section className="max-w-2xl mx-auto py-6 px-4">
      <header className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          <p className="text-sm text-zinc-500">Mantente al tanto de la actividad de tu cuenta</p>
        </div>

        {tieneNoLeidas && <BotonMarcarLeidas />}
      </header>

      {notificaciones.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p>No tienes notificaciones todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notificaciones.map((notif) => (
            <article
              key={notif.id}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                notif.read
                  ? "bg-transparent border-zinc-200 dark:border-zinc-800"
                  : "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-zinc-200 flex items-center justify-center font-bold text-zinc-600">
                {notif.actor.avatarUrl ? (
                  <Image
                    src={notif.actor.avatarUrl}
                    alt={notif.actor.displayName}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  notif.actor.displayName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {notif.actor.displayName}
                  </strong>{" "}
                  {textoNotificacion(notif.type)}
                </p>

                {notif.post && (
                  <p className="text-xs text-zinc-500 truncate mt-1 italic">
                    &ldquo;{notif.post.content}&rdquo;
                  </p>
                )}

                <time className="text-xs text-zinc-400 mt-1 block">
                  {formatearTiempo(notif.createdAt)}
                </time>
              </div>

              {notif.type === "FRIEND_REQUEST" && (
                <Link
                  href="/amigos"
                  className="text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1.5 rounded-md font-medium hover:opacity-90"
                >
                  Ver solicitud
                </Link>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}