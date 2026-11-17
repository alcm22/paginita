"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatearTiempo } from "@/features/fechas/formatear-tiempo";

export type UsuarioChat = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  allowMessagesFrom: string;
};

export type MensajeItem = {
  id: string;
  content: string;
  senderId: string;
  read: boolean;
  createdAt: string;
};

export type ConversacionResumen = {
  id: string;
  updatedAt: string;
  otroUsuario: UsuarioChat;
  ultimoMensaje: MensajeItem | null;
  noLeidos: number;
};

export type DestinatarioInicial = UsuarioChat & {
  puedeEscribir: boolean;
  motivoBloqueo: string | null;
};

type UsuarioBusqueda = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
};

type BandejaMensajesProps = {
  usuarioActualId: string;
  conversacionesIniciales: ConversacionResumen[];
  conversacionInicialId: string | null;
  destinatarioInicial: DestinatarioInicial | null;
};

export function BandejaMensajes({
  usuarioActualId,
  conversacionesIniciales,
  conversacionInicialId,
  destinatarioInicial,
}: BandejaMensajesProps) {
  const [conversaciones, setConversaciones] = useState<ConversacionResumen[]>(
    conversacionesIniciales,
  );
  const [conversacionActivaId, setConversacionActivaId] = useState<string | null>(
    conversacionInicialId,
  );
  const [destinatarioNuevo, setDestinatarioNuevo] =
    useState<DestinatarioInicial | null>(destinatarioInicial);

  const [otroUsuarioActivo, setOtroUsuarioActivo] = useState<UsuarioChat | null>(
    () => {
      if (conversacionInicialId) {
        return (
          conversacionesIniciales.find((c) => c.id === conversacionInicialId)
            ?.otroUsuario ?? null
        );
      }
      return destinatarioInicial;
    },
  );
  const [mensajes, setMensajes] = useState<MensajeItem[]>([]);
  const [puedeResponder, setPuedeResponder] = useState<boolean>(
    destinatarioInicial ? destinatarioInicial.puedeEscribir : true,
  );
  const [motivoBloqueo, setMotivoBloqueo] = useState<string | null>(
    destinatarioInicial?.motivoBloqueo ?? null,
  );

  const [cargandoHilo, setCargandoHilo] = useState(false);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState<UsuarioBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);

  async function refrescarListaConversaciones() {
    try {
      const res = await fetch("/api/mensajes", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        conversaciones?: ConversacionResumen[];
      };
      if (data.conversaciones) {
        setConversaciones(data.conversaciones);
      }
    } catch {
      // Ignoramos errores puntuales de refresco
    }
  }

  async function abrirConversacion(convId: string) {
    setCargandoHilo(true);
    setErrorEnvio(null);
    setDestinatarioNuevo(null);
    setConversacionActivaId(convId);

    try {
      const res = await fetch(`/api/mensajes/${convId}`, { cache: "no-store" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setErrorEnvio(data.error ?? "No se pudo cargar la conversación.");
        return;
      }

      const data = (await res.json()) as {
        otroUsuario: UsuarioChat;
        puedeResponder: boolean;
        motivoBloqueo: string | null;
        mensajes: MensajeItem[];
      };

      setOtroUsuarioActivo(data.otroUsuario);
      setPuedeResponder(data.puedeResponder);
      setMotivoBloqueo(data.motivoBloqueo);
      setMensajes(data.mensajes);

      setConversaciones((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, noLeidos: 0 } : c)),
      );
      window.dispatchEvent(new Event("paginita:mensajes-actualizados"));
    } catch {
      setErrorEnvio("Error de conexión al cargar los mensajes.");
    } finally {
      setCargandoHilo(false);
    }
  }

  useEffect(() => {
    if (!conversacionInicialId) return;
    let cancelado = false;

    async function cargarInicial() {
      try {
        const res = await fetch(`/api/mensajes/${conversacionInicialId}`, {
          cache: "no-store",
        });
        if (!res.ok || cancelado) return;
        const data = (await res.json()) as {
          otroUsuario: UsuarioChat;
          puedeResponder: boolean;
          motivoBloqueo: string | null;
          mensajes: MensajeItem[];
        };
        if (cancelado) return;
        setOtroUsuarioActivo(data.otroUsuario);
        setPuedeResponder(data.puedeResponder);
        setMotivoBloqueo(data.motivoBloqueo);
        setMensajes(data.mensajes);
        setConversaciones((prev) =>
          prev.map((c) =>
            c.id === conversacionInicialId ? { ...c, noLeidos: 0 } : c,
          ),
        );
        window.dispatchEvent(new Event("paginita:mensajes-actualizados"));
      } catch {
        // Sin bloqueo
      }
    }

    void cargarInicial();
    return () => {
      cancelado = true;
    };
  }, [conversacionInicialId]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      void refrescarListaConversaciones();
      if (conversacionActivaId) {
        void fetch(`/api/mensajes/${conversacionActivaId}`, { cache: "no-store" })
          .then((res) => (res.ok ? res.json() : null))
          .then(
            (
              data: {
                mensajes?: MensajeItem[];
                puedeResponder?: boolean;
                motivoBloqueo?: string | null;
              } | null,
            ) => {
              if (!data?.mensajes) return;
              setMensajes(data.mensajes);
              if (typeof data.puedeResponder === "boolean") {
                setPuedeResponder(data.puedeResponder);
                setMotivoBloqueo(data.motivoBloqueo ?? null);
              }
              window.dispatchEvent(new Event("paginita:mensajes-actualizados"));
            },
          )
          .catch(() => {});
      }
    }, 10000);

    return () => clearInterval(intervalo);
  }, [conversacionActivaId]);

  useEffect(() => {
    const q = busqueda.trim();
    if (q.length < 2) return;

    let cancelado = false;
    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(
          `/api/usuarios/buscar?q=${encodeURIComponent(q)}`,
          { cache: "no-store" },
        );
        if (!res.ok || cancelado) return;
        const usuarios = (await res.json()) as UsuarioBusqueda[];
        if (!cancelado) {
          setResultadosBusqueda(usuarios);
        }
      } catch {
        // Ignoramos error puntual de búsqueda
      } finally {
        if (!cancelado) {
          setBuscando(false);
        }
      }
    }, 250);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [busqueda]);

  function seleccionarUsuarioDeBusqueda(usuario: UsuarioBusqueda) {
    setBusqueda("");
    setResultadosBusqueda([]);
    setErrorEnvio(null);

    const existente = conversaciones.find(
      (c) => c.otroUsuario.id === usuario.id,
    );
    if (existente) {
      void abrirConversacion(existente.id);
      return;
    }

    const nuevoDestino: DestinatarioInicial = {
      ...usuario,
      allowMessagesFrom: "EVERYONE",
      puedeEscribir: true,
      motivoBloqueo: null,
    };

    setConversacionActivaId(null);
    setMensajes([]);
    setDestinatarioNuevo(nuevoDestino);
    setOtroUsuarioActivo(nuevoDestino);
    setPuedeResponder(true);
    setMotivoBloqueo(null);
  }

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    const contenido = texto.trim();
    const destinatarioId = otroUsuarioActivo?.id ?? destinatarioNuevo?.id;

    if (!contenido || !destinatarioId) return;

    setEnviando(true);
    setErrorEnvio(null);

    try {
      const res = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarioId, contenido }),
      });

      const data = (await res.json()) as {
        error?: string;
        mensaje?: MensajeItem;
        conversacionId?: string;
      };

      if (!res.ok) {
        setErrorEnvio(data.error ?? "No se pudo enviar el mensaje.");
        return;
      }

      setTexto("");
      setDestinatarioNuevo(null);

      if (data.conversacionId) {
        await refrescarListaConversaciones();
        await abrirConversacion(data.conversacionId);
      } else if (data.mensaje) {
        setMensajes((prev) => [...prev, data.mensaje as MensajeItem]);
      }
    } catch {
      setErrorEnvio("Error de conexión al enviar el mensaje.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pg-card grid grid-cols-1 md:grid-cols-3 overflow-hidden min-h-[540px]">
      {/* Columna izquierda: buscador y conversaciones */}
      <aside className="md:col-span-1 border-b md:border-b-0 md:border-r border-[var(--border)] flex flex-col">
        <div className="p-3 border-b border-[var(--border)]">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              const valor = e.target.value;
              setBusqueda(valor);
              if (valor.trim().length < 2) {
                setResultadosBusqueda([]);
              }
            }}
            placeholder="Buscar usuario para escribir..."
            className="pg-input"
          />

          {buscando && (
            <p className="text-xs text-[var(--muted)] mt-2">Buscando...</p>
          )}

          {resultadosBusqueda.length > 0 && (
            <ul className="mt-2 border border-[var(--border)] bg-[var(--surface-raised)] rounded-xl divide-y divide-[var(--border)] max-h-48 overflow-y-auto">
              {resultadosBusqueda.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => seleccionarUsuarioDeBusqueda(u)}
                    className="w-full text-left px-3 py-2 hover:bg-[var(--surface-hover)] flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <span className="font-medium text-[var(--text)] truncate">
                      {u.displayName}
                    </span>
                    <span className="text-xs text-[var(--muted)] truncate">
                      @{u.username}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
          {conversaciones.length === 0 ? (
            <p className="p-4 text-sm text-[var(--muted)] text-center">
              Aún no tienes conversaciones. Busca un usuario arriba para empezar.
            </p>
          ) : (
            conversaciones.map((conv) => {
              const activa = conv.id === conversacionActivaId;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => void abrirConversacion(conv.id)}
                  className={`w-full text-left p-3 flex items-center gap-3 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer ${
                    activa ? "bg-[var(--surface-raised)]" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--border)] bg-[#365543] flex items-center justify-center font-bold text-sm text-[#eaffdb] flex-shrink-0">
                    {conv.otroUsuario.avatarUrl ? (
                      <Image
                        src={conv.otroUsuario.avatarUrl}
                        alt={conv.otroUsuario.displayName}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      conv.otroUsuario.displayName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-[var(--text)] truncate">
                        {conv.otroUsuario.displayName}
                      </span>
                      {conv.noLeidos > 0 && (
                        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[var(--accent)] text-[#102016] text-xs font-bold">
                          {conv.noLeidos}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] truncate m-0 mt-0.5">
                      {conv.ultimoMensaje
                        ? `${conv.ultimoMensaje.senderId === usuarioActualId ? "Tú: " : ""}${conv.ultimoMensaje.content}`
                        : `@${conv.otroUsuario.username}`}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Columna derecha: hilo de mensajes */}
      <section className="md:col-span-2 flex flex-col">
        {!otroUsuarioActivo ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-[var(--muted)] text-sm">
            Selecciona una conversación o busca un usuario para enviar un mensaje privado.
          </div>
        ) : (
          <>
            <header className="p-4 border-b border-[var(--border)] flex items-center justify-between gap-3">
              <div>
                <Link
                  href={`/perfil/${otroUsuarioActivo.username}`}
                  className="font-semibold text-[var(--text)] hover:underline"
                >
                  {otroUsuarioActivo.displayName}
                </Link>
                <p className="text-xs text-[var(--muted)] m-0">
                  @{otroUsuarioActivo.username}
                </p>
              </div>

              {conversacionActivaId && (
                <button
                  type="button"
                  onClick={() => void abrirConversacion(conversacionActivaId)}
                  className="pg-btn-secundario text-xs"
                >
                  Actualizar
                </button>
              )}
            </header>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 max-h-[420px]">
              {cargandoHilo ? (
                <p className="text-sm text-[var(--muted)]">Cargando mensajes...</p>
              ) : mensajes.length === 0 ? (
                <p className="text-sm text-[var(--muted)] text-center my-auto">
                  Todavía no hay mensajes. Escribe el primero abajo.
                </p>
              ) : (
                mensajes.map((msg) => {
                  const esMio = msg.senderId === usuarioActualId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        esMio ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <div
                        className={`px-3.5 py-2 rounded-xl text-sm whitespace-pre-wrap break-words ${
                          esMio
                            ? "bg-[var(--accent)] text-[#102016] font-medium"
                            : "bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)]"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <time className="text-[11px] text-[var(--muted)] mt-1">
                        {formatearTiempo(new Date(msg.createdAt))}
                      </time>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-[var(--border)]">
              {errorEnvio && (
                <p className="text-xs text-red-400 mb-2">{errorEnvio}</p>
              )}

              {puedeResponder ? (
                <form onSubmit={handleEnviar} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={2000}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="pg-input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={enviando || !texto.trim()}
                    className="pg-btn"
                  >
                    {enviando ? "Enviando..." : "Enviar"}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-[var(--muted)] text-center py-2 m-0">
                  {motivoBloqueo ??
                    "Este usuario solo acepta mensajes de sus amistades."}
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}