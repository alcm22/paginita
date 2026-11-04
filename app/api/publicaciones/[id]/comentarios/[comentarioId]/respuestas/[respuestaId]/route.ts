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
    respuestaId: string;
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
      { error: "Debes iniciar sesión para editar una respuesta." },
      { status: 401 },
    );
  }

  const {
    id: publicacionId,
    comentarioId,
    respuestaId,
  } = await context.params;

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
        { error: "La respuesta no puede estar vacía ni superar los 2000 caracteres." },
        { status: 400 },
      );
    }

    const respuestaExistente = await prisma.commentReply.findFirst({
      where: {
        id: respuestaId,
        commentId: comentarioId,
        comment: {
          postId: publicacionId,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!respuestaExistente) {
      return NextResponse.json(
        { error: "La respuesta no existe en este comentario." },
        { status: 404 },
      );
    }

    if (respuestaExistente.authorId !== usuarioId) {
      return NextResponse.json(
        { error: "No puedes editar una respuesta de otra persona." },
        { status: 403 },
      );
    }

    const respuestaActualizada = await prisma.commentReply.update({
      where: {
        id: respuestaId,
      },
      data: {
        content: validacion.data.content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { respuesta: respuestaActualizada },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "No se ha podido actualizar la respuesta." },
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
      { error: "Debes iniciar sesión para eliminar una respuesta." },
      { status: 401 },
    );
  }

  const {
    id: publicacionId,
    comentarioId,
    respuestaId,
  } = await context.params;

  try {
    const respuestaExistente = await prisma.commentReply.findFirst({
      where: {
        id: respuestaId,
        commentId: comentarioId,
        comment: {
          postId: publicacionId,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!respuestaExistente) {
      return NextResponse.json(
        { error: "La respuesta no existe en este comentario." },
        { status: 404 },
      );
    }

    if (respuestaExistente.authorId !== usuarioId) {
      return NextResponse.json(
        { error: "No puedes eliminar una respuesta de otra persona." },
        { status: 403 },
      );
    }

    await prisma.commentReply.delete({
      where: {
        id: respuestaId,
      },
    });

    return NextResponse.json(
      { eliminado: true },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "No se ha podido eliminar la respuesta." },
      { status: 500 },
    );
  }
}