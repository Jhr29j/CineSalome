INE SALOME — INSTRUCCIONES PARA PREPARAR Y EJECUTAR EL PROYECTO
================================================================

REQUISITOS
----------
- Python instalado.
- Git instalado.
- Acceso al repositorio del proyecto.
- Credenciales propias de Supabase para configurar el backend.

1. ABRIR EL PROYECTO
--------------------
Abre una terminal en la carpeta raíz del proyecto, donde están login.html,
index.html y la carpeta BACKEND.

2. CREAR EL ENTORNO VIRTUAL (SOLO LA PRIMERA VEZ)
-------------------------------------------------
En Windows PowerShell:

    cd BACKEND
    py -m venv .venv

3. ACTIVAR EL ENTORNO VIRTUAL
-----------------------------
En Windows PowerShell, desde BACKEND:

    .\.venv\Scripts\Activate.ps1

Si PowerShell bloquea la activación, solo para esa terminal ejecuta:

    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Y vuelve a ejecutar:

    .\.venv\Scripts\Activate.ps1

4. INSTALAR DEPENDENCIAS
------------------------
Con el entorno virtual activado:

    python -m pip install --upgrade pip
    pip install -r requirements.txt

Si requirements.txt cambia en una actualización, vuelve a ejecutar:

    pip install -r requirements.txt

5. CONFIGURAR EL ARCHIVO .ENV
-----------------------------
En BACKEND, crea el archivo .env a partir de .env.example:

    Copy-Item .env.example .env

Edita BACKEND/.env y completa los valores reales, por ejemplo:
- SUPABASE_URL
- SUPABASE_KEY
- AUTH_SECRET
- CORS_ORIGINS

No subas BACKEND/.env al repositorio ni compartas sus claves.
Si ya existe un .env, no lo sobrescribas: edítalo manualmente.

Para generar un AUTH_SECRET nuevo, ejecuta:

    py -c "import secrets; print(secrets.token_urlsafe(48))"

Copia el resultado en AUTH_SECRET dentro de BACKEND/.env.

6. INICIAR EL BACKEND
---------------------
Desde BACKEND, con el entorno virtual activado:

    uvicorn main:app --host 127.0.0.1 --port 8000

Deja esa terminal abierta.
Documentación de la API:
    http://127.0.0.1:8000/docs

7. INICIAR EL FRONTEND
----------------------
Abre una SEGUNDA terminal en la carpeta raíz del proyecto (no dentro de BACKEND)
y ejecuta:

    py -m http.server 8080 --bind 127.0.0.1

Deja esa terminal abierta.
Página de estudiantes:
    http://127.0.0.1:8080/login.html

Acceso administrativo:
    http://127.0.0.1:8080/admin/

8. DETENER LOS SERVIDORES
-------------------------
En cada terminal, pulsa Ctrl+C.

9. ARCHIVOS QUE NO SE DEBEN SUBIR A GIT
---------------------------------------
- BACKEND/.env
- BACKEND/.venv/
- cualquier otra carpeta .venv/
- __pycache__/
- archivos .pyc
- archivos temporales del editor

El archivo requirements.txt SÍ debe subirse: contiene la lista de dependencias
para que cada persona pueda instalar las mismas librerías.