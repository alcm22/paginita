import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { crearNotificacion } from "@/features/notificaciones/crear-notificacion";

const esquemaComentario = z.object({
  content: z.string().trim().min(1, "El comentario no puede estar vacío.").max(
    2000,
    "El comentario no puede superar los 2000 caracteres.",
  ),
});

type ContextoRuta = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: ContextoRuta,
) {
  const sesion = await getServerSession(authOptions);
  const usuarioId = sesion?.user?.id;

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para comentar." },
      { status: 401 },
    );
  }

  const { id: publicacionId } = await context.params;

  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la petición no es válido." },
      { status: 400 },
    );
  }

  const resultado = esquemaComentario.safeParse(cuerpo);

  if (!resultado.success) {
    return NextResponse.json(
      { error: resultado.error.issues[0]?.message ?? "Comentario no válido." },
      { status: 400 },
    );
  }

  try {
    const publicacion = await prisma.post.findUnique({
      where: { id: publicacionId },
      select: { id: true, authorId: true },
    });

    if (!publicacion) {
      return NextResponse.json(
        { error: "La publicación no existe." },
        { status: 404 },
      );
    }

    const comentario = await prisma.comment.create({
      data: {
        content: resultado.data.content,
        authorId: usuarioId,
        postId: publicacionId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Notificar al autor de la publicación
    await crearNotificacion({
      usuarioDestinoId: publicacion.authorId,
      actorId: usuarioId,
      tipo: "COMMENT",
      publicacionId,
    });

    return NextResponse.json({ comentario }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se ha podido guardar el comentario." },
      { status: 500 },
    );
  }
}