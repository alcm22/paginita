import { prisma } from "@/lib/db";

export function ordenarParticipantes(
  usuarioAId: string,
  usuarioBId: string,
): [string, string] {
  return usuarioAId < usuarioBId
    ? [usuarioAId, usuarioBId]
    : [usuarioBId, usuarioAId];
}

export type ResultadoPermisoMensaje =
  | { permitido: true }
  | { permitido: false; estado: 400 | 403 | 404; error: string };

export async function puedeEnviarMensaje(
  remitenteId: string,
  destinatarioId: string,
): Promise<ResultadoPermisoMensaje> {
  if (remitenteId === destinatarioId) {
    return {
      permitido: false,
      estado: 400,
      error: "No puedes enviarte mensajes a ti mismo.",
    };
  }

  const destinatario = await prisma.user.findUnique({
    where: { id: destinatarioId },
    select: {
      id: true,
      allowMessagesFrom: true,
    },
  });

  if (!destinatario) {
    return {
      permitido: false,
      estado: 404,
      error: "El usuario destinatario no existe.",
    };
  }

  if (destinatario.allowMessagesFrom === "FRIENDS") {
    const amistad = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userAId: remitenteId, userBId: destinatarioId },
          { userAId: destinatarioId, userBId: remitenteId },
        ],
      },
      select: { id: true },
    });

    if (!amistad) {
      return {
        permitido: false,
        estado: 403,
        error: "Este usuario solo acepta mensajes de sus amistades.",
      };
    }
  }

  return { permitido: true };
}