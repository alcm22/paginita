import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contarMensajesNoLeidos } from "@/features/mensajes/consultar-mensajes";

export default async function SocialLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/acceso");

  const [mensajesNoLeidos, usuarioActual] = await Promise.all([
    contarMensajesNoLeidos(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        displayName: true,
        username: true,
        avatarUrl: true,
      },
    }),
  ]);

  if (!usuarioActual) redirect("/acceso");

  return (
    <AppShell
      mensajesNoLeidos={mensajesNoLeidos}
      usuarioActual={usuarioActual}
    >
      {children}
    </AppShell>
  );
}