import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormularioEditarPerfil } from "@/components/perfil/formulario-editar-perfil";

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/acceso");
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
    },
  });

  if (!usuario) {
    redirect("/acceso");
  }

  return (
    <section className="max-w-2xl mx-auto py-6 px-4">
      <header className="border-b pb-4 mb-6">
        <p className="eyebrow">Cuenta y preferencias</p>
        <h1 className="text-2xl font-bold">Editar perfil</h1>
        <p className="text-sm text-zinc-500">
          Personaliza tu información pública y cómo te ven otras personas en Paginita.
        </p>
      </header>

      <FormularioEditarPerfil usuario={usuario} />
    </section>
  );
}