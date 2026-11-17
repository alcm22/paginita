# Estado del proyecto: Paginita

## 1. Objetivo

Desarrollar Paginita, una red social propia, sobre el repositorio existente.

## 2. Tecnologías

- Next.js
- React
- TypeScript
- Prisma
- PostgreSQL
- Neon
- NextAuth
- Tailwind CSS
- Vitest
- Playwright
- pnpm

## 3. Repositorio

https://github.com/alcm22/paginita

## 4. Método de trabajo

- ChatGPT ayuda a planificar, analizar y decidir.
- Codex realiza los cambios de código.
- Trabajar en tareas pequeñas, una cada vez.
- Explicar los cambios antes de realizarlos y esperar mi confirmación.
- No modificar archivos innecesariamente.
- Ejecutar las pruebas que correspondan.
- Comprobar el funcionamiento real en el navegador cuando sea necesario.
- No tomar decisiones importantes de arquitectura sin consultarme.
- Priorizar la mecánica antes que el diseño visual.

## 5. Estado conocido del proyecto

El proyecto ya tiene implementadas partes de:

- Registro e inicio de sesión.
- Perfiles de usuario.
- Publicaciones y listado de publicaciones.
- Me gusta.
- Comentarios.
- Edición y eliminación de comentarios.
- Respuestas a comentarios.

Según el historial anterior, las pruebas del backend de respuestas a comentarios pasaron. La interfaz de respuestas todavía debe comprobarse en el navegador.

**Importante:** este estado procede del historial de trabajo. Hay que contrastarlo con el código actual antes de darlo por confirmado.

## 6. Pendientes de comprobar

1. Revisar el estado actual de Git y GitHub.
2. Comprobar la interfaz de respuestas a comentarios.
3. Verificar la seguridad de las credenciales de Neon y confirmar que `.env.local` no está en Git.
4. Revisar qué funcionalidades sociales están implementadas y cuáles faltan.
5. Continuar con las funciones pendientes de Paginita.
6. Revisar el diseño visual.
7. Preparar las pruebas generales y el despliegue.

## 7. Registro de trabajo

Al terminar cada sesión, actualizar este documento con:

- Fecha.
- Tarea realizada.
- Archivos modificados.
- Pruebas ejecutadas y resultados.
- Problemas encontrados.
- Próxima tarea acordada.

No marcar una funcionalidad como terminada sin comprobarla.

## Registro de trabajo - 10/11/2026

- **Tareas realizadas:**
  1. Comprobada y consolidada la funcionalidad de búsqueda de usuarios y gestión de solicitudes de amistad.
  2. Implementado feed filtrado con pestañas "Amigos" (solo posts propios y de amistades) y "Todos" (feed global).
  3. Creado el sistema completo de notificaciones: modelo en BD (Neon), generador automático para likes, comentarios, respuestas y solicitudes, vista `/notificaciones` y acción de marcar como leídas.
  4. Implementadas páginas de perfil propias y ajenas (`/perfil/[username]`) con estadísticas (amigos, posts), estado interactivo de amistad y enlaces directos desde el feed.
  5. Creada la edición y eliminación de publicaciones propias (API PATCH/DELETE con autorización 403, pruebas unitarias y componente interactivo con edición inline).

- **Archivos modificados/creados:**
  - `prisma/schema.prisma`
  - `features/publicaciones/consultar-publicaciones.ts`
  - `app/(social)/inicio/page.tsx`
  - `features/notificaciones/crear-notificacion.ts`
  - `features/notificaciones/consultar-notificaciones.ts`
  - `app/api/notificaciones/marcar-leidas/route.ts`
  - `app/(social)/notificaciones/page.tsx`
  - `components/notificaciones/boton-marcar-leidas.tsx`
  - `app/api/publicaciones/[id]/me-gusta/route.ts`
  - `app/api/publicaciones/[id]/comentarios/route.ts`
  - `app/api/publicaciones/[id]/comentarios/[comentarioId]/respuestas/route.ts`
  - `app/api/amigos/solicitudes/route.ts`
  - `features/perfiles/consultar-perfil.ts`
  - `components/perfil/boton-accion-perfil.tsx`
  - `app/(social)/perfil/[username]/page.tsx`
  - `app/(social)/perfil/page.tsx`
  - `app/api/publicaciones/[id]/route.ts`
  - `tests/unit/api/editar-eliminar-publicacion.test.ts`
  - `components/publicaciones/cuerpo-publicacion.tsx`

- **Pruebas ejecutadas y resultados:**
  - Vitest: 11 suites de tests ejecutadas, 59 pruebas unitarias pasando al 100% en verde.
  - Comprobación manual en navegador: alternancia de feed, recepción y marcado de notificaciones, navegación entre perfiles, edición en vivo de publicaciones y eliminación con confirmación.

- **Problemas encontrados:**
  - En PowerShell, las rutas con paréntesis como `(social)` requirieron entrecomillado.
  - Sincronización de tipos de Prisma requirió `pnpm prisma generate` tras el modelo `Notification`. Ambos resueltos satisfactoriamente.

- **Próximas tareas acordadas:**
  - Implementar la edición de perfil (biografía, nombre visible, avatar) en `/configuracion`.
  - Revisión visual y preparación para despliegue / pruebas E2E (Playwright).

  ## Registro de trabajo - 10/11/2026

- **Tareas realizadas:**
  1. Comprobada y consolidada la búsqueda de usuarios y gestión de amistades (solicitudes y listado).
  2. Implementado feed filtrado de inicio con alternancia entre pestañas "Amigos" y "Todos".
  3. Creado sistema integral de notificaciones (modelo Prisma en Neon, generación en likes, comentarios, respuestas y solicitudes, y vista `/notificaciones` con marcado de leídas).
  4. Creadas páginas dinámicas de perfil (`/perfil/[username]`) con estadísticas (posts, amigos), estado interactivo de relación de amistad y enlaces directos desde los autores del feed.
  5. Creada edición y borrado de publicaciones propias con autorización estricta (403), pruebas unitarias y edición inline en el cliente.
  6. Implementada edición de perfil en `/configuracion` (nombre para mostrar, biografía con contador de 280 caracteres, URL de avatar y vista previa) con API PATCH y pruebas unitarias.

- **Pruebas ejecutadas y resultados:**
  - Vitest: 12 archivos de pruebas, 64 tests unitarios ejecutados y pasando al 100% en verde.
  - Navegador (localhost): comprobado el flujo completo de perfiles, edición de bio/nombre, notificaciones en vivo y borrado de posts.

- **Próximas tareas disponibles:**
  - Ejecutar verificación general (`pnpm check`) que incluye linting, chequeo de tipos TypeScript y build de producción.
  - Implementar módulo de fotos (`/fotos`) o mensajería privada (`/mensajes`).
  - Revisión y pulido del diseño visual con Tailwind.

## Registro de trabajo - 17/11/2026

- **Tareas realizadas:**
  1. Sincronizado historial de migraciones de Prisma en Neon (incluida migración de `Notification`).
  2. Implementada mensajería privada 1 a 1 (`/mensajes`), selector de privacidad (*Cualquier usuario* / *Solo amistades*) en `/registro` y `/configuracion`, botón desde perfiles y contador de mensajes sin leer en la barra lateral.
  3. Implementado soporte de imágenes en publicaciones (`Post.imageUrl`) con vista previa, visualización en feed/perfiles y galería `/fotos` con filtros (*Todas*, *Amigos*, *Mis fotos*) y visor ampliado.

- **Pruebas ejecutadas y resultados:**
  - `pnpm typecheck`, `pnpm lint`, `pnpm test:run` (13 archivos, 79 tests) y `pnpm build`: todos pasando en verde.
  - Comprobación manual en navegador: mensajería, privacidad, contador de no leídos, publicación con foto y galería `/fotos`.

## Registro de trabajo - 17/11/2026 (cierre visual y E2E)

- **Tareas realizadas:**
  1. Añadidos nombre/avatar del usuario conectado y botón de **Cerrar sesión** en la barra lateral.
  2. Unificada la estética verde bosque oscuro en toda la aplicación (`globals.css`, acceso, registro, inicio, perfil, amigos, fotos, mensajes, notificaciones y configuración) y mejorado el diseño móvil.
  3. Configurado `webServer` en `playwright.config.ts` y creada prueba E2E completa en `tests/e2e/flujo-principal.spec.ts` con limpieza automática del usuario de prueba.
  4. Añadido script `postinstall` (`prisma generate`) en `package.json` para despliegue.

- **Pruebas ejecutadas y resultados:**
  - `pnpm typecheck`, `pnpm lint`, `pnpm test:run` (13 archivos, 79 tests), `pnpm build` y `pnpm test:e2e` (Playwright Chromium): todos pasando en verde.

- **Pendientes antes de publicar:**
  - Rotar la contraseña de Neon y actualizar `.env.local`.
  - Configurar variables de entorno (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) en el proveedor de despliegue (p. ej. Vercel).