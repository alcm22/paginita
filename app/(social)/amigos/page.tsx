import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { consultarDatosAmigos } from "@/features/amigos/consultar-datos-amigos";
import { BuscadorUsuarios } from "@/components/amigos/buscador-usuarios";
import { SolicitudesAmistad } from "@/components/amigos/solicitudes-amistad";
import { ListaAmigos } from "@/components/amigos/lista-amigos";

export default async function AmigosPage() {
  const session = await getServerSession(authOptions);
  const datos = await consultarDatosAmigos(session?.user?.id);

  return (
    <section className="pagina-amigos">
      <header className="amigos-cabecera">
        <p className="eyebrow">Comunidad</p>
        <h1>Amigos</h1>
        <p>Encuentra personas, gestiona tus solicitudes y mantente en contacto.</p>
      </header>

      <div className="amigos-contenido">
        <BuscadorUsuarios />

        <SolicitudesAmistad
          solicitudesRecibidas={datos.solicitudesRecibidas}
          solicitudesEnviadas={datos.solicitudesEnviadas}
        />

        <ListaAmigos amigos={datos.amigos} />
      </div>
    </section>
  );
}