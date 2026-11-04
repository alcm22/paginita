
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
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
      findUnique: vi.fn(),
    },
    postLike: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { POST } from "../../../app/api/publicaciones/[id]/me-gusta/route";

describe("POST /api/publicaciones/[id]/me-gusta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si no hay una sesión iniciada", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/publicaciones/publicacion-1/me-gusta",
      { method: "POST" },
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: "publicacion-1" }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Debes iniciar sesión.",
    });
  });

  it("da Me gusta a una publicación existente", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const { prisma } = await import("@/lib/db");

    vi.mocked(prisma.post.findUnique).mockResolvedValue({
      id: "publicacion-1",
    } as never);

    vi.mocked(prisma.postLike.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.postLike.create).mockResolvedValue({
      id: "like-1",
      userId: "usuario-123",
      postId: "publicacion-1",
      createdAt: new Date("2026-01-01T12:00:00.000Z"),
    });

    vi.mocked(prisma.postLike.count).mockResolvedValue(1);

    const request = new Request(
      "http://localhost/api/publicaciones/publicacion-1/me-gusta",
      { method: "POST" },
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: "publicacion-1" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      liked: true,
      likesCount: 1,
    });

    expect(prisma.postLike.create).toHaveBeenCalledWith({
      data: {
        userId: "usuario-123",
        postId: "publicacion-1",
      },
    });
  });

  it("quita Me gusta si el usuario ya había reaccionado", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const { prisma } = await import("@/lib/db");

    vi.mocked(prisma.post.findUnique).mockResolvedValue({
      id: "publicacion-1",
    } as never);

    vi.mocked(prisma.postLike.findUnique).mockResolvedValue({
      id: "like-1",
      userId: "usuario-123",
      postId: "publicacion-1",
      createdAt: new Date("2026-01-01T12:00:00.000Z"),
    });

    vi.mocked(prisma.postLike.delete).mockResolvedValue({
      id: "like-1",
      userId: "usuario-123",
      postId: "publicacion-1",
      createdAt: new Date("2026-01-01T12:00:00.000Z"),
    });

    vi.mocked(prisma.postLike.count).mockResolvedValue(0);

    const request = new Request(
      "http://localhost/api/publicaciones/publicacion-1/me-gusta",
      { method: "POST" },
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: "publicacion-1" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      liked: false,
      likesCount: 0,
    });

    expect(prisma.postLike.delete).toHaveBeenCalledWith({
      where: { id: "like-1" },
    });
  });

  it("devuelve 404 si la publicación no existe", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const { prisma } = await import("@/lib/db");

    vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

    const request = new Request(
      "http://localhost/api/publicaciones/no-existe/me-gusta",
      { method: "POST" },
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: "no-existe" }),
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "La publicación no existe.",
    });

    expect(prisma.postLike.create).not.toHaveBeenCalled();
    expect(prisma.postLike.delete).not.toHaveBeenCalled();
  });

  it("devuelve 500 si falla la base de datos", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const { prisma } = await import("@/lib/db");

    vi.mocked(prisma.post.findUnique).mockRejectedValue(
      new Error("Error interno de prueba"),
    );

    const request = new Request(
      "http://localhost/api/publicaciones/publicacion-1/me-gusta",
      { method: "POST" },
    );

    const response = await POST(request, {
      params: Promise.resolve({ id: "publicacion-1" }),
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "No se ha podido actualizar el Me gusta.",
    });
  });
});
