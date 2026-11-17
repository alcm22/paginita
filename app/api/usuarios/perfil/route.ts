import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const esquemaPerfil = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "El nombre para mostrar no puede estar vacío.")
    .max(50, "El nombre no puede superar los 50 caracteres."),
  bio: z
    .string()
    .trim()
    .max(280, "La biografía no puede superar los 280 caracteres.")
    .optional()
    .nullable(),
  avatarUrl: z
    .string()
    .trim()
    .url("El avatar debe ser una URL válida (ej. https://...).")
    .optional()
    .nullable()
    .or(z.literal("")),
  allowMessagesFrom: z
    .enum(["EVERYONE", "FRIENDS"], {
      message: "La preferencia de mensajes debe ser EVERYONE o FRIENDS.",
    })
    .optional(),
});

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para editar tu perfil." },
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

  const validacion = esquemaPerfil.safeParse(body);
  if (!validacion.success) {
    return NextResponse.json(
      { error: validacion.error.issues[0]?.message ?? "Datos de perfil no válidos." },
      { status: 400 },
    );
  }

  try {
    const usuarioActualizado = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: validacion.data.displayName,
        bio: validacion.data.bio ? validacion.data.bio : null,
        avatarUrl: validacion.data.avatarUrl ? validacion.data.avatarUrl : null,
        ...(validacion.data.allowMessagesFrom !== undefined
          ? { allowMessagesFrom: validacion.data.allowMessagesFrom }
          : {}),
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        bio: true,
        allowMessagesFrom: true,
      },
    });

    return NextResponse.json(usuarioActualizado);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      { error: "No se ha podido actualizar el perfil." },
      { status: 500 },
    );
  }
}