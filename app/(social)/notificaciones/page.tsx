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
    redirect("/acceso");
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
    <section className="max-w-3xl mx-auto">
      <header className="pg-cabecera flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Actividad</p>
          <h1>Notificaciones</h1>
          <p>Mantente al tanto de la actividad de tu cuenta.</p>
        </div>

        {tieneNoLeidas && <BotonMarcarLeidas />}
      </header>

      {notificaciones.length === 0 ? (
        <div className="pg-vacio">
          <p>No tienes notificaciones todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notificaciones.map((notif) => (
            <article
              key={notif.id}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                notif.read
                  ? "bg-[var(--surface)] border-[var(--border)]"
                  : "bg-[#1a2b21] border-[#4b7d5f]"
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-[var(--border)] bg-[#365543] flex items-center justify-center font-bold text-[#eaffdb]">
                {notif.actor.avatarUrl ? (
                  <Image
                    src={notif.actor.avatarUrl}
                    alt={notif.actor.displayName}
                    width={40}
                    height={40}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                ) : (
                  notif.actor.displayName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text)] m-0">
                  <strong className="font-semibold">
                    {notif.actor.displayName}
                  </strong>{" "}
                  {textoNotificacion(notif.type)}
                </p>

                {notif.post && (
                  <p className="text-xs text-[var(--muted)] truncate mt-1 italic">
                    &ldquo;{notif.post.content}&rdquo;
                  </p>
                )}

                <time className="text-xs text-[var(--muted)] mt-1 block">
                  {formatearTiempo(notif.createdAt)}
                </time>
              </div>

              {notif.type === "FRIEND_REQUEST" && (
                <Link href="/amigos" className="pg-btn text-xs">
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