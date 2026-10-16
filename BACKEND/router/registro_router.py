from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from config.supabase_client import supabase
from security.auth import admin_user, public_student

router = APIRouter(prefix="/estudiantes", tags=["Estudiantes / Registro"])

@router.get("/", summary="Obtener todos los estudiantes (solo admin)")
def obtener_estudiantes(_admin: dict = Depends(admin_user)) -> List[Dict[str, Any]]:
    try:
        rows = supabase.table("ESTUDIANTE").select("*").order("ID_ESTUDIANTE", desc=True).execute().data or []
        return [public_student(row) for row in rows]
    except Exception as exc:
        raise HTTPException(500, "Error al obtener los estudiantes") from exc

@router.get("/{estudiante_id}", summary="Obtener estudiante por ID (solo admin)")
def obtener_estudiante_por_id(estudiante_id: int, _admin: dict = Depends(admin_user)) -> Dict[str, Any]:
    rows = supabase.table("ESTUDIANTE").select("*").eq("ID_ESTUDIANTE", estudiante_id).limit(1).execute().data
    if not rows:
        raise HTTPException(404, f"No se encontró el estudiante con ID {estudiante_id}")
    return public_student(rows[0])

@router.delete("/{estudiante_id}", summary="Eliminar estudiante (solo admin)")
def eliminar_estudiante(estudiante_id: int, _admin: dict = Depends(admin_user)):
    rows = supabase.table("ESTUDIANTE").delete().eq("ID_ESTUDIANTE", estudiante_id).execute().data
    if not rows:
        raise HTTPException(404, "Estudiante no encontrado")
    return {"mensaje": "Registro eliminado", "datos": public_student(rows[0])}
