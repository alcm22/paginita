import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
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

  const { id } = await params;

  const friendRequest = await prisma.friendRequest.findUnique({
    where: {
      id,
    },
  });

  if (!friendRequest) {
    return NextResponse.json(
      { error: "La solicitud no existe." },
      { status: 404 },
    );
  }

  if (friendRequest.receiverId !== session.user.id) {
    return NextResponse.json(
      { error: "No puedes rechazar esta solicitud." },
      { status: 403 },
    );
  }

  await prisma.friendRequest.delete({
    where: {
      id: friendRequest.id,
    },
  });

  return NextResponse.json({
    message: "Solicitud de amistad rechazada.",
  });
}