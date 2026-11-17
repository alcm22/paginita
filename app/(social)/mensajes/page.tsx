import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { consultarConversaciones } from "@/features/mensajes/consultar-mensajes";
import { puedeEnviarMensaje } from "@/features/mensajes/permisos-mensajes";
import {
  BandejaMensajes,
  type ConversacionResumen,
  type DestinatarioInicial,
} from "@/components/mensajes/bandeja-mensajes";

type PageProps = {
  searchParams: Promise<{ con?: string }>;
};

export default async function MensajesPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/acceso");
  }

  const usuarioId = session.user.id;
  const conversacionesRaw = await consultarConversaciones(usuarioId);

  const conversaciones: ConversacionResumen[] = conversacionesRaw.map((c) => ({
    id: c.id,
    updatedAt: c.updatedAt.toISOString(),
    otroUsuario: c.otroUsuario,
    ultimoMensaje: c.ultimoMensaje
      ? {
          ...c.ultimoMensaje,
          createdAt: c.ultimoMensaje.createdAt.toISOString(),
        }
      : null,
    noLeidos: c.noLeidos,
  }));

  let conversacionInicialId: string | null = null;
  let destinatarioInicial: DestinatarioInicial | null = null;

  const conUsername = (await searchParams).con?.trim().toLowerCase();
  if (conUsername) {
    const yaExiste = conversaciones.find(
      (c) => c.otroUsuario.username.toLowerCase() === conUsername,
    );

    if (yaExiste) {
      conversacionInicialId = yaExiste.id;
    } else {
      const destino = await prisma.user.findUnique({
        where: { username: conUsername },
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          allowMessagesFrom: true,
        },
      });

      if (destino && destino.id !== usuarioId) {
        const permiso = await puedeEnviarMensaje(usuarioId, destino.id);
        destinatarioInicial = {
          ...destino,
          puedeEscribir: permiso.permitido,
          motivoBloqueo: permiso.permitido ? null : permiso.error,
        };
      }
    }
  }

  return (
    <section className="max-w-5xl mx-auto">
      <header className="pg-cabecera">
        <p className="eyebrow">Mensajería privada</p>
        <h1>Mensajes</h1>
        <p>Conversaciones privadas 1 a 1 con otros usuarios de Paginita.</p>
      </header>

      <BandejaMensajes
        usuarioActualId={usuarioId}
        conversacionesIniciales={conversaciones}
        conversacionInicialId={conversacionInicialId}
        destinatarioInicial={destinatarioInicial}
      />
    </section>
  );
}