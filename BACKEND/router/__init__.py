from fastapi import APIRouter
from .auth_router import router as auth_router
from .registro_router import router as registro_router
from .curso_router import router as curso_router
from .admin_router import router as admin_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(registro_router)
api_router.include_router(curso_router)
api_router.include_router(admin_router)

__all__ = ["api_router", "auth_router", "registro_router", "curso_router", "admin_router"]
