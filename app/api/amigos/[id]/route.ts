
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
      { status: 401 },
    );
  }

  const { id: friendId } = await params;
  const userId = session.user.id;

  if (friendId === userId) {
    return NextResponse.json(
      { error: "No puedes eliminarte a ti mismo de tus amigos." },
      { status: 400 },
    );
  }

  const [userAId, userBId] = [userId, friendId].sort();

  const friendship = await prisma.friendship.findUnique({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
  });

  if (!friendship) {
    return NextResponse.json(
      { error: "Esta amistad no existe." },
      { status: 404 },
    );
  }

  await prisma.friendship.delete({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
  });

  return NextResponse.json({
    message: "Amistad eliminada correctamente.",
  });
}
