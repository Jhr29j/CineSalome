
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from router import api_router


# Configuración compatible con local y producción
LOCAL_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:8080",
    "http://localhost:8080",
]

origins = [
    item.strip().rstrip("/")
    for item in os.getenv(
        "CORS_ORIGINS",
        ",".join(LOCAL_ORIGINS),
    ).split(",")
    if item.strip()
]

app = FastAPI(
    title="Cine Salomé — API",
    description="API de registro, autenticación y gestión de participantes.",
    version="2.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_router, prefix="/api")


@app.on_event("startup")
def validate_auth_configuration():
    secret = os.getenv("AUTH_SECRET", "")

    if len(secret) < 32:
        raise RuntimeError(
            "AUTH_SECRET debe tener al menos 32 caracteres. "
            "Configúrala en el entorno de ejecución."
        )


@app.get("/api/health", tags=["Salud"])
def health():
    return {
        "sistema": "Cine Salomé API",
        "estado": "activo",
        "documentacion": "/api/docs",
        "autenticacion": "/api/auth/login",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )