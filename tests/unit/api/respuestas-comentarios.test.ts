
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  commentFindUniqueMock,
  commentReplyCreateMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  commentFindUniqueMock: vi.fn(),
  commentReplyCreateMock: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    comment: {
      findUnique: commentFindUniqueMock,
    },
    commentReply: {
      create: commentReplyCreateMock,
    },
  },
}));

import { POST } from "../../../app/api/publicaciones/[id]/comentarios/[comentarioId]/respuestas/route";

const publicacionId = "publicacion-1";
const comentarioId = "comentario-1";
const usuarioId = "usuario-1";

function crearContexto() {
  return {
    params: Promise.resolve({
      id: publicacionId,
      comentarioId,
    }),
  };
}

function crearPeticion(cuerpo: unknown) {
  return new Request(
    `http://localhost/api/publicaciones/${publicacionId}/comentarios/${comentarioId}/respuestas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cuerpo),
    },
  );
}

describe("POST /api/publicaciones/[id]/comentarios/[comentarioId]/respuestas", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getServerSessionMock.mockResolvedValue({
      user: { id: usuarioId },
    });

    commentFindUniqueMock.mockResolvedValue({
      id: comentarioId,
      postId: publicacionId,
    });

    commentReplyCreateMock.mockResolvedValue({
      id: "respuesta-1",
      content: "Mi respuesta",
      createdAt: new Date("2026-01-01T12:00:00.000Z"),
      updatedAt: new Date("2026-01-01T12:00:00.000Z"),
      author: {
        id: usuarioId,
        displayName: "Usuario de prueba",
        username: "usuario",
        avatarUrl: null,
      },
    });
  });

  it("devuelve 401 si no hay una sesión iniciada", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const respuesta = await POST(
      crearPeticion({ content: "Mi respuesta" }),
      crearContexto(),
    );

    expect(respuesta.status).toBe(401);
    expect(commentReplyCreateMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 si la respuesta está vacía", async () => {
    const respuesta = await POST(
      crearPeticion({ content: "   " }),
      crearContexto(),
    );

    expect(respuesta.status).toBe(400);
    expect(commentReplyCreateMock).not.toHaveBeenCalled();
  });

  it("devuelve 404 si el comentario no existe", async () => {
    commentFindUniqueMock.mockResolvedValue(null);

    const respuesta = await POST(
      crearPeticion({ content: "Mi respuesta" }),
      crearContexto(),
    );

    expect(respuesta.status).toBe(404);
    expect(commentReplyCreateMock).not.toHaveBeenCalled();
  });

  it("devuelve 404 si el comentario pertenece a otra publicación", async () => {
    commentFindUniqueMock.mockResolvedValue({
      id: comentarioId,
      postId: "otra-publicacion",
    });

    const respuesta = await POST(
      crearPeticion({ content: "Mi respuesta" }),
      crearContexto(),
    );

    expect(respuesta.status).toBe(404);
    expect(commentReplyCreateMock).not.toHaveBeenCalled();
  });

  it("crea una respuesta con el usuario autenticado", async () => {
    const respuesta = await POST(
      crearPeticion({ content: "  Mi respuesta  " }),
      crearContexto(),
    );

    expect(respuesta.status).toBe(201);

    expect(commentReplyCreateMock).toHaveBeenCalledWith({
      data: {
        content: "Mi respuesta",
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

    await expect(respuesta.json()).resolves.toMatchObject({
      respuesta: {
        id: "respuesta-1",
        content: "Mi respuesta",
        author: {
          id: usuarioId,
        },
      },
    });
  });
});
