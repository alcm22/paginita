import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ContadorNoLeidos } from "@/components/mensajes/contador-no-leidos";
import { BotonCerrarSesion } from "@/components/layout/boton-cerrar-sesion";

export type UsuarioSidebar = {
  displayName: string;
  username: string;
  avatarUrl: string | null;
};

const navigation = [
  { href: "/inicio", label: "Inicio", icon: "⌂" },
  { href: "/perfil", label: "Mi perfil", icon: "◉" },
  { href: "/amigos", label: "Amigos", icon: "♧" },
  { href: "/fotos", label: "Fotos", icon: "▧" },
  { href: "/mensajes", label: "Mensajes", icon: "✉" },
  { href: "/notificaciones", label: "Notificaciones", icon: "◌" },
  { href: "/configuracion", label: "Configuración", icon: "⚙" },
];

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
      <Logo />
      <nav className="main-nav">
        {navigation.map((item) => (
          <Link className="nav-link" href={item.href} key={item.href}>
            <span aria-hidden="true" className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.href === "/mensajes" && (
              <ContadorNoLeidos inicial={mensajesNoLeidos} />
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Link
          href="/perfil"
          className="profile-chip hover:opacity-90 transition-opacity"
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