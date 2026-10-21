"""Servicio de envío de correos electrónicos vía SMTP para Cine Salomé."""
import os
import smtplib
import random
import string
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Almacenamiento en memoria de códigos (clave: email, valor: {code, expires_at, purpose})
# En producción se podría usar Redis o una tabla en Supabase.
_code_store: dict[str, dict] = {}

CODE_TTL_SECONDS = 600  # 10 minutos


def _generate_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


def _smtp_config() -> dict:
    return {
        "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", ""),
        "password": os.getenv("SMTP_PASSWORD", ""),
        "from_name": os.getenv("SMTP_FROM_NAME", "Cine Salomé"),
    }


def _send_email(to: str, subject: str, html_body: str) -> None:
    cfg = _smtp_config()
    if not cfg["user"] or not cfg["password"]:
        raise RuntimeError(
            "Configura SMTP_USER y SMTP_PASSWORD en las variables de entorno."
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{cfg['from_name']} <{cfg['user']}>"
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP(cfg["host"], cfg["port"], timeout=15) as server:
        server.ehlo()
        server.starttls()
        server.login(cfg["user"], cfg["password"])
        server.sendmail(cfg["user"], [to], msg.as_string())


def _email_template(title: str, code: str, message: str, color: str = "#ef202b") -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#0f0b0c;font-family:'DM Sans',Arial,sans-serif;color:#f0e9ea;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0b0c;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#191214;border:1px solid rgba(229,82,91,.22);border-radius:6px;overflow:hidden;max-width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#291214,#1a0d0f);padding:32px 40px;border-bottom:2px solid {color}20;">
              <p style="margin:0;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:{color};">
                <img src="../img/LogoCineSalomé.png" alt="Cine Salomé" class="brand-logo" style="height:40px;">
              </p>
              <h1 style="margin:10px 0 0;font-size:26px;font-weight:900;letter-spacing:-.03em;color:#fff;">{title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 24px;color:#c5b8ba;font-size:14px;line-height:1.6;">{message}</p>
              <!-- Code box -->
              <div style="background:#100c0d;border:1px solid {color}40;border-radius:4px;padding:20px;text-align:center;margin:0 0 24px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#a99a9d;">Tu código de verificación</p>
                <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:.25em;color:#fff;font-family:monospace;">{code}</p>
              </div>
              <p style="margin:0;font-size:12px;color:#7a6e70;line-height:1.6;">
                Este código expira en <strong style="color:#c5b8ba;">10 minutos</strong>.<br/>
                Si no solicitaste este código, ignora este mensaje.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #ffffff12;">
              <p style="margin:0;font-size:11px;color:#5c5254;">
                Cine Salomé · Actividad educativa · No respondas a este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


# ────────────────────────────────────────────────
# API pública del servicio
# ────────────────────────────────────────────────

def create_verification_code(email: str, purpose: str) -> str:
    """Genera y almacena un código de verificación para el email dado."""
    code = _generate_code()
    _code_store[f"{purpose}:{email.lower()}"] = {
        "code": code,
        "expires_at": time.time() + CODE_TTL_SECONDS,
    }
    return code


def verify_code(email: str, code: str, purpose: str) -> bool:
    """Verifica si el código es válido y no ha expirado. Lo elimina al verificar."""
    key = f"{purpose}:{email.lower()}"
    entry = _code_store.get(key)
    if not entry:
        return False
    if time.time() > entry["expires_at"]:
        _code_store.pop(key, None)
        return False
    if entry["code"] != code.strip():
        return False
    _code_store.pop(key, None)
    return True


def send_registration_code(email: str, name: str) -> None:
    """Envía un código de verificación para completar el registro."""
    code = create_verification_code(email, "registro")
    html = _email_template(
        title="Confirma tu registro",
        code=code,
        message=f"Hola <strong style='color:#fff;'>{name}</strong>, ingresa este código en la página para completar tu registro en Cine Salomé.",
    )
    _send_email(email, "Código de verificación · Cine Salomé", html)


def send_password_reset_code(email: str) -> None:
    """Envía un código para restablecer la contraseña."""
    code = create_verification_code(email, "reset")
    html = _email_template(
        title="Recupera tu contraseña",
        code=code,
        message="Recibimos una solicitud para restablecer la contraseña de tu cuenta en Cine Salomé. Ingresa este código para continuar.",
        color="#f59e0b",
    )
    _send_email(email, "Recuperar contraseña · Cine Salomé", html)
