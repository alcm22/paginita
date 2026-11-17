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
      allowMessagesFrom: true,
    },
  });

  if (!usuario) {
    redirect("/acceso");
  }

  return (
    <section className="max-w-3xl mx-auto">
      <header className="pg-cabecera">
        <p className="eyebrow">Cuenta y preferencias</p>
        <h1>Configuración del perfil</h1>
        <p>
          Personaliza tu información pública, tu privacidad de mensajes y cómo te ven en Paginita.
        </p>
      </header>

      <div className="pg-card p-6">
        <FormularioEditarPerfil usuario={usuario} />
      </div>
    </section>
  );
}