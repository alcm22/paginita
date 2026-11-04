
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPostSchema } from "@/features/publicaciones/validation";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
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

  const result = createPostSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "La publicación no es válida.",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const post = await prisma.post.create({
      data: {
        content: result.data.content,
        authorId: session.user.id,
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error al crear una publicación:", error);

    return NextResponse.json(
      { error: "No se ha podido crear la publicación." },
      { status: 500 },
    );
  }
}
