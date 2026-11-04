
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock, postFindUniqueMock, commentCreateMock } =
  vi.hoisted(() => ({
    getServerSessionMock: vi.fn(),
    postFindUniqueMock: vi.fn(),
    commentCreateMock: vi.fn(),
  }));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    post: {
      findUnique: postFindUniqueMock,
    },
    comment: {
      create: commentCreateMock,
    },
  },
}));

import { POST } from "../../../app/api/publicaciones/[id]/comentarios/route";

describe("POST /api/publicaciones/[id]/comentarios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si no hay una sesión iniciada", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/publicaciones/publicacion-1/comentarios",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Hola" }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: "publicacion-1" }),
    });

    expect(response.status).toBe(401);
    expect(postFindUniqueMock).not.toHaveBeenCalled();
    expect(commentCreateMock).not.toHaveBeenCalled();
  });

  it("rechaza un comentario vacío", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-1" },
    });

    const request = new Request(
      "http://localhost/api/publicaciones/publicacion-1/comentarios",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "   " }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: "publicacion-1" }),
    });

    expect(response.status).toBe(400);
    expect(commentCreateMock).not.toHaveBeenCalled();
  });

  it("devuelve 404 si la publicación no existe", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-1" },
    });
    postFindUniqueMock.mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/publicaciones/no-existe/comentarios",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Mi comentario" }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: "no-existe" }),
    });

    expect(response.status).toBe(404);
    expect(commentCreateMock).not.toHaveBeenCalled();
  });

  it("crea un comentario con el usuario autenticado", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-1" },
    });
    postFindUniqueMock.mockResolvedValue({ id: "publicacion-1" });
    commentCreateMock.mockResolvedValue({
      id: "comentario-1",
      content: "¡Qué buena publicación!",
      createdAt: new Date("2026-10-27T10:00:00.000Z"),
      author: {
        id: "usuario-1",
        displayName: "Usuario Uno",
        username: "usuario1",
        avatarUrl: null,
      },
    });

    const request = new Request(
      "http://localhost/api/publicaciones/publicacion-1/comentarios",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "  ¡Qué buena publicación!  " }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: "publicacion-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(commentCreateMock).toHaveBeenCalledWith({
      data: {
        content: "¡Qué buena publicación!",
        authorId: "usuario-1",
        postId: "publicacion-1",
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
    expect(data.comentario.content).toBe("¡Qué buena publicación!");
  });
});

