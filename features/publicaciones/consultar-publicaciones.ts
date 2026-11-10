import { prisma } from "@/lib/db";

export type FiltroFeed = "amigos" | "todos";

export async function consultarPublicaciones(
  usuarioId?: string,
  filtro: FiltroFeed = "todos",
) {
  let whereClause = undefined;

  if (filtro === "amigos") {
    if (!usuarioId) {
      return [];
    }

    const amistades = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: usuarioId }, { userBId: usuarioId }],
      },
      select: {
        userAId: true,
        userBId: true,
      },
    });

    const amigosIds = amistades.map((amistad) =>
      amistad.userAId === usuarioId ? amistad.userBId : amistad.userAId,
    );

    whereClause = {
      authorId: {
        in: [usuarioId, ...amigosIds],
      },
    };
  }

  return prisma.post.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    take: 50,

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
        where: usuarioId ? { userId: usuarioId } : { userId: "__sin_usuario__" },
        select: {
          id: true,
        },
        take: 1,
      },

      comments: {
        orderBy: {
          createdAt: "asc",
        },
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
            orderBy: {
              createdAt: "asc",
            },
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
}