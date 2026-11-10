import { prisma } from "@/lib/db";

export async function consultarNotificaciones(usuarioId?: string) {
  if (!usuarioId) {
    return [];
  }

  return prisma.notification.findMany({
    where: {
      userId: usuarioId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
    include: {
      actor: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
      post: {
        select: {
          id: true,
          content: true,
        },
      },
    },
  });
}