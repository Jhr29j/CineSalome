import os
from fastapi import APIRouter, HTTPException, status, Depends
from Schemas.user import ESTUDIANTE, LoginInput, AdminLoginInput
from config.supabase_client import supabase
from security.auth import hash_password, verify_password, create_token, current_user, public_student

router = APIRouter(prefix="/auth", tags=["Autenticación"])
TABLE = "ESTUDIANTE"

@router.post("/registro", status_code=status.HTTP_201_CREATED)
def register(data: ESTUDIANTE):
    # Validar la configuración antes de insertar: evita guardar al estudiante y fallar luego al crear el token.
    if len(os.getenv("AUTH_SECRET", "")) < 32:
        raise HTTPException(500, "AUTH_SECRET debe tener al menos 32 caracteres en BACKEND/.env")
    email = str(data.CORREO).lower()
    existing = supabase.table(TABLE).select("ID_ESTUDIANTE").ilike("CORREO", email).limit(1).execute().data
    if existing:
        raise HTTPException(409, "Ese correo ya está registrado. Inicia sesión.")
    payload = data.model_dump(exclude={"ID_ESTUDIANTE"})
    payload["CORREO"] = email
    payload["CONTRASEÑA"] = hash_password(data.CONTRASEÑA)
    try:
        result = supabase.table(TABLE).insert(payload).execute().data
        if not result:
            raise RuntimeError("La base de datos no devolvió el registro creado")
        student = public_student(result[0])
        token = create_token({"sub": email, "role": "student", "id": student.get("ID_ESTUDIANTE"), "name": student.get("NOMBRE_COMPLETO")})
        return {"access_token": token, "token_type": "bearer", "user": {**student, "role": "student"}}
    except Exception as exc:
        if isinstance(exc, HTTPException): raise    
        raise HTTPException(500, "No se pudo registrar. Verifica las tablas y permisos de Supabase.") from exc

@router.post("/login", summary="Inic    io de sesión de estudiantes")
def login(data: LoginInput):
    if len(os.getenv("AUTH_SECRET", "")) < 32:
        raise HTTPException(500, "AUTH_SECRET debe tener al menos 32 caracteres en BACKEND/.env")
    email = str(data.CORREO).lower()
    rows = supabase.table(TABLE).select("*").ilike("CORREO", email).limit(1).execute().data
    if not rows or not verify_password(data.CONTRASEÑA, str(rows[0].get("CONTRASEÑA", ""))):
        raise HTTPException(401, "Correo o contraseña incorrectos")
    row = rows[0]
    if not str(row.get("CONTRASEÑA", "")).startswith("pbkdf2_sha256$"):
        supabase.table(TABLE).update({"CONTRASEÑA": hash_password(data.CONTRASEÑA)}).eq("ID_ESTUDIANTE", row["ID_ESTUDIANTE"]).execute()
    student = public_student(row)
    token = create_token({"sub": email, "role": "student", "id": row.get("ID_ESTUDIANTE"), "name": row.get("NOMBRE_COMPLETO")})
    return {"access_token": token, "token_type": "bearer", "user": {**student, "role": "student"}}

@router.post("/admin/login", summary="Inicio de sesión exclusivo de administradores")
def admin_login(data: AdminLoginInput):
    if len(os.getenv("AUTH_SECRET", "")) < 32:
        raise HTTPException(500, "AUTH_SECRET debe tener al menos 32 caracteres en BACKEND/.env")
    usuario = data.USUARIO.strip().lower()
    try:
        rows = supabase.table("USUARIOS_ADMIN").select("*").ilike("USUARIO", usuario).eq("ACTIVO", True).limit(1).execute().data or []
    except Exception as exc:
        raise HTTPException(500, "No se pudo consultar USUARIOS_ADMIN. Ejecuta el SQL de configuración.") from exc
    if not rows or not verify_password(data.CONTRASEÑA, str(rows[0].get("CONTRASEÑA", ""))):
        raise HTTPException(401, "Usuario o contraseña de administrador incorrectos")
    row = rows[0]
    if not str(row.get("CONTRASEÑA", "")).startswith("pbkdf2_sha256$"):
        supabase.table("USUARIOS_ADMIN").update({"CONTRASEÑA": hash_password(data.CONTRASEÑA)}).eq("ID_ADMIN", row["ID_ADMIN"]).execute()
    token = create_token({"sub": usuario, "role": "admin", "id": row.get("ID_ADMIN"), "name": row.get("NOMBRE_COMPLETO")})
    debe_cambiar = bool(row.get("DEBE_CAMBIAR_CONTRASENA", False))
    return {"access_token": token, "token_type": "bearer", "user": {"ID_ADMIN": row.get("ID_ADMIN"), "USUARIO": usuario, "CORREO": row.get("CORREO"), "NOMBRE_COMPLETO": row.get("NOMBRE_COMPLETO"), "role": "admin", "DEBE_CAMBIAR_CONTRASENA": debe_cambiar}}

@router.get("/me")
def me(user: dict = Depends(current_user)):
    return {"user": user}
