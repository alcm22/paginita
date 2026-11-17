import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  consultarConversaciones,
  contarMensajesNoLeidos,
} from "@/features/mensajes/consultar-mensajes";
import {
  ordenarParticipantes,
  puedeEnviarMensaje,
} from "@/features/mensajes/permisos-mensajes";

const esquemaEnviarMensaje = z.object({
  destinatarioId: z.string().trim().min(1, "Falta el destinatario."),
  contenido: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío.")
    .max(2000, "El mensaje no puede superar los 2000 caracteres."),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
      { status: 401 },
    );
  }

  try {
    const [conversaciones, totalNoLeidos] = await Promise.all([
      consultarConversaciones(session.user.id),
      contarMensajesNoLeidos(session.user.id),
    ]);

    return NextResponse.json({ conversaciones, totalNoLeidos });
  } catch (error) {
    console.error("Error al consultar conversaciones:", error);
    return NextResponse.json(
      { error: "No se han podido cargar las conversaciones." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para enviar mensajes." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la petición no contiene JSON válido." },
      { status: 400 },
    );
  }

  const validacion = esquemaEnviarMensaje.safeParse(body);
  if (!validacion.success) {
    return NextResponse.json(
      { error: validacion.error.issues[0]?.message ?? "Datos no válidos." },
      { status: 400 },
    );
  }

  const remitenteId = session.user.id;
  const { destinatarioId, contenido } = validacion.data;

  try {
    const permiso = await puedeEnviarMensaje(remitenteId, destinatarioId);
    if (!permiso.permitido) {
      return NextResponse.json(
        { error: permiso.error },
        { status: permiso.estado },
      );
    }

    const [userAId, userBId] = ordenarParticipantes(remitenteId, destinatarioId);

    const conversacion = await prisma.conversation.upsert({
      where: {
        userAId_userBId: { userAId, userBId },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        userAId,
        userBId,
      },
      select: { id: true },
    });

    const mensaje = await prisma.message.create({
      data: {
        content: contenido,
        conversationId: conversacion.id,
        senderId: remitenteId,
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        read: true,
        createdAt: true,
        conversationId: true,
      },
    });

    return NextResponse.json(
      { mensaje, conversacionId: conversacion.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    return NextResponse.json(
      { error: "No se ha podido enviar el mensaje." },
      { status: 500 },
    );
  }
}