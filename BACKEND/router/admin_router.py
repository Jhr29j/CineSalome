from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from config.supabase_client import supabase
from security.auth import admin_user, public_student

router = APIRouter(prefix="/admin", tags=["Administración"])

@router.get("/estudiantes")
def list_students(_admin: dict = Depends(admin_user)):
    try:
        rows = supabase.table("ESTUDIANTE").select("*").order("ID_ESTUDIANTE", desc=True).execute().data or []
        return [public_student(row) for row in rows]
    except Exception as exc:
        raise HTTPException(500, "No se pudieron consultar los estudiantes. Revisa la conexión con Supabase.") from exc

@router.get("/resumen")
def summary(_admin: dict = Depends(admin_user)):
    try:
        rows = supabase.table("ESTUDIANTE").select("ID_ESTUDIANTE").execute().data or []
        return {"total_estudiantes": len(rows)}
    except Exception as exc:
        raise HTTPException(500, "No se pudo obtener el resumen.") from exc

@router.post("/estudiantes/{estudiante_id}/asistencia")
def toggle_attendance(estudiante_id: int, _admin: dict = Depends(admin_user)):
    rows = supabase.table("ESTUDIANTE").select("ID_ESTUDIANTE,ASISTIO").eq("ID_ESTUDIANTE", estudiante_id).limit(1).execute().data
    if not rows:
        raise HTTPException(404, "Estudiante no encontrado")
    new_value = not bool(rows[0].get("ASISTIO", False))
    supabase.table("ESTUDIANTE").update({"ASISTIO": new_value}).eq("ID_ESTUDIANTE", estudiante_id).execute()
    return {"ID_ESTUDIANTE": estudiante_id, "ASISTIO": new_value}


class AdminCreate(BaseModel):
    NOMBRE_COMPLETO: str = Field(min_length=3, max_length=120)
    USUARIO: str = Field(min_length=3, max_length=60, pattern=r"^[A-Za-z0-9_.-]+$")
    CORREO: EmailStr
    CONTRASEÑA: str = Field(min_length=8, max_length=128)

class AdminUpdate(BaseModel):
    NOMBRE_COMPLETO: str = Field(min_length=3, max_length=120)
    USUARIO: str = Field(min_length=3, max_length=60, pattern=r"^[A-Za-z0-9_.-]+$")
    CORREO: EmailStr
    CONTRASEÑA: Optional[str] = Field(default=None, min_length=8, max_length=128)
    ACTIVO: bool = True

class AdminSelfPassword(BaseModel):
    nueva_contrasena: str = Field(min_length=8, max_length=128)

def _public_admin(row: dict) -> dict:
    return {k: v for k, v in row.items() if k not in {"CONTRASEÑA", "PASSWORD", "password"}}

@router.get("/administradores")
def list_admins(_admin: dict = Depends(admin_user)):
    # Intentar con la columna nueva; si falla (columna inexistente), reintentar sin ella
    try:
        rows = supabase.table("USUARIOS_ADMIN").select(
            "ID_ADMIN,NOMBRE_COMPLETO,USUARIO,CORREO,ACTIVO,FECHA_CREACION,DEBE_CAMBIAR_CONTRASENA"
        ).order("ID_ADMIN").execute().data or []
        return rows
    except Exception:
        pass
    try:
        rows = supabase.table("USUARIOS_ADMIN").select(
            "ID_ADMIN,NOMBRE_COMPLETO,USUARIO,CORREO,ACTIVO,FECHA_CREACION"
        ).order("ID_ADMIN").execute().data or []
        return [{**r, "DEBE_CAMBIAR_CONTRASENA": False} for r in rows]
    except Exception as exc:
        raise HTTPException(500, "No se pudieron consultar los administradores. Ejecuta el SQL de configuracion.") from exc


@router.post("/administradores", status_code=201)
def create_admin(data: AdminCreate, _admin: dict = Depends(admin_user)):
    from security.auth import hash_password
    email = str(data.CORREO).lower()
    username = data.USUARIO.strip().lower()
    existing = supabase.table("USUARIOS_ADMIN").select("ID_ADMIN").ilike("CORREO", email).limit(1).execute().data or []
    if existing:
        raise HTTPException(409, "Ya existe un administrador con ese correo.")
    existing_user = supabase.table("USUARIOS_ADMIN").select("ID_ADMIN").ilike("USUARIO", username).limit(1).execute().data or []
    if existing_user:
        raise HTTPException(409, "Ese nombre de usuario ya esta en uso.")
    payload = {
        "NOMBRE_COMPLETO": data.NOMBRE_COMPLETO,
        "USUARIO": username,
        "CORREO": email,
        "CONTRASEÑA": hash_password(data.CONTRASEÑA),
        "ACTIVO": True,
        "DEBE_CAMBIAR_CONTRASENA": True,
    }
    try:
        rows = supabase.table("USUARIOS_ADMIN").insert(payload).execute().data or []
        return _public_admin(rows[0]) if rows else {"mensaje": "Administrador creado"}
    except Exception as exc:
        raise HTTPException(500, "No se pudo crear el administrador.") from exc

@router.put("/administradores/{admin_id}")
def update_admin(admin_id: int, data: AdminUpdate, current: dict = Depends(admin_user)):
    from security.auth import hash_password
    existing = supabase.table("USUARIOS_ADMIN").select("ID_ADMIN,USUARIO,CORREO,ACTIVO").eq("ID_ADMIN", admin_id).limit(1).execute().data or []
    if not existing:
        raise HTTPException(404, "Administrador no encontrado.")
    if current.get("id") == admin_id and not data.ACTIVO:
        raise HTTPException(400, "No puedes desactivar tu propia cuenta mientras la usas.")
    duplicate = supabase.table("USUARIOS_ADMIN").select("ID_ADMIN").ilike("CORREO", str(data.CORREO).lower()).neq("ID_ADMIN", admin_id).limit(1).execute().data or []
    if duplicate:
        raise HTTPException(409, "Ese correo ya pertenece a otro administrador.")
    username = data.USUARIO.strip().lower()
    duplicate_user = supabase.table("USUARIOS_ADMIN").select("ID_ADMIN").ilike("USUARIO", username).neq("ID_ADMIN", admin_id).limit(1).execute().data or []
    if duplicate_user:
        raise HTTPException(409, "Ese nombre de usuario ya pertenece a otro administrador.")
    active_count = len(supabase.table("USUARIOS_ADMIN").select("ID_ADMIN").eq("ACTIVO", True).execute().data or [])
    if existing[0].get("ACTIVO") and not data.ACTIVO and active_count <= 1:
        raise HTTPException(400, "Debe permanecer al menos un administrador activo.")
    payload = {
        "NOMBRE_COMPLETO": data.NOMBRE_COMPLETO,
        "USUARIO": username,
        "CORREO": str(data.CORREO).lower(),
        "ACTIVO": data.ACTIVO,
    }
    if data.CONTRASEÑA:
        payload["CONTRASEÑA"] = hash_password(data.CONTRASEÑA)
        if current.get("id") != admin_id:
            payload["DEBE_CAMBIAR_CONTRASENA"] = True
    try:
        rows = supabase.table("USUARIOS_ADMIN").update(payload).eq("ID_ADMIN", admin_id).execute().data or []
        return _public_admin(rows[0]) if rows else {"mensaje": "Administrador actualizado"}
    except Exception as exc:
        raise HTTPException(500, "No se pudo actualizar el administrador.") from exc

@router.post("/administradores/cambiar-password")
def admin_self_change_password(data: AdminSelfPassword, current: dict = Depends(admin_user)):
    """El admin establece su propia contrasena despues de un reset forzado."""
    from security.auth import hash_password
    admin_id = current.get("id")
    rows = supabase.table("USUARIOS_ADMIN").select("ID_ADMIN").eq("ID_ADMIN", admin_id).limit(1).execute().data or []
    if not rows:
        raise HTTPException(404, "Administrador no encontrado.")
    supabase.table("USUARIOS_ADMIN").update({
        "CONTRASEÑA": hash_password(data.nueva_contrasena),
        "DEBE_CAMBIAR_CONTRASENA": False,
    }).eq("ID_ADMIN", admin_id).execute()
    return {"mensaje": "Contrasena actualizada correctamente."}
