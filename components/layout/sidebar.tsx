import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { NavLinks } from "@/components/layout/nav-links";
import { BotonCerrarSesion } from "@/components/layout/boton-cerrar-sesion";

export type UsuarioSidebar = {
  displayName: string;
  username: string;
  avatarUrl: string | null;
};

export function Sidebar({
  mensajesNoLeidos = 0,
  usuarioActual = null,
}: {
  mensajesNoLeidos?: number;
  usuarioActual?: UsuarioSidebar | null;
}) {
  const nombre = usuarioActual?.displayName ?? "Tu perfil";
  const arroba = usuarioActual ? `@${usuarioActual.username}` : "Sesión activa";

  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="sidebar-brand">
        <Logo />
      </div>

      <NavLinks mensajesNoLeidos={mensajesNoLeidos} />

      <div className="sidebar-footer">
        <Link
          href="/perfil"
          className="profile-chip"
          aria-label={`Ir al perfil de ${nombre}`}
        >
          <span className="avatar overflow-hidden" aria-hidden="true">
            {usuarioActual?.avatarUrl ? (
              <Image
                src={usuarioActual.avatarUrl}
                alt={nombre}
                width={36}
                height={36}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              nombre.charAt(0).toUpperCase()
            )}
          </span>
          <span className="min-w-0">
            <strong className="block truncate">{nombre}</strong>
            <small className="block truncate">{arroba}</small>
          </span>
        </Link>
        <BotonCerrarSesion />
      </div>
    </aside>
  );
}