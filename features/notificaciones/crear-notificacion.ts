import { prisma } from "@/lib/db";

export type TipoNotificacion =
  | "FRIEND_REQUEST"
  | "LIKE"
  | "COMMENT"
  | "REPLY";

type CrearNotificacionParams = {
  usuarioDestinoId: string;
  actorId: string;
  tipo: TipoNotificacion;
  publicacionId?: string;
};

export async function crearNotificacion({
  usuarioDestinoId,
  actorId,
  tipo,
  publicacionId,
}: CrearNotificacionParams) {
  // Evitar notificarse a uno mismo
  if (usuarioDestinoId === actorId) {
    return null;
  }

  try {
    return await prisma.notification.create({
      data: {
        userId: usuarioDestinoId,
        actorId,
        type: tipo,
        postId: publicacionId,
      },
    });
  } catch (error) {
    // Si la notificación falla, registramos el error pero no bloqueamos la acción del usuario
    console.error("Error al crear notificación:", error);
    return null;
  }
}