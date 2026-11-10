import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock, userUpdateMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  userUpdateMock: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      update: userUpdateMock,
    },
  },
}));

import { PATCH } from "../../../app/api/usuarios/perfil/route";

describe("PATCH /api/usuarios/perfil", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si no hay una sesión iniciada", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const request = new Request("http://localhost/api/usuarios/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: "Nuevo Nombre" }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(401);
  });

  it("devuelve 400 si el displayName está vacío", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const request = new Request("http://localhost/api/usuarios/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: "   " }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(400);
    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("devuelve 400 si la biografía supera los 280 caracteres", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const request = new Request("http://localhost/api/usuarios/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Manuel",
        bio: "a".repeat(281),
      }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(400);
  });

  it("actualiza el perfil correctamente con datos válidos", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const usuarioActualizado = {
      id: "usuario-123",
      displayName: "Manuel Actualizado",
      username: "manuel",
      avatarUrl: "https://ejemplo.com/avatar.jpg",
      bio: "Nueva biografía",
    };

    userUpdateMock.mockResolvedValue(usuarioActualizado);

    const request = new Request("http://localhost/api/usuarios/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Manuel Actualizado",
        avatarUrl: "https://ejemplo.com/avatar.jpg",
        bio: "Nueva biografía",
      }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(usuarioActualizado);
    expect(userUpdateMock).toHaveBeenCalledWith({
      where: { id: "usuario-123" },
      data: {
        displayName: "Manuel Actualizado",
        avatarUrl: "https://ejemplo.com/avatar.jpg",
        bio: "Nueva biografía",
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        bio: true,
      },
    });
  });

  it("devuelve 500 si falla la base de datos", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    userUpdateMock.mockRejectedValue(new Error("Error interno"));

    const request = new Request("http://localhost/api/usuarios/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: "Manuel" }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(500);
  });
});