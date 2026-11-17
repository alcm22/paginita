import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({
  children,
  mensajesNoLeidos = 0,
}: Readonly<{ children: React.ReactNode; mensajesNoLeidos?: number }>) {
  return (
    <div className="app-shell">
      <Sidebar mensajesNoLeidos={mensajesNoLeidos} />
      <main className="app-main">{children}</main>
    </div>
  );
}