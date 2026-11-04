
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock, postCreateMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  postCreateMock: vi.fn(),
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
      create: postCreateMock,
    },
  },
}));

import { POST } from "../../../app/api/publicaciones/route";

describe("POST /api/publicaciones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si no hay una sesión iniciada", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const request = new Request("http://localhost/api/publicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Hola, Paginita" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(postCreateMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 si la publicación está vacía", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const request = new Request("http://localhost/api/publicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "   " }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(postCreateMock).not.toHaveBeenCalled();
  });

  it("crea una publicación con el usuario autenticado como autor", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const publicacion = {
      id: "publicacion-1",
      content: "Hola, Paginita",
      createdAt: new Date("2026-01-01T12:00:00.000Z"),
      updatedAt: new Date("2026-01-01T12:00:00.000Z"),
      author: {
        id: "usuario-123",
        displayName: "Ana",
        username: "ana",
        avatarUrl: null,
      },
    };

    postCreateMock.mockResolvedValue(publicacion);

    const request = new Request("http://localhost/api/publicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "  Hola, Paginita  ",
        authorId: "otro-usuario",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
  ...publicacion,
  createdAt: publicacion.createdAt.toISOString(),
  updatedAt: publicacion.updatedAt.toISOString(),
});
    expect(postCreateMock).toHaveBeenCalledWith({
      data: {
        content: "Hola, Paginita",
        authorId: "usuario-123",
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
  });

  it("devuelve 500 si falla la base de datos", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    postCreateMock.mockRejectedValue(new Error("Error interno de prueba"));

    const request = new Request("http://localhost/api/publicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Hola, Paginita" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "No se ha podido crear la publicación.",
    });
  });
});

