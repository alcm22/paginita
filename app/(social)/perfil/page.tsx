import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export default async function PerfilPage() { const session = await getServerSession(authOptions); const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user!.id } }); return <section className="page-placeholder"><p className="eyebrow">Mi perfil</p><h1>{user.displayName}</h1><p>@{user.username}</p><p>{user.bio || "Todavía no has añadido una descripción."}</p></section>; }
