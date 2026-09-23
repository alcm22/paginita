import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/features/auth/validation";

export default function RegistroPage() {
  async function register(formData: FormData) { "use server";
    const parsed = registerSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new Error("Revisa los datos introducidos.");
    const data = parsed.data;
    const exists = await prisma.user.findFirst({ where: { OR: [{ email: data.email }, { username: data.username }] } });
    if (exists) throw new Error("El correo o nombre de usuario ya está en uso.");
    const { password, ...userData } = data;
    await prisma.user.create({ data: { ...userData, passwordHash: await hash(password, 12) } });
    redirect("/acceso");
  }
  return <main className="auth-page"><form action={register}><p className="eyebrow">Paginita</p><h1>Crea tu cuenta</h1><label>Nombre visible<input name="displayName" required /></label><label>Nombre de usuario<input name="username" required /></label><label>Correo<input name="email" type="email" required /></label><label>Contraseña<input name="password" type="password" minLength={10} required /></label><button type="submit">Crear cuenta</button></form></main>;
}
