import { prisma } from "@/lib/db";

export type FiltroFotos = "todas" | "amigos" | "mias";

export async function consultarFotos(
  usuarioId: string,
  filtro: FiltroFotos = "todas",
) {
  let authorFilter: { in: string[] } | string | undefined;

  if (filtro === "mias") {
    authorFilter = usuarioId;
  } else if (filtro === "amigos") {
    const amistades = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: usuarioId }, { userBId: usuarioId }],
      },
      select: {
        userAId: true,
        userBId: true,
      },
    });

    const amigosIds = amistades.map((a) =>
      a.userAId === usuarioId ? a.userBId : a.userAId,
    );

    authorFilter = { in: [usuarioId, ...amigosIds] };
  }

  const publicaciones = await prisma.post.findMany({
    where: {
      imageUrl: { not: null },
      ...(authorFilter ? { authorId: authorFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      content: true,
      imageUrl: true,
      createdAt: true,
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
          comments: true,
        },
      },
    },
  });

  return publicaciones.filter(
    (p): p is typeof p & { imageUrl: string } => Boolean(p.imageUrl),
  );
}