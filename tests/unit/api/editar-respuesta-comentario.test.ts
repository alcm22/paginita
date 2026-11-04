import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PATCH } from "@/app/api/publicaciones/[id]/comentarios/[comentarioId]/respuestas/[respuestaId]/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    commentReply: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

describe("PATCH /api/publicaciones/[id]/comentarios/[comentarioId]/respuestas/[respuestaId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const contexto = {
    params: Promise.resolve({
      id: "publicacion-1",
      comentarioId: "comentario-1",
      respuestaId: "respuesta-1",
    }),
  };

  it("devuelve 401 si no hay una sesión iniciada", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ content: "Respuesta editada" }),
    });

    const response = await PATCH(request, contexto);

    expect(response.status).toBe(401);
  });

  it("devuelve 400 si la respuesta está vacía", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usuario-1" },
    } as never);

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ content: "   " }),
    });

    const response = await PATCH(request, contexto);

    expect(response.status).toBe(400);
  });

  it("devuelve 404 si la respuesta no existe", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usuario-1" },
    } as never);

    vi.mocked(prisma.commentReply.findFirst).mockResolvedValue(null);

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ content: "Respuesta editada" }),
    });

    const response = await PATCH(request, contexto);

    expect(response.status).toBe(404);
  });

  it("devuelve 403 si la respuesta pertenece a otro usuario", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usuario-1" },
    } as never);

    vi.mocked(prisma.commentReply.findFirst).mockResolvedValue({
      id: "respuesta-1",
      authorId: "usuario-2",
    } as never);

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ content: "Respuesta editada" }),
    });

    const response = await PATCH(request, contexto);

    expect(response.status).toBe(403);
  });

  it("actualiza la respuesta de su autor", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usuario-1" },
    } as never);

    vi.mocked(prisma.commentReply.findFirst).mockResolvedValue({
      id: "respuesta-1",
      authorId: "usuario-1",
    } as never);

    vi.mocked(prisma.commentReply.update).mockResolvedValue({
      id: "respuesta-1",
      content: "Respuesta editada",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const request = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({ content: "Respuesta editada" }),
    });

    const response = await PATCH(request, contexto);
    const datos = await response.json();

    expect(response.status).toBe(200);
    expect(datos.respuesta.content).toBe("Respuesta editada");
  });
  it("devuelve 401 si no hay una sesión iniciada al eliminar", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await DELETE(
      new Request("http://localhost", { method: "DELETE" }),
      contexto,
    );

    expect(response.status).toBe(401);
  });

  it("devuelve 404 si la respuesta no existe al eliminar", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usuario-1" },
    } as never);

    vi.mocked(prisma.commentReply.findFirst).mockResolvedValue(null);

    const response = await DELETE(
      new Request("http://localhost", { method: "DELETE" }),
      contexto,
    );

    expect(response.status).toBe(404);
  });

  it("devuelve 403 si la respuesta pertenece a otro usuario al eliminar", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usuario-1" },
    } as never);

    vi.mocked(prisma.commentReply.findFirst).mockResolvedValue({
      id: "respuesta-1",
      authorId: "usuario-2",
    } as never);

    const response = await DELETE(
      new Request("http://localhost", { method: "DELETE" }),
      contexto,
    );

    expect(response.status).toBe(403);
  });

  it("elimina la respuesta de su autor", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usuario-1" },
    } as never);

    vi.mocked(prisma.commentReply.findFirst).mockResolvedValue({
      id: "respuesta-1",
      authorId: "usuario-1",
    } as never);

    vi.mocked(prisma.commentReply.delete).mockResolvedValue({
      id: "respuesta-1",
    } as never);

    const response = await DELETE(
      new Request("http://localhost", { method: "DELETE" }),
      contexto,
    );

    const datos = await response.json();

    expect(response.status).toBe(200);
    expect(datos.eliminado).toBe(true);
  });

  it("devuelve 500 si ocurre un error al eliminar", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usuario-1" },
    } as never);

    vi.mocked(prisma.commentReply.findFirst).mockResolvedValue({
      id: "respuesta-1",
      authorId: "usuario-1",
    } as never);

    vi.mocked(prisma.commentReply.delete).mockRejectedValue(
      new Error("Error de base de datos"),
    );

    const response = await DELETE(
      new Request("http://localhost", { method: "DELETE" }),
      contexto,
    );

    expect(response.status).toBe(500);
  });
});