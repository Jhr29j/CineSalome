-- ──────────────────────────────────────────────────────────────────────────────
-- MIGRACIÓN: Agregar columna DEBE_CAMBIAR_CONTRASENA a USUARIOS_ADMIN
-- Ejecuta este SQL en el Editor SQL de Supabase (una sola vez)
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE "USUARIOS_ADMIN"
ADD COLUMN IF NOT EXISTS "DEBE_CAMBIAR_CONTRASENA" BOOLEAN NOT NULL DEFAULT FALSE;

-- Marcar los admins creados antes de esta migración como "no requieren cambio"
-- (ya tienen contraseña propia). Si quieres que todos cambien al primer login,
-- cambia FALSE por TRUE en la línea de abajo:
UPDATE "USUARIOS_ADMIN" SET "DEBE_CAMBIAR_CONTRASENA" = FALSE WHERE "DEBE_CAMBIAR_CONTRASENA" IS NULL;
