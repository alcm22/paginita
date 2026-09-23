import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const navigation = [
  { href: "/inicio", label: "Inicio", icon: "⌂" },
  { href: "/perfil", label: "Mi perfil", icon: "◉" },
  { href: "/amigos", label: "Amigos", icon: "♧" },
  { href: "/fotos", label: "Fotos", icon: "▧" },
  { href: "/mensajes", label: "Mensajes", icon: "✉" },
  { href: "/notificaciones", label: "Notificaciones", icon: "◌" },
  { href: "/configuracion", label: "Configuración", icon: "⚙" },
];

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <Logo />
      <nav className="main-nav">
        {navigation.map((item) => (
          <Link className="nav-link" href={item.href} key={item.href}>
            <span aria-hidden="true" className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="profile-chip" aria-label="Perfil de demostración">
          <span className="avatar" aria-hidden="true">P</span>
          <span><strong>Tu perfil</strong><small>Próximamente</small></span>
        </div>
      </div>
    </aside>
  );
}
