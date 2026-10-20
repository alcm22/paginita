
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

  const requests = await prisma.friendRequest.findMany({
    where: {
      senderId: session.user.id,
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
  });

  return NextResponse.json(requests);
}
