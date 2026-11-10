import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock, userFindManyMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  userFindManyMock: vi.fn(),
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
      findMany: userFindManyMock,
    },
  },
}));

import { GET } from "../../../app/api/usuarios/buscar/route";

describe("GET /api/usuarios/buscar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si no hay sesión", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/usuarios/buscar?q=ana");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Debes iniciar sesión." });
  });

  it("devuelve lista vacía si la consulta tiene menos de 2 caracteres", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user-1" },
    });

    const request = new Request("http://localhost:3000/api/usuarios/buscar?q=a");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
    expect(userFindManyMock).not.toHaveBeenCalled();
  });

  it("devuelve los usuarios encontrados excluyendo al usuario en sesión", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user-1" },
    });

    const usuariosSimulados = [
      {
        id: "user-2",
        displayName: "Ana García",
        username: "anag",
        avatarUrl: null,
      },
    ];

    userFindManyMock.mockResolvedValue(usuariosSimulados);

    const request = new Request("http://localhost:3000/api/usuarios/buscar?q=ana");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(usuariosSimulados);
    expect(userFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { not: "user-1" },
        }),
      }),
    );
  });

  it("devuelve 500 si falla la base de datos", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "user-1" },
    });
    userFindManyMock.mockRejectedValue(new Error("Error de base de datos"));

    const request = new Request("http://localhost:3000/api/usuarios/buscar?q=ana");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Error interno al buscar usuarios." });
  });
});