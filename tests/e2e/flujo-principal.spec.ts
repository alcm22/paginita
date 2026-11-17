import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { expect, test } from "@playwright/test";

dotenv.config({ path: ".env.local" });

const marcaTiempo = Date.now();
const username = `e2e_${marcaTiempo}`;
const email = `e2e_${marcaTiempo}@paginita.test`;
const password = "ClaveSeguraE2E123!";
const displayName = "Usuario Prueba E2E";

test.afterAll(async () => {
  if (!process.env.DATABASE_URL) return;

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.user.deleteMany({
      where: { email },
    });
  } finally {
    await prisma.$disconnect();
  }
});

test("flujo principal de registro, acceso, muro, secciones y cierre de sesión", async ({
  page,
}) => {
  // 1. Ruta privada protegida sin sesión
  await page.goto("/inicio");
  await expect(page).toHaveURL(/\/acceso/);
  await expect(
    page.getByRole("heading", { name: "Iniciar sesión" }),
  ).toBeVisible();

  // 2. Registro eligiendo privacidad de mensajes
  await page.getByRole("link", { name: "Crear una cuenta" }).click();
  await expect(page).toHaveURL(/\/registro/);

  await page.locator('input[name="displayName"]').fill(displayName);
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('select[name="allowMessagesFrom"]').selectOption("FRIENDS");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL(/\/acceso/, { timeout: 15_000 });

  // 3. Inicio de sesión
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page).toHaveURL(/\/inicio/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Inicio" })).toBeVisible();

  // 4. Crear publicación, dar Me gusta y comentar
  const textoPost = `Publicación E2E ${marcaTiempo}`;
  const textoComentario = `Comentario E2E ${marcaTiempo}`;

  await page.locator("#contenido-publicacion").fill(textoPost);
  await page.getByRole("button", { name: "Publicar" }).click();

  const tarjeta = page
    .locator("article.tarjeta-publicacion")
    .filter({ hasText: textoPost })
    .first();
  await expect(tarjeta).toBeVisible({ timeout: 15_000 });

  await tarjeta.getByRole("button", { name: /Me gusta/ }).click();
  await expect(tarjeta.getByRole("button", { name: /Te gusta/ })).toBeVisible();

  await tarjeta.getByPlaceholder("¿Qué te gustaría comentar?").fill(textoComentario);
  await tarjeta.getByRole("button", { name: "Comentar" }).click();
  await expect(tarjeta.getByText(textoComentario)).toBeVisible({ timeout: 15_000 });

// 5. Recorrido por las demás secciones y edición en /configuracion
  const sidebar = page.locator("aside.sidebar");

  await sidebar.getByRole("link", { name: /Amigos/ }).click();
  await expect(page.getByRole("heading", { name: "Amigos" })).toBeVisible({
    timeout: 15_000,
  });

  await sidebar.getByRole("link", { name: /Fotos/ }).click();
  await expect(page.getByRole("heading", { name: "Fotos" })).toBeVisible({
    timeout: 15_000,
  });

  await sidebar.getByRole("link", { name: /Mensajes/ }).click();
  await expect(page.getByRole("heading", { name: "Mensajes" })).toBeVisible({
    timeout: 15_000,
  });

  await sidebar.getByRole("link", { name: /Notificaciones/ }).click();
  await expect(
    page.getByRole("heading", { name: "Notificaciones" }),
  ).toBeVisible({ timeout: 15_000 });

  await sidebar.getByRole("link", { name: /Configuración/ }).click();
  await expect(
    page.getByRole("heading", { name: "Configuración del perfil" }),
  ).toBeVisible({ timeout: 15_000 });

  await page.locator("#allowMessagesFrom").selectOption("EVERYONE");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Perfil actualizado correctamente.")).toBeVisible({
    timeout: 15_000,
  });

  // 6. Cerrar sesión
  await sidebar.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/acceso/, { timeout: 15_000 });
});