import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import api_router

app = FastAPI(
    title="Cine Salomé — API",
    description="API de registro, autenticación y gestión de participantes.",
    version="2.0.0",
)

origins = [item.strip() for item in os.getenv("CORS_ORIGINS", "http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8080,http://localhost:8080").split(",") if item.strip()]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], allow_headers=["Authorization", "Content-Type"],
)
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
def validate_auth_configuration():
    if len(os.getenv("AUTH_SECRET", "")) < 32:
        raise RuntimeError("AUTH_SECRET debe tener al menos 32 caracteres en BACKEND/.env. Genera uno con secrets.token_urlsafe(48).")

@app.get("/", tags=["Salud"])
def root():
    return {"sistema": "Cine Salomé API", "estado": "activo", "documentacion": "/docs", "autenticacion": "/api/auth/login"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
