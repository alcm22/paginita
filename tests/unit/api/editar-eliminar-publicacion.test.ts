import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock, postFindUniqueMock, postUpdateMock, postDeleteMock } =
  vi.hoisted(() => ({
    getServerSessionMock: vi.fn(),
    postFindUniqueMock: vi.fn(),
    postUpdateMock: vi.fn(),
    postDeleteMock: vi.fn(),
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
      update: postUpdateMock,
      delete: postDeleteMock,
    },
  },
}));

import { PATCH, DELETE } from "../../../app/api/publicaciones/[id]/route";

describe("PATCH y DELETE /api/publicaciones/[id]", () => {
  const context = {
    params: Promise.resolve({ id: "publicacion-1" }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PATCH (Editar)", () => {
    it("devuelve 401 si no hay una sesión iniciada", async () => {
      getServerSessionMock.mockResolvedValue(null);

      const request = new Request("http://localhost/api/publicaciones/publicacion-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Texto editado" }),
      });

      const response = await PATCH(request, context);
      expect(response.status).toBe(401);
    });

    it("devuelve 400 si el contenido está vacío", async () => {
      getServerSessionMock.mockResolvedValue({
        user: { id: "usuario-1" },
      });

      const request = new Request("http://localhost/api/publicaciones/publicacion-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "   " }),
      });

      const response = await PATCH(request, context);
      expect(response.status).toBe(400);
    });

    it("devuelve 404 si la publicación no existe", async () => {
      getServerSessionMock.mockResolvedValue({
        user: { id: "usuario-1" },
      });
      postFindUniqueMock.mockResolvedValue(null);

      const request = new Request("http://localhost/api/publicaciones/publicacion-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Texto editado" }),
      });

      const response = await PATCH(request, context);
      expect(response.status).toBe(404);
    });

    it("devuelve 403 si el usuario no es el autor", async () => {
      getServerSessionMock.mockResolvedValue({
        user: { id: "usuario-tramposo" },
      });
      postFindUniqueMock.mockResolvedValue({
        id: "publicacion-1",
        authorId: "usuario-autor",
      });

      const request = new Request("http://localhost/api/publicaciones/publicacion-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Texto editado" }),
      });

      const response = await PATCH(request, context);
      expect(response.status).toBe(403);
      expect(postUpdateMock).not.toHaveBeenCalled();
    });

    it("actualiza la publicación si el usuario es el autor legítimo", async () => {
      getServerSessionMock.mockResolvedValue({
        user: { id: "usuario-autor" },
      });
      postFindUniqueMock.mockResolvedValue({
        id: "publicacion-1",
        authorId: "usuario-autor",
      });
      postUpdateMock.mockResolvedValue({
        id: "publicacion-1",
        content: "Texto editado",
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost/api/publicaciones/publicacion-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Texto editado" }),
      });

      const response = await PATCH(request, context);
      expect(response.status).toBe(200);
      expect(postUpdateMock).toHaveBeenCalledWith({
        where: { id: "publicacion-1" },
        data: { content: "Texto editado" },
        select: {
          id: true,
          content: true,
          updatedAt: true,
        },
      });
    });
  });

  describe("DELETE (Eliminar)", () => {
    it("devuelve 401 si no hay sesión", async () => {
      getServerSessionMock.mockResolvedValue(null);

      const request = new Request("http://localhost/api/publicaciones/publicacion-1", {
        method: "DELETE",
      });

      const response = await DELETE(request, context);
      expect(response.status).toBe(401);
    });

    it("devuelve 403 si el usuario intenta borrar un post ajeno", async () => {
      getServerSessionMock.mockResolvedValue({
        user: { id: "usuario-no-autor" },
      });
      postFindUniqueMock.mockResolvedValue({
        id: "publicacion-1",
        authorId: "usuario-autor",
      });

      const request = new Request("http://localhost/api/publicaciones/publicacion-1", {
        method: "DELETE",
      });

      const response = await DELETE(request, context);
      expect(response.status).toBe(403);
      expect(postDeleteMock).not.toHaveBeenCalled();
    });

    it("elimina la publicación si el usuario es el autor", async () => {
      getServerSessionMock.mockResolvedValue({
        user: { id: "usuario-autor" },
      });
      postFindUniqueMock.mockResolvedValue({
        id: "publicacion-1",
        authorId: "usuario-autor",
      });
      postDeleteMock.mockResolvedValue({ id: "publicacion-1" });

      const request = new Request("http://localhost/api/publicaciones/publicacion-1", {
        method: "DELETE",
      });

      const response = await DELETE(request, context);
      expect(response.status).toBe(200);
      expect(postDeleteMock).toHaveBeenCalledWith({
        where: { id: "publicacion-1" },
      });
    });
  });
});