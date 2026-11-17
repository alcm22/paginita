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
    <section className="max-w-4xl mx-auto py-6 px-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 mb-6">
        <div>
          <p className="eyebrow">Galería</p>
          <h1 className="text-2xl font-bold">Fotos</h1>
          <p className="text-sm text-zinc-500">
            Imágenes compartidas en publicaciones de Paginita.
          </p>
        </div>

        <nav className="flex gap-2" aria-label="Filtrar fotos">
          {pestanas.map((p) => {
            const activa = filtro === p.id;
            return (
              <Link
                key={p.id}
                href={`/fotos?filtro=${p.id}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  activa
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                    : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {p.etiqueta}
              </Link>
            );
          })}
        </nav>
      </header>

      <GaleriaFotos fotos={fotos} />
    </section>
  );
}