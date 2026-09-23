import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { authOptions } from "@/lib/auth";

export default async function SocialLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await getServerSession(authOptions))) redirect("/acceso");
  return <AppShell>{children}</AppShell>;
}
