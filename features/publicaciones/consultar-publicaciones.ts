import { prisma } from "@/lib/db";

export async function consultarPublicaciones(usuarioId?: string) {
  return prisma.post.findMany({
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
