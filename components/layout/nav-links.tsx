"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContadorNoLeidos } from "@/components/mensajes/contador-no-leidos";

const navigation = [
  { href: "/inicio", label: "Inicio", icon: "⌂" },
  { href: "/perfil", label: "Mi perfil", icon: "◉" },
  { href: "/amigos", label: "Amigos", icon: "♧" },
  { href: "/fotos", label: "Fotos", icon: "▧" },
  { href: "/mensajes", label: "Mensajes", icon: "✉" },
  { href: "/notificaciones", label: "Notificaciones", icon: "◌" },
  { href: "/configuracion", label: "Configuración", icon: "⚙" },
];

export function NavLinks({ mensajesNoLeidos }: { mensajesNoLeidos: number }) {
  const pathname = usePathname();

  return (
    <nav className="main-nav">
      {navigation.map((item) => {
        const activa =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${activa ? "nav-link-activa" : ""}`}
          >
            <span aria-hidden="true" className="nav-icon">
              {item.icon}
            </span>
            <span>{item.label}</span>
            {item.href === "/mensajes" && (
              <ContadorNoLeidos inicial={mensajesNoLeidos} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}