import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/acceso");
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  if (!usuario) {
    redirect("/acceso");
  }

  redirect(`/perfil/${usuario.username}`);
}