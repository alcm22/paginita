import { prisma } from "@/lib/db";

export type EstadoAmistad =
  | "PROPIO"
  | "AMIGOS"
  | "SOLICITUD_ENVIADA"
  | "SOLICITUD_RECIBIDA"
  | "NINGUNA";

export async function consultarPerfil(
  username: string,
  usuarioActualId?: string,
) {
  const usuario = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!usuario) {
    return null;
  }

  // Contar amistades totales del usuario
  const totalAmigos = await prisma.friendship.count({
    where: {
      OR: [{ userAId: usuario.id }, { userBId: usuario.id }],
    },
  });

  // Determinar la relación de amistad con el usuario que navega
  let estadoAmistad: EstadoAmistad = "NINGUNA";

  if (usuarioActualId) {
    if (usuarioActualId === usuario.id) {
      estadoAmistad = "PROPIO";
    } else {
      const [amistad, solicitudEnviada, solicitudRecibida] = await Promise.all([
        prisma.friendship.findFirst({
          where: {
            OR: [
              { userAId: usuarioActualId, userBId: usuario.id },
              { userAId: usuario.id, userBId: usuarioActualId },
            ],
          },
        }),
        prisma.friendRequest.findUnique({
          where: {
            senderId_receiverId: {
              senderId: usuarioActualId,
              receiverId: usuario.id,
            },
          },
        }),
        prisma.friendRequest.findUnique({
          where: {
            senderId_receiverId: {
              senderId: usuario.id,
              receiverId: usuarioActualId,
            },
          },
        }),
      ]);

      if (amistad) {
        estadoAmistad = "AMIGOS";
      } else if (solicitudEnviada) {
        estadoAmistad = "SOLICITUD_ENVIADA";
      } else if (solicitudRecibida) {
        estadoAmistad = "SOLICITUD_RECIBIDA";
      }
    }
  }

  // Obtener publicaciones del usuario
  const publicaciones = await prisma.post.findMany({
    where: { authorId: usuario.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
      likes: {
        where: usuarioActualId
          ? { userId: usuarioActualId }
          : { userId: "__sin_usuario__" },
        select: { id: true },
        take: 1,
      },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
          replies: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  displayName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return {
    usuario: {
      ...usuario,
      totalAmigos,
      totalPublicaciones: usuario._count.posts,
    },
    estadoAmistad,
    publicaciones,
  };
}