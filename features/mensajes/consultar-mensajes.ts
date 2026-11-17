import { prisma } from "@/lib/db";

export async function contarMensajesNoLeidos(usuarioId: string): Promise<number> {
  return prisma.message.count({
    where: {
      read: false,
      senderId: { not: usuarioId },
      conversation: {
        OR: [{ userAId: usuarioId }, { userBId: usuarioId }],
      },
    },
  });
}

export async function consultarConversaciones(usuarioId: string) {
  const conversaciones = await prisma.conversation.findMany({
    where: {
      OR: [{ userAId: usuarioId }, { userBId: usuarioId }],
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      userAId: true,
      userBId: true,
      updatedAt: true,
      userA: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          allowMessagesFrom: true,
        },
      },
      userB: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          allowMessagesFrom: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          senderId: true,
          read: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: {
              read: false,
              senderId: { not: usuarioId },
            },
          },
        },
      },
    },
  });

  return conversaciones.map((conv) => {
    const otroUsuario = conv.userAId === usuarioId ? conv.userB : conv.userA;
    const ultimoMensaje = conv.messages[0] ?? null;

    return {
      id: conv.id,
      updatedAt: conv.updatedAt,
      otroUsuario,
      ultimoMensaje,
      noLeidos: conv._count.messages,
    };
  });
}