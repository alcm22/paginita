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