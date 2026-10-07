import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
      { status: 401 },
    );
  }

  const body = await request.json();
  const receiverId = body.receiverId;

  if (typeof receiverId !== "string" || receiverId.length === 0) {
    return NextResponse.json(
      { error: "El destinatario no es válido." },
      { status: 400 },
    );
  }

  if (receiverId === session.user.id) {
    return NextResponse.json(
      { error: "No puedes enviarte una solicitud a ti mismo." },
      { status: 400 },
    );
  }

  const receiver = await prisma.user.findUnique({
    where: {
      id: receiverId,
    },
  });

  if (!receiver) {
    return NextResponse.json(
      { error: "El usuario no existe." },
      { status: 404 },
    );
  }

  const existingRequest = await prisma.friendRequest.findUnique({
    where: {
      senderId_receiverId: {
        senderId: session.user.id,
        receiverId,
      },
    },
  });

  if (existingRequest) {
    return NextResponse.json(
      { error: "Ya existe una solicitud pendiente." },
      { status: 409 },
    );
  }

  const friendRequest = await prisma.friendRequest.create({
    data: {
      senderId: session.user.id,
      receiverId,
    },
  });

  return NextResponse.json(
    {
      id: friendRequest.id,
      message: "Solicitud de amistad enviada.",
    },
    { status: 201 },
  );
}