
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  commentFindUniqueMock,
  commentDeleteMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  commentFindUniqueMock: vi.fn(),
  commentDeleteMock: vi.fn(),
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
      delete: commentDeleteMock,
    },
  },
}));

import { DELETE } from "../../../app/api/publicaciones/[id]/comentarios/[comentarioId]/route";

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

function crearPeticion() {
  return new Request(
    `http://localhost/api/publicaciones/${publicacionId}/comentarios/${comentarioId}`,
    { method: "DELETE" },
  );
}

describe("DELETE /api/publicaciones/[id]/comentarios/[comentarioId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { id: usuarioId },
    });
    commentFindUniqueMock.mockResolvedValue({
      id: comentarioId,
      authorId: usuarioId,
      postId: publicacionId,
    });
    commentDeleteMock.mockResolvedValue({
      id: comentarioId,
    });
  });

  it("devuelve 401 si no hay una sesión iniciada", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const respuesta = await DELETE(
      crearPeticion(),
      crearContexto(),
    );

    expect(respuesta.status).toBe(401);
    expect(commentDeleteMock).not.toHaveBeenCalled();
  });

  it("devuelve 404 si el comentario no existe", async () => {
    commentFindUniqueMock.mockResolvedValue(null);

    const respuesta = await DELETE(
      crearPeticion(),
      crearContexto(),
    );

    expect(respuesta.status).toBe(404);
    expect(commentDeleteMock).not.toHaveBeenCalled();
  });

  it("devuelve 403 si el comentario pertenece a otra persona", async () => {
    commentFindUniqueMock.mockResolvedValue({
      id: comentarioId,
      authorId: "otro-usuario",
      postId: publicacionId,
    });

    const respuesta = await DELETE(
      crearPeticion(),
      crearContexto(),
    );

    expect(respuesta.status).toBe(403);
    expect(commentDeleteMock).not.toHaveBeenCalled();
  });

  it("elimina el comentario propio y devuelve confirmación", async () => {
    const respuesta = await DELETE(
      crearPeticion(),
      crearContexto(),
    );

    expect(respuesta.status).toBe(200);
    expect(commentDeleteMock).toHaveBeenCalledWith({
      where: { id: comentarioId },
    });
    await expect(respuesta.json()).resolves.toEqual({
      eliminado: true,
    });
  });
});
