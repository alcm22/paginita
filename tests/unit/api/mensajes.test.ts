import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  userFindUniqueMock,
  friendshipFindFirstMock,
  conversationUpsertMock,
  conversationFindUniqueMock,
  conversationFindManyMock,
  messageCreateMock,
  messageUpdateManyMock,
  messageCountMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  friendshipFindFirstMock: vi.fn(),
  conversationUpsertMock: vi.fn(),
  conversationFindUniqueMock: vi.fn(),
  conversationFindManyMock: vi.fn(),
  messageCreateMock: vi.fn(),
  messageUpdateManyMock: vi.fn(),
  messageCountMock: vi.fn(),
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
      findFirst: friendshipFindFirstMock,
    },
    conversation: {
      upsert: conversationUpsertMock,
      findUnique: conversationFindUniqueMock,
      findMany: conversationFindManyMock,
    },
    message: {
      create: messageCreateMock,
      updateMany: messageUpdateManyMock,
      count: messageCountMock,
    },
  },
}));

import { POST } from "../../../app/api/mensajes/route";
import { GET as GET_CONVERSACION } from "../../../app/api/mensajes/[conversacionId]/route";
import { GET as GET_NO_LEIDOS } from "../../../app/api/mensajes/no-leidos/route";

describe("API de mensajería privada", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/mensajes", () => {
    it("devuelve 401 si no hay sesión iniciada", async () => {
      getServerSessionMock.mockResolvedValue(null);

      const request = new Request("http://localhost/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarioId: "user-2", contenido: "Hola" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("devuelve 400 si el mensaje está vacío", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });

      const request = new Request("http://localhost/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarioId: "user-2", contenido: "   " }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("devuelve 400 si intenta enviarse un mensaje a sí mismo", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });

      const request = new Request("http://localhost/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarioId: "user-1", contenido: "Hola" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("devuelve 404 si el destinatario no existe", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
      userFindUniqueMock.mockResolvedValue(null);

      const request = new Request("http://localhost/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarioId: "user-99", contenido: "Hola" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(404);
    });

    it("devuelve 403 si el destinatario solo acepta amistades y no son amigos", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
      userFindUniqueMock.mockResolvedValue({
        id: "user-2",
        allowMessagesFrom: "FRIENDS",
      });
      friendshipFindFirstMock.mockResolvedValue(null);

      const request = new Request("http://localhost/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarioId: "user-2", contenido: "Hola" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
      expect(messageCreateMock).not.toHaveBeenCalled();
    });

    it("crea el mensaje (201) si solo acepta amistades pero sí son amigos", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "user-z" } });
      userFindUniqueMock.mockResolvedValue({
        id: "user-a",
        allowMessagesFrom: "FRIENDS",
      });
      friendshipFindFirstMock.mockResolvedValue({ id: "friend-1" });
      conversationUpsertMock.mockResolvedValue({ id: "conv-1" });
      messageCreateMock.mockResolvedValue({
        id: "msg-1",
        content: "Hola amigo",
        senderId: "user-z",
        read: false,
        createdAt: new Date("2026-11-16T10:00:00Z"),
        conversationId: "conv-1",
      });

      const request = new Request("http://localhost/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarioId: "user-a", contenido: "Hola amigo" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
      expect(conversationUpsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userAId_userBId: { userAId: "user-a", userBId: "user-z" },
          },
        }),
      );
      expect(messageCreateMock).toHaveBeenCalledTimes(1);
    });

    it("crea el mensaje (201) si el destinatario acepta de cualquier usuario", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
      userFindUniqueMock.mockResolvedValue({
        id: "user-2",
        allowMessagesFrom: "EVERYONE",
      });
      conversationUpsertMock.mockResolvedValue({ id: "conv-2" });
      messageCreateMock.mockResolvedValue({
        id: "msg-2",
        content: "Hola",
        senderId: "user-1",
        read: false,
        createdAt: new Date("2026-11-16T10:05:00Z"),
        conversationId: "conv-2",
      });

      const request = new Request("http://localhost/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarioId: "user-2", contenido: "Hola" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
      expect(friendshipFindFirstMock).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/mensajes/[conversacionId]", () => {
    it("devuelve 403 si el usuario no pertenece a la conversación", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "user-3" } });
      conversationFindUniqueMock.mockResolvedValue({
        id: "conv-1",
        userAId: "user-1",
        userBId: "user-2",
        userA: { id: "user-1", displayName: "A", username: "a", avatarUrl: null, allowMessagesFrom: "EVERYONE" },
        userB: { id: "user-2", displayName: "B", username: "b", avatarUrl: null, allowMessagesFrom: "EVERYONE" },
        messages: [],
      });

      const response = await GET_CONVERSACION(
        new Request("http://localhost/api/mensajes/conv-1"),
        { params: Promise.resolve({ conversacionId: "conv-1" }) },
      );
      expect(response.status).toBe(403);
    });

    it("devuelve mensajes y marca los recibidos como leídos", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
      conversationFindUniqueMock.mockResolvedValue({
        id: "conv-1",
        userAId: "user-1",
        userBId: "user-2",
        userA: { id: "user-1", displayName: "A", username: "a", avatarUrl: null, allowMessagesFrom: "EVERYONE" },
        userB: { id: "user-2", displayName: "B", username: "b", avatarUrl: null, allowMessagesFrom: "EVERYONE" },
        messages: [
          {
            id: "msg-1",
            content: "Qué tal",
            senderId: "user-2",
            read: false,
            createdAt: new Date("2026-11-16T10:00:00Z"),
          },
        ],
      });
      userFindUniqueMock.mockResolvedValue({
        id: "user-2",
        allowMessagesFrom: "EVERYONE",
      });
      messageUpdateManyMock.mockResolvedValue({ count: 1 });

      const response = await GET_CONVERSACION(
        new Request("http://localhost/api/mensajes/conv-1"),
        { params: Promise.resolve({ conversacionId: "conv-1" }) },
      );

      expect(response.status).toBe(200);
      expect(messageUpdateManyMock).toHaveBeenCalledWith({
        where: {
          conversationId: "conv-1",
          senderId: { not: "user-1" },
          read: false,
        },
        data: { read: true },
      });
      const data = await response.json();
      expect(data.mensajes).toHaveLength(1);
      expect(data.puedeResponder).toBe(true);
    });
  });

  describe("GET /api/mensajes/no-leidos", () => {
    it("devuelve 401 si no hay sesión", async () => {
      getServerSessionMock.mockResolvedValue(null);
      const response = await GET_NO_LEIDOS();
      expect(response.status).toBe(401);
    });

    it("devuelve el total de mensajes sin leer", async () => {
      getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
      messageCountMock.mockResolvedValue(4);

      const response = await GET_NO_LEIDOS();
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ totalNoLeidos: 4 });
    });
  });
});