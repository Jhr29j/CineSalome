# Cine Salomé

Aplicación educativa estática con acceso de estudiantes, panel administrativo, consulta de registros, filtros, exportación CSV y validación de asistencia/boleta. Frontend HTML/CSS/JavaScript; API FastAPI; datos en Supabase.

## 1. Configurar Supabase

1. Abre tu proyecto en Supabase → **SQL Editor**.
2. Revisa `database/supabase_setup.sql`. Si las tablas `TECNICA`, `GRADO` y `ESTUDIANTE` ya existen, no ejecutes la creación a ciegas: verifica que coincidan los nombres y columnas. El script añade `ASISTIO` y los catálogos de ejemplo.
3. Ejecuta el SQL que corresponda a tu esquema. El catálogo de grados y técnicas se puede adaptar a los nombres oficiales del centro.
4. Ejecuta `database/usuarios_admin.sql` para crear `USUARIOS_ADMIN` y luego `database/insert_admin_inicial.sql` para insertar un administrador inicial temporal.
5. En Project Settings → API, copia la URL del proyecto y la **secret/service_role key** para el backend. Nunca la pegues en HTML/JavaScript ni la publiques en Git.

La columna `CONTRASEÑA` guarda hashes PBKDF2 para nuevos registros. Al iniciar sesión, los registros antiguos que tuvieran contraseña en texto plano se convierten automáticamente a hash; por seguridad, conviene forzar el cambio de esas contraseñas antes de publicar la app.

## 2. Configurar y encender el backend

Requisitos: Python 3.10 o superior.

### Windows PowerShell

```powershell
cd CineSalome\BACKEND
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### macOS / Linux

```bash
cd CineSalome/BACKEND
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
nano .env
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Completa `BACKEND/.env` con `SUPABASE_URL`, `SUPABASE_KEY`, `AUTH_SECRET` y `CORS_ORIGINS`. Cambia todos los valores de ejemplo. `AUTH_SECRET` debe tener al menos 32 caracteres aleatorios. Las cuentas administrativas se autentican exclusivamente contra `USUARIOS_ADMIN`, no mediante variables de entorno.

Comprueba la API en `http://127.0.0.1:8000/` y su documentación en `http://127.0.0.1:8000/docs`.

## 3. Encender el frontend

Abre otra terminal desde la carpeta raíz `CineSalome` (no dentro de `BACKEND`).

### Opción A: Python

```bash
python -m http.server 8080
```

Estudiantes: `http://127.0.0.1:8080/login.html`. Administradores: `http://127.0.0.1:8080/admin/`.

### Opción B: VS Code Live Server

Abre la carpeta `CineSalome`, instala/usa Live Server y pulsa **Go Live**. Si usa el puerto 5500, ya está incluido en `CORS_ORIGINS`.

La URL del backend está en `api-config.js` y por defecto es `http://127.0.0.1:8000`. Si cambias el puerto o publicas la API, actualiza ese archivo y `CORS_ORIGINS`.

## 4. Cómo funciona

- Estudiantes: registrarse o iniciar sesión antes de consultar cualquier sección.
- Administración: entra por `/admin/` e inicia sesión con una cuenta de `USUARIOS_ADMIN`. Cuenta inicial temporal: `admin@cinesalome.local` / `CambiarAdmin!2026`. Cámbiala desde el módulo Administradores en cuanto entres. El módulo permite crear y editar administradores, cambiar contraseñas y desactivar cuentas.
- Panel: buscar por nombre, correo, número de lista o ID; filtrar por grado, técnica y asistencia; exportar la lista filtrada a CSV; marcar/desmarcar asistencia para validar la boleta.
- La sesión expira a las 12 horas. El panel y las rutas administrativas exigen un token con rol de administrador. La URL separada no sustituye la autorización del backend.

## Notas antes de publicar

- No publiques `BACKEND/.env` ni la clave secreta de Supabase.
- Configura HTTPS, límites de intentos de login y políticas de seguridad de base de datos para producción.
- Este proyecto usa una API/backend de confianza para leer y modificar datos. No expongas la `service_role` key en el navegador.
- Revisa que la tabla existente use exactamente los nombres de columnas en mayúsculas del proyecto. Los catálogos de ejemplo son editables.

## Imagen histórica

El retrato de portada se carga desde Wikimedia Commons. La ficha de origen indica que la imagen está en dominio público en Estados Unidos; consulta la ficha de la imagen para conocer los detalles de reutilización: https://commons.wikimedia.org/wiki/File:Salom%C3%A9_Ure%C3%B1a_de_Henr%C3%ADquez.jpg. La página muestra el crédito de procedencia debajo del retrato.


## Credenciales de Supabase (.env)

El archivo de entorno va en `BACKEND/.env` (copia `BACKEND/.env.example`). En el dashboard de Supabase, abre tu proyecto y entra en **Connect** o **Project Settings → API Keys**: copia la URL del proyecto en `SUPABASE_URL` y una clave `Secret key`/`service_role` en `SUPABASE_KEY`. Esta clave es solo para el backend y no debe subirse al frontend ni compartirse. Genera `AUTH_SECRET` desde PowerShell con `py -c "import secrets; print(secrets.token_urlsafe(48))"`.

El login administrativo se realiza en `/admin/` usando el campo `USUARIO`, independiente de las credenciales de estudiante. Ejecuta `database/usuarios_admin.sql` y luego `database/insert_admin_inicial.sql`. Cuenta temporal: usuario `admin`, contraseña `CambiarAdmin!2026`; cambia la contraseña desde el panel tras entrar.
