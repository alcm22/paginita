
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

  const { id } = await params;

  const friendRequest = await prisma.friendRequest.findUnique({
    where: {
      id,
    },
  });

  if (!friendRequest) {
    return NextResponse.json(
      { error: "La solicitud no existe o ya no está pendiente." },
      { status: 404 },
    );
  }

  if (friendRequest.senderId !== session.user.id) {
    return NextResponse.json(
      { error: "Solo puedes cancelar las solicitudes que has enviado." },
      { status: 403 },
    );
  }

  await prisma.friendRequest.delete({
    where: {
      id: friendRequest.id,
    },
  });

  return NextResponse.json({
    message: "Solicitud de amistad cancelada.",
  });
}
