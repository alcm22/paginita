import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { contarMensajesNoLeidos } from "@/features/mensajes/consultar-mensajes";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Debes iniciar sesión." },
      { status: 401 },
    );
  }

  try {
    const totalNoLeidos = await contarMensajesNoLeidos(session.user.id);
    return NextResponse.json({ totalNoLeidos });
  } catch (error) {
    console.error("Error al contar mensajes no leídos:", error);
    return NextResponse.json(
      { error: "No se ha podido obtener el contador." },
      { status: 500 },
    );
  }
}