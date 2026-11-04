
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  _request: Request,
  context: RouteContext,
) {
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
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "La publicación no existe." },
        { status: 404 },
      );
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });

      const likesCount = await prisma.postLike.count({
        where: { postId },
      });

      return NextResponse.json({
        liked: false,
        likesCount,
      });
    }

    await prisma.postLike.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });

    const likesCount = await prisma.postLike.count({
      where: { postId },
    });

    return NextResponse.json({
      liked: true,
      likesCount,
    });
  } catch (error) {
    console.error("Error al cambiar el Me gusta:", error);

    return NextResponse.json(
      { error: "No se ha podido actualizar el Me gusta." },
      { status: 500 },
    );
  }
}