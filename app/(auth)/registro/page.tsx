import Link from "next/link";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/features/auth/validation";

export default function RegistroPage() {
  async function register(formData: FormData) {
    "use server";
    const parsed = registerSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new Error("Revisa los datos introducidos.");
    const data = parsed.data;
    const exists = await prisma.user.findFirst({ where: { OR: [{ email: data.email }, { username: data.username }] } });
    if (exists) throw new Error("El correo o nombre de usuario ya está en uso.");
    const { password, ...userData } = data;
    await prisma.user.create({ data: { ...userData, passwordHash: await hash(password, 12) } });
    redirect("/acceso");
  }

  return (
    <main className="auth-page">
      <form className="auth-form" action={register}>
        <p className="eyebrow">Paginita</p>
        <h1>Crea tu cuenta</h1>
        <p className="auth-description">
          Únete para compartir publicaciones, fotos y mensajes privados.
        </p>

        <label>Nombre visible<input name="displayName" required /></label>
        <label>Nombre de usuario<input name="username" required /></label>
        <label>Correo<input name="email" type="email" required /></label>
        <label>Contraseña<input name="password" type="password" minLength={10} required /></label>
        <label>
          ¿Quién puede enviarte mensajes privados?
          <select name="allowMessagesFrom" defaultValue="EVERYONE" required>
            <option value="EVERYONE">Cualquier usuario</option>
            <option value="FRIENDS">Solo mis amistades</option>
          </select>
        </label>
        <button type="submit">Crear cuenta</button>

        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link href="/acceso">Iniciar sesión</Link>
        </p>
      </form>
    </main>
  );
}