import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/acceso" },
  providers: [CredentialsProvider({
    name: "Correo y contraseña",
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;
      const user = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase() } });
      if (!user || !(await compare(credentials.password, user.passwordHash))) return null;
      return { id: user.id, email: user.email, name: user.displayName };
    },
  })],
};
