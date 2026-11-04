
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const esquemaComentario = z.object({
  content: z
    .string()
    .trim()
    .min(1, "El comentario no puede estar vacío.")
    .max(2000, "El comentario no puede superar los 2000 caracteres."),
});

type ContextoRuta = {
  params: Promise<{
    id: string;
    comentarioId: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: ContextoRuta,
) {
  const sesion = await getServerSession(authOptions);
  const usuarioId = sesion?.user?.id;

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para editar un comentario." },
      { status: 401 },
    );
  }

  const { id: publicacionId, comentarioId } = await context.params;

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
      {
        error:
          resultado.error.issues[0]?.message ??
          "El comentario no es válido.",
      },
      { status: 400 },
    );
  }

  try {
    const comentario = await prisma.comment.findUnique({
      where: { id: comentarioId },
      select: {
        id: true,
        authorId: true,
        postId: true,
      },
    });

    if (!comentario || comentario.postId !== publicacionId) {
      return NextResponse.json(
        { error: "El comentario no existe en esta publicación." },
        { status: 404 },
      );
    }

    if (comentario.authorId !== usuarioId) {
      return NextResponse.json(
        { error: "Solo puedes editar tus propios comentarios." },
        { status: 403 },
      );
    }

    const comentarioActualizado = await prisma.comment.update({
      where: { id: comentarioId },
      data: { content: resultado.data.content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      comentario: comentarioActualizado,
    });
  } catch {
    return NextResponse.json(
      { error: "No se ha podido actualizar el comentario." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: ContextoRuta,
) {
  const sesion = await getServerSession(authOptions);
  const usuarioId = sesion?.user?.id;

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para eliminar un comentario." },
      { status: 401 },
    );
  }

  const { id: publicacionId, comentarioId } = await context.params;

  try {
    const comentario = await prisma.comment.findUnique({
      where: { id: comentarioId },
      select: {
        id: true,
        authorId: true,
        postId: true,
      },
    });

    if (!comentario || comentario.postId !== publicacionId) {
      return NextResponse.json(
        { error: "El comentario no existe en esta publicación." },
        { status: 404 },
      );
    }

    if (comentario.authorId !== usuarioId) {
      return NextResponse.json(
        { error: "Solo puedes eliminar tus propios comentarios." },
        { status: 403 },
      );
    }

    await prisma.comment.delete({
      where: { id: comentarioId },
    });

    return NextResponse.json({ eliminado: true });
  } catch {
    return NextResponse.json(
      { error: "No se ha podido eliminar el comentario." },
      { status: 500 },
    );
  }
}

