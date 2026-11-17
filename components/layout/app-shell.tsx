import { Sidebar, type UsuarioSidebar } from "@/components/layout/sidebar";

export function AppShell({
  children,
  mensajesNoLeidos = 0,
  usuarioActual = null,
}: Readonly<{
  children: React.ReactNode;
  mensajesNoLeidos?: number;
  usuarioActual?: UsuarioSidebar | null;
}>) {
  return (
    <div className="app-shell">
      <Sidebar
        mensajesNoLeidos={mensajesNoLeidos}
        usuarioActual={usuarioActual}
      />
      <main className="app-main">{children}</main>
    </div>
  );
}