
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
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

  const { id: otherUserId } = await params;
  const userId = session.user.id;

  if (otherUserId === userId) {
    return NextResponse.json(
      { error: "No puedes consultar tu estado de amistad contigo mismo." },
      { status: 400 },
    );
  }

  const otherUser = await prisma.user.findUnique({
    where: {
      id: otherUserId,
    },
    select: {
      id: true,
    },
  });

  if (!otherUser) {
    return NextResponse.json(
      { error: "El usuario no existe." },
      { status: 404 },
    );
  }

  const [userAId, userBId] = [userId, otherUserId].sort();

  const friendship = await prisma.friendship.findUnique({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
  });

  if (friendship) {
    return NextResponse.json({ status: "friends" });
  }

  const [sentRequest, receivedRequest] = await Promise.all([
    prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: userId,
          receiverId: otherUserId,
        },
      },
    }),
    prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: otherUserId,
          receiverId: userId,
        },
      },
    }),
  ]);

  if (sentRequest) {
    return NextResponse.json({ status: "request_sent" });
  }

  if (receivedRequest) {
    return NextResponse.json({ status: "request_received" });
  }

  return NextResponse.json({ status: "none" });
}
