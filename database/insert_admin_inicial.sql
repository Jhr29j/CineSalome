-- Ejecuta DESPUÉS de usuarios_admin.sql. Cuenta inicial temporal: cambia la contraseña después de entrar.
-- Usuario: admin
-- Contraseña temporal: CambiarAdmin!2026
insert into public."USUARIOS_ADMIN" ("NOMBRE_COMPLETO", "USUARIO", "CORREO", "CONTRASEÑA", "ACTIVO")
values ('Administrador principal', 'admin', 'admin@cinesalome.local', 'pbkdf2_sha256$cinesalome-inicial-admin-2026$b512d7a6e8da924be7fdcf99f7a1f97f5eef697c97dc1c56b0a7d8e4fdc5bcc1', true)
on conflict ("USUARIO") do nothing;
