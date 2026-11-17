import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { authOptions } from "@/lib/auth";
import { contarMensajesNoLeidos } from "@/features/mensajes/consultar-mensajes";

export default async function SocialLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/acceso");

  const mensajesNoLeidos = await contarMensajesNoLeidos(session.user.id);
  return <AppShell mensajesNoLeidos={mensajesNoLeidos}>{children}</AppShell>;
}