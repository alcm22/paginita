import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { puedeEnviarMensaje } from "@/features/mensajes/permisos-mensajes";

export async function GET(
  _request: Request,
  context: { params: Promise<{ conversacionId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
      { status: 401 },
    );
  }

  const userId = session.user.id;
  const { conversacionId } = await context.params;

  try {
    const conversacion = await prisma.conversation.findUnique({
      where: { id: conversacionId },
      select: {
        id: true,
        userAId: true,
        userBId: true,
        userA: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            allowMessagesFrom: true,
          },
        },
        userB: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            allowMessagesFrom: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            senderId: true,
            read: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversacion) {
      return NextResponse.json(
        { error: "Conversación no encontrada." },
        { status: 404 },
      );
    }

    if (conversacion.userAId !== userId && conversacion.userBId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para ver esta conversación." },
        { status: 403 },
      );
    }

    await prisma.message.updateMany({
      where: {
        conversationId: conversacionId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    const otroUsuario =
      conversacion.userAId === userId ? conversacion.userB : conversacion.userA;

    const permiso = await puedeEnviarMensaje(userId, otroUsuario.id);

    return NextResponse.json({
      id: conversacion.id,
      otroUsuario,
      puedeResponder: permiso.permitido,
      motivoBloqueo: permiso.permitido ? null : permiso.error,
      mensajes: conversacion.messages,
    });
  } catch (error) {
    console.error("Error al cargar conversación:", error);
    return NextResponse.json(
      { error: "No se han podido cargar los mensajes." },
      { status: 500 },
    );
  }
}