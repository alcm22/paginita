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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "Hola Paginita" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("devuelve 400 si el contenido está vacío y no hay imagen", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "usuario-123",
      },
    });

    const request = new Request("http://localhost/api/publicaciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "   " }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(postCreateMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 si imageUrl no es una URL válida", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "usuario-123",
      },
    });

    const request = new Request("http://localhost/api/publicaciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "Hola", imageUrl: "no-es-url" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(postCreateMock).not.toHaveBeenCalled();
  });

  it("crea la publicación cuando hay sesión y contenido válido", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "usuario-123",
      },
    });

    const publicacionCreada = {
      id: "post-1",
      content: "Mi primera publicación",
      imageUrl: null,
      createdAt: new Date("2026-10-22T12:00:00.000Z"),
      updatedAt: new Date("2026-10-22T12:00:00.000Z"),
      author: {
        id: "usuario-123",
        displayName: "Manuel",
        username: "manuel",
        avatarUrl: null,
      },
    };

    postCreateMock.mockResolvedValue(publicacionCreada);

    const request = new Request("http://localhost/api/publicaciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "  Mi primera publicación  " }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(postCreateMock).toHaveBeenCalledWith({
      data: {
        content: "Mi primera publicación",
        imageUrl: null,
        authorId: "usuario-123",
      },
      select: {
        id: true,
        content: true,
        imageUrl: true,
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
    expect(data.id).toBe("post-1");
  });

  it("crea la publicación con imagen aunque no tenga texto", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "usuario-123",
      },
    });

    const publicacionCreada = {
      id: "post-2",
      content: "",
      imageUrl: "https://ejemplo.com/foto.jpg",
      createdAt: new Date("2026-11-17T10:00:00.000Z"),
      updatedAt: new Date("2026-11-17T10:00:00.000Z"),
      author: {
        id: "usuario-123",
        displayName: "Manuel",
        username: "manuel",
        avatarUrl: null,
      },
    };

    postCreateMock.mockResolvedValue(publicacionCreada);

    const request = new Request("http://localhost/api/publicaciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "",
        imageUrl: "https://ejemplo.com/foto.jpg",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(postCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          content: "",
          imageUrl: "https://ejemplo.com/foto.jpg",
          authorId: "usuario-123",
        },
      }),
    );
  });

  it("devuelve 500 si falla la base de datos", async () => {
    getServerSessionMock.mockResolvedValue({
      user: {
        id: "usuario-123",
      },
    });

    postCreateMock.mockRejectedValue(new Error("Error interno de prueba"));

    const request = new Request("http://localhost/api/publicaciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "Publicación de prueba" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });
});