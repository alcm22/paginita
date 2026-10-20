
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
      { status: 401 },
    );
  }

  const userId = session.user.id;

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
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
    orderBy: {
      createdAt: "desc",
    },
  });

  const friends = friendships.map((friendship) =>
    friendship.userAId === userId
      ? friendship.userB
      : friendship.userA,
  );

  return NextResponse.json(friends);
}
