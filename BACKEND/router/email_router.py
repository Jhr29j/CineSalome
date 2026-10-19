"""Endpoints de verificación por correo: registro y recuperación de contraseña."""
import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from config.supabase_client import supabase
from security.auth import hash_password, create_token, public_student
from Services.email_service import (
    send_registration_code,
    send_password_reset_code,
    verify_code,
)

router = APIRouter(prefix="/email", tags=["Verificación por correo"])

TABLE = "ESTUDIANTE"


# ── Schemas ──────────────────────────────────────────────────────────────────

class SendRegCodeRequest(BaseModel):
    """Solicita envío de código de verificación antes de registrar al estudiante."""
    email: EmailStr
    name: str = Field(min_length=3, max_length=120)


class VerifyRegCodeRequest(BaseModel):
    """Verifica el código y completa el registro del estudiante."""
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)
    # Datos completos del estudiante para crear la cuenta
    NOMBRE_COMPLETO: str = Field(min_length=3, max_length=120)
    NUMERO_DE_LISTA: int = Field(ge=1)
    ID_TECNICA: int = Field(ge=1)
    ID_GRADO: int = Field(ge=1)
    CONTRASEÑA: str = Field(min_length=8, max_length=128)


class SendResetCodeRequest(BaseModel):
    email: EmailStr


class VerifyResetCodeRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=128)


# ── Registro con verificación de correo ──────────────────────────────────────

@router.post("/registro/enviar-codigo", status_code=status.HTTP_200_OK)
def enviar_codigo_registro(data: SendRegCodeRequest):
    """Paso 1: Valida que el correo no exista y envía un código de verificación."""
    email = data.email.lower()
    existing = supabase.table(TABLE).select("ID_ESTUDIANTE").ilike("CORREO", email).limit(1).execute().data
    if existing:
        raise HTTPException(409, "Ese correo ya está registrado. Inicia sesión.")
    try:
        send_registration_code(email, data.name)
    except RuntimeError as exc:
        raise HTTPException(503, str(exc)) from exc
    except Exception as exc:
        raise HTTPException(503, "No se pudo enviar el correo. Verifica la configuración SMTP.") from exc
    return {"mensaje": "Código enviado. Revisa tu bandeja de entrada (y spam)."}


@router.post("/registro/verificar-codigo", status_code=status.HTTP_201_CREATED)
def verificar_codigo_y_registrar(data: VerifyRegCodeRequest):
    """Paso 2: Verifica el código y crea la cuenta si es correcto."""
    if len(os.getenv("AUTH_SECRET", "")) < 32:
        raise HTTPException(500, "AUTH_SECRET debe tener al menos 32 caracteres.")
    email = data.email.lower()

    if not verify_code(email, data.code, "registro"):
        raise HTTPException(400, "Código incorrecto o expirado. Solicita uno nuevo.")

    # Verificar de nuevo que el correo no se registró mientras el usuario esperaba
    existing = supabase.table(TABLE).select("ID_ESTUDIANTE").ilike("CORREO", email).limit(1).execute().data
    if existing:
        raise HTTPException(409, "Ese correo ya está registrado. Inicia sesión.")

    payload = {
        "NOMBRE_COMPLETO": data.NOMBRE_COMPLETO,
        "NUMERO_DE_LISTA": data.NUMERO_DE_LISTA,
        "ID_TECNICA": data.ID_TECNICA,
        "ID_GRADO": data.ID_GRADO,
        "CORREO": email,
        "CONTRASEÑA": hash_password(data.CONTRASEÑA),
    }
    try:
        result = supabase.table(TABLE).insert(payload).execute().data
        if not result:
            raise RuntimeError("La base de datos no devolvió el registro creado.")
        student = public_student(result[0])
        token = create_token({
            "sub": email,
            "role": "student",
            "id": student.get("ID_ESTUDIANTE"),
            "name": student.get("NOMBRE_COMPLETO"),
        })
        return {"access_token": token, "token_type": "bearer", "user": {**student, "role": "student"}}
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(500, "No se pudo registrar. Verifica las tablas y permisos de Supabase.") from exc


# ── Recuperación de contraseña ────────────────────────────────────────────────

@router.post("/password/enviar-codigo", status_code=status.HTTP_200_OK)
def enviar_codigo_reset(data: SendResetCodeRequest):
    """Envía un código de recuperación al correo si existe en la base de datos."""
    email = data.email.lower()
    existing = supabase.table(TABLE).select("ID_ESTUDIANTE").ilike("CORREO", email).limit(1).execute().data
    # Por seguridad, respondemos igual aunque el correo no exista
    if existing:
        try:
            send_password_reset_code(email)
        except RuntimeError as exc:
            raise HTTPException(503, str(exc)) from exc
        except Exception as exc:
            raise HTTPException(503, "No se pudo enviar el correo. Verifica la configuración SMTP.") from exc
    return {"mensaje": "Si ese correo está registrado, recibirás un código en breve."}


@router.post("/password/verificar-codigo", status_code=status.HTTP_200_OK)
def verificar_codigo_reset(data: VerifyResetCodeRequest):
    """Verifica el código de restablecimiento SIN consumirlo (para mostrar el formulario de nueva contraseña)."""
    email = data.email.lower()
    # Verificamos pero sin consumir: usamos una comprobación suave
    from Services.email_service import _code_store
    import time
    key = f"reset:{email}"
    entry = _code_store.get(key)
    if not entry or time.time() > entry["expires_at"] or entry["code"] != data.code.strip():
        raise HTTPException(400, "Código incorrecto o expirado.")
    return {"valid": True, "mensaje": "Código correcto. Ahora establece tu nueva contraseña."}


@router.post("/password/restablecer", status_code=status.HTTP_200_OK)
def restablecer_contrasena(data: ResetPasswordRequest):
    """Consume el código y actualiza la contraseña del estudiante."""
    email = data.email.lower()
    if not verify_code(email, data.code, "reset"):
        raise HTTPException(400, "Código incorrecto o expirado. Solicita uno nuevo.")
    rows = supabase.table(TABLE).select("ID_ESTUDIANTE").ilike("CORREO", email).limit(1).execute().data
    if not rows:
        raise HTTPException(404, "Correo no encontrado.")
    new_hash = hash_password(data.new_password)
    supabase.table(TABLE).update({"CONTRASEÑA": new_hash}).eq("ID_ESTUDIANTE", rows[0]["ID_ESTUDIANTE"]).execute()
    return {"mensaje": "Contraseña actualizada correctamente. Ahora puedes iniciar sesión."}
