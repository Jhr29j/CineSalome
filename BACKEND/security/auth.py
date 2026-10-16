"""Autenticación sencilla para Cine Salomé. Cambiar AUTH_SECRET en producción."""
import base64, hashlib, hmac, json, os, secrets, time
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from config.supabase_client import supabase

bearer = HTTPBearer(auto_error=False)

def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 240000).hex()
    return f"pbkdf2_sha256${salt}${digest}"

def verify_password(password: str, stored: str) -> bool:
    if not stored:
        return False
    if stored.startswith("pbkdf2_sha256$"):
        try:
            _, salt, expected = stored.split("$", 2)
            actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 240000).hex()
            return hmac.compare_digest(actual, expected)
        except ValueError:
            return False
    # Compatibilidad temporal con registros antiguos en texto plano; se actualizan al iniciar sesión.
    return hmac.compare_digest(password, stored)

def create_token(payload: dict) -> str:
    secret = os.getenv("AUTH_SECRET", "")
    if len(secret) < 32:
        raise RuntimeError("Configura AUTH_SECRET con al menos 32 caracteres en BACKEND/.env")
    header = _b64(json.dumps({"alg":"HS256","typ":"JWT"}, separators=(",", ":")).encode())
    body_data = {**payload, "exp": int(time.time()) + 60 * 60 * 12}
    body = _b64(json.dumps(body_data, separators=(",", ":")).encode())
    signature = _b64(hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest())
    return f"{header}.{body}.{signature}"

def decode_token(token: str) -> dict:
    secret = os.getenv("AUTH_SECRET", "")
    try:
        header, body, signature = token.split(".")
        expected = _b64(hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Firma inválida")
        payload = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token vencido")
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Sesión inválida o vencida. Inicia sesión otra vez.")

def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Inicia sesión para continuar")
    return decode_token(credentials.credentials)

def admin_user(user: dict = Depends(current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos de administración")
    return user

def public_student(row: dict) -> dict:
    return {k: v for k, v in row.items() if k not in {"CONTRASEÑA", "PASSWORD", "password"}}
