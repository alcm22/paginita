import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { consultarFotos, type FiltroFotos } from "@/features/fotos/consultar-fotos";
import { GaleriaFotos, type FotoItem } from "@/components/fotos/galeria-fotos";

type PageProps = {
  searchParams: Promise<{ filtro?: string }>;
};

export default async function FotosPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/acceso");
  }

  const rawFiltro = (await searchParams).filtro;
  const filtro: FiltroFotos =
    rawFiltro === "amigos" || rawFiltro === "mias" ? rawFiltro : "todas";

  const fotosRaw = await consultarFotos(session.user.id, filtro);

  const fotos: FotoItem[] = fotosRaw.map((f) => ({
    ...f,
    createdAt: f.createdAt.toISOString(),
  }));

  const pestanas: Array<{ id: FiltroFotos; etiqueta: string }> = [
    { id: "todas", etiqueta: "Todas" },
    { id: "amigos", etiqueta: "Amigos" },
    { id: "mias", etiqueta: "Mis fotos" },
  ];

  return (
    <section className="max-w-4xl mx-auto">
      <header className="pg-cabecera flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow">Galería</p>
          <h1>Fotos</h1>
          <p>Imágenes compartidas en publicaciones de Paginita.</p>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Filtrar fotos">
          {pestanas.map((p) => (
            <Link
              key={p.id}
              href={`/fotos?filtro=${p.id}`}
              className={filtro === p.id ? "pg-tab-activa" : "pg-tab"}
            >
              {p.etiqueta}
            </Link>
          ))}
        </nav>
      </header>

      <GaleriaFotos fotos={fotos} />
    </section>
  );
}