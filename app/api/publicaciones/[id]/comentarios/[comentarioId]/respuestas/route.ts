
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const esquemaRespuesta = z.object({
  content: z.string().trim().min(1).max(2000),
});

type ContextoRuta = {
  params: Promise<{
    id: string;
    comentarioId: string;
  }>;
};

export async function POST(
  request: Request,
  context: ContextoRuta,
) {
  const sesion = await getServerSession(authOptions);
  const usuarioId = sesion?.user?.id;

  if (!usuarioId) {
    return NextResponse.json(
      { error: "Debes iniciar sesión para responder a un comentario." },
      { status: 401 },
    );
  }

  const { id: publicacionId, comentarioId } = await context.params;

  try {
    let cuerpo: unknown;

    try {
      cuerpo = await request.json();
    } catch {
      return NextResponse.json(
        { error: "El cuerpo de la petición no es válido." },
        { status: 400 },
      );
    }

    const validacion = esquemaRespuesta.safeParse(cuerpo);

    if (!validacion.success) {
      return NextResponse.json(
        {
          error:
            "La respuesta no puede estar vacía ni superar los 2000 caracteres.",
        },
        { status: 400 },
      );
    }

    const comentario = await prisma.comment.findUnique({
      where: { id: comentarioId },
      select: {
        id: true,
        postId: true,
      },
    });

    if (!comentario || comentario.postId !== publicacionId) {
      return NextResponse.json(
        { error: "El comentario no existe en esta publicación." },
        { status: 404 },
      );
    }

    const respuestaCreada = await prisma.commentReply.create({
      data: {
        content: validacion.data.content,
        authorId: usuarioId,
        commentId: comentarioId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
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

    return NextResponse.json(
      { respuesta: respuestaCreada },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "No se ha podido crear la respuesta." },
      { status: 500 },
    );
  }
}
