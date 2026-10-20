import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  findManyMock,
  userFindUniqueMock,
  friendshipFindUniqueMock,
  requestFindUniqueMock,
  requestCreateMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  findManyMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  friendshipFindUniqueMock: vi.fn(),
  requestFindUniqueMock: vi.fn(),
  requestCreateMock: vi.fn(),
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
      findUnique: userFindUniqueMock,
    },
    friendship: {
      findUnique: friendshipFindUniqueMock,
    },
    friendRequest: {
      findMany: findManyMock,
      findUnique: requestFindUniqueMock,
      create: requestCreateMock,
    },
  },
}));

import { GET, POST } from "../../../app/api/amigos/solicitudes/route";

describe("GET /api/amigos/solicitudes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devuelve 401 si no hay una sesion iniciada", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Debes iniciar sesión.",
    });
    expect(findManyMock).not.toHaveBeenCalled();
  });
  it("devuelve las solicitudes recibidas por el usuario autenticado", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const solicitudes = [
      {
        id: "solicitud-1",
        sender: {
          id: "usuario-456",
          displayName: "Ana",
          username: "ana",
          avatarUrl: null,
        },
      },
    ];

    findManyMock.mockResolvedValue(solicitudes);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(solicitudes);
    expect(findManyMock).toHaveBeenCalledWith({
      where: { receiverId: "usuario-123" },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
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
  it("devuelve 400 si el usuario intenta enviarse una solicitud a si mismo", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const request = new Request("http://localhost/api/amigos/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: "usuario-123" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "No puedes enviarte una solicitud a ti mismo.",
    });
  });
  it("devuelve 409 si ya existe una solicitud pendiente", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    userFindUniqueMock.mockResolvedValue({
      id: "usuario-456",
    });

    friendshipFindUniqueMock.mockResolvedValue(null);

    requestFindUniqueMock
      .mockResolvedValueOnce({
        id: "solicitud-existente",
        senderId: "usuario-123",
        receiverId: "usuario-456",
      })
      .mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/amigos/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: "usuario-456" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "Ya existe una solicitud pendiente.",
    });
    expect(requestCreateMock).not.toHaveBeenCalled();
  });
  it("devuelve 404 si el destinatario no existe", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    userFindUniqueMock.mockResolvedValue(null);

    const request = new Request("http://localhost/api/amigos/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: "usuario-inexistente" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      error: "El usuario no existe.",
    });

    expect(friendshipFindUniqueMock).not.toHaveBeenCalled();
    expect(requestCreateMock).not.toHaveBeenCalled();
  });
  it("devuelve 409 si la otra persona ya envio una solicitud", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    userFindUniqueMock.mockResolvedValue({
      id: "usuario-456",
    });

    friendshipFindUniqueMock.mockResolvedValue(null);

    requestFindUniqueMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "solicitud-entrante",
        senderId: "usuario-456",
        receiverId: "usuario-123",
      });

    const request = new Request("http://localhost/api/amigos/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: "usuario-456" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "Esta persona ya te ha enviado una solicitud de amistad.",
    });

    expect(requestCreateMock).not.toHaveBeenCalled();
  });
  it("devuelve 400 si el destinatario no es válido", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    const request = new Request("http://localhost/api/amigos/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: "" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "El destinatario no es válido.",
    });

    expect(userFindUniqueMock).not.toHaveBeenCalled();
    expect(requestCreateMock).not.toHaveBeenCalled();
  });
  it("crea una solicitud cuando los datos son válidos", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "usuario-123" },
    });

    userFindUniqueMock.mockResolvedValue({
      id: "usuario-456",
    });

    friendshipFindUniqueMock.mockResolvedValue(null);

    requestFindUniqueMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    requestCreateMock.mockResolvedValue({
      id: "solicitud-nueva",
    });

    const request = new Request("http://localhost/api/amigos/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: "usuario-456" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "solicitud-nueva",
      message: "Solicitud de amistad enviada.",
    });

    expect(requestCreateMock).toHaveBeenCalledWith({
      data: {
        senderId: "usuario-123",
        receiverId: "usuario-456",
      },
    });
  });
  it("devuelve 401 si se intenta enviar una solicitud sin iniciar sesion", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const request = new Request("http://localhost/api/amigos/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: "usuario-456" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Debes iniciar sesión.",
    });

    expect(userFindUniqueMock).not.toHaveBeenCalled();
    expect(requestCreateMock).not.toHaveBeenCalled();
  });
});