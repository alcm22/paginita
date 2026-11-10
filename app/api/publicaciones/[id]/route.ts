import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const esquemaEdicion = z.object({
  content: z
    .string()
    .trim()
    .min(1, "El contenido no puede estar vacío.")
    .max(5000, "El contenido no puede superar los 5000 caracteres."),
});

type ContextoRuta = {
  params: Promise<{ id: string }>;
};

// EDITAR PUBLICACIÓN
export async function PATCH(request: Request, context: ContextoRuta) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
      { status: 401 },
    );
  }

  const { id: postId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la petición no es JSON válido." },
      { status: 400 },
    );
  }

  const validacion = esquemaEdicion.safeParse(body);
  if (!validacion.success) {
    return NextResponse.json(
      { error: validacion.error.issues[0]?.message ?? "Contenido no válido." },
      { status: 400 },
    );
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "La publicación no existe." },
        { status: 404 },
      );
    }

    // Solo el autor puede editar su propia publicación
    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para editar esta publicación." },
        { status: 403 },
      );
    }

    const publicacionActualizada = await prisma.post.update({
      where: { id: postId },
      data: {
        content: validacion.data.content,
      },
      select: {
        id: true,
        content: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(publicacionActualizada);
  } catch (error) {
    console.error("Error al actualizar la publicación:", error);
    return NextResponse.json(
      { error: "No se ha podido actualizar la publicación." },
      { status: 500 },
    );
  }
}

// ELIMINAR PUBLICACIÓN
export async function DELETE(_request: Request, context: ContextoRuta) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
      { status: 401 },
    );
  }

  const { id: postId } = await context.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "La publicación no existe." },
        { status: 404 },
      );
    }

    // Solo el autor puede eliminar su propia publicación
    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta publicación." },
        { status: 403 },
      );
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      ok: true,
      message: "Publicación eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar la publicación:", error);
    return NextResponse.json(
      { error: "No se ha podido eliminar la publicación." },
      { status: 500 },
    );
  }
}