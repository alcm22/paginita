
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  commentFindUniqueMock,
  commentUpdateMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  commentFindUniqueMock: vi.fn(),
  commentUpdateMock: vi.fn(),
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
      update: commentUpdateMock,
    },
  },
}));

import { PATCH } from "../../../app/api/publicaciones/[id]/comentarios/[comentarioId]/route";

const contexto = {
  params: Promise.resolve({
    id: "publicacion-1",
    comentarioId: "comentario-1",
  }),
};

function crearPeticion(contenido: unknown) {
  return new Request(
    "http://localhost/api/publicaciones/publicacion-1/comentarios/comentario-1",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contenido),
    },
  );
}

describe("PATCH /api/publicaciones/[id]/comentarios/[comentarioId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si no hay una sesión iniciada", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const response = await PATCH(crearPeticion({ content: "Texto editado" }), contexto);

    expect(response.status).toBe(401);
    expect(commentFindUniqueMock).not.toHaveBeenCalled();
    expect(commentUpdateMock).not.toHaveBeenCalled();
  });

  it("rechaza un comentario vacío", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-1" },
    });

    const response = await PATCH(crearPeticion({ content: "   " }), contexto);

    expect(response.status).toBe(400);
    expect(commentUpdateMock).not.toHaveBeenCalled();
  });

  it("devuelve 404 si el comentario no existe", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-1" },
    });
    commentFindUniqueMock.mockResolvedValue(null);

    const response = await PATCH(
      crearPeticion({ content: "Texto editado" }),
      contexto,
    );

    expect(response.status).toBe(404);
    expect(commentUpdateMock).not.toHaveBeenCalled();
  });

  it("impide editar el comentario de otra persona", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-2" },
    });
    commentFindUniqueMock.mockResolvedValue({
      id: "comentario-1",
      authorId: "usuario-1",
      postId: "publicacion-1",
    });

    const response = await PATCH(
      crearPeticion({ content: "Intento de modificación" }),
      contexto,
    );

    expect(response.status).toBe(403);
    expect(commentUpdateMock).not.toHaveBeenCalled();
  });

  it("actualiza el comentario de su autor", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-1" },
    });
    commentFindUniqueMock.mockResolvedValue({
      id: "comentario-1",
      authorId: "usuario-1",
      postId: "publicacion-1",
    });
    commentUpdateMock.mockResolvedValue({
      id: "comentario-1",
      content: "Texto editado",
      createdAt: new Date("2026-10-27T10:00:00.000Z"),
      updatedAt: new Date("2026-10-27T10:05:00.000Z"),
    });

    const response = await PATCH(
      crearPeticion({ content: "  Texto editado  " }),
      contexto,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(commentUpdateMock).toHaveBeenCalledWith({
      where: { id: "comentario-1" },
      data: { content: "Texto editado" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(data.comentario.content).toBe("Texto editado");
  });
});
