import { prisma } from "@/lib/db";

export type PerfilBasico = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
};

export type SolicitudRecibida = {
  id: string;
  createdAt: Date;
  sender: PerfilBasico;
};

export type SolicitudEnviada = {
  id: string;
  createdAt: Date;
  receiver: PerfilBasico;
};

export type DatosAmigos = {
  amigos: PerfilBasico[];
  solicitudesRecibidas: SolicitudRecibida[];
  solicitudesEnviadas: SolicitudEnviada[];
};

export async function consultarDatosAmigos(
  usuarioId?: string,
): Promise<DatosAmigos> {
  if (!usuarioId) {
    return {
      amigos: [],
      solicitudesRecibidas: [],
      solicitudesEnviadas: [],
    };
  }

  const [amistades, recibidas, enviadas] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        OR: [{ userAId: usuarioId }, { userBId: usuarioId }],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        userA: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
        userB: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    }),

    prisma.friendRequest.findMany({
      where: {
        receiverId: usuarioId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sender: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    }),

    prisma.friendRequest.findMany({
      where: {
        senderId: usuarioId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        receiver: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    }),
  ]);

  const amigos = amistades.map((amistad) =>
    amistad.userAId === usuarioId ? amistad.userB : amistad.userA,
  );

  return {
    amigos,
    solicitudesRecibidas: recibidas,
    solicitudesEnviadas: enviadas,
  };
}