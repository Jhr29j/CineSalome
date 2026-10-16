from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from Services.curso_service import CursoService

router = APIRouter(prefix="/cursos", tags=["Cursos y Técnicas"])

def get_curso_service() -> CursoService:
    return CursoService()


@router.get("/tecnicas", summary="Listar todas las técnicas")
def listar_tecnicas(
    service: CursoService = Depends(get_curso_service)
) -> List[Dict[str, Any]]:
    """
    Retorna la lista de todas las modalidades técnicas disponibles.
    """
    try:
        return service.listar_tecnicas()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener técnicas: {str(e)}"
        )


@router.get("/tecnicas/{tecnica_id}", summary="Obtener técnica por ID")
def obtener_tecnica(
    tecnica_id: int,
    service: CursoService = Depends(get_curso_service)
) -> Dict[str, Any]:
    """
    Retorna una técnica específica por su ID.
    """
    try:
        return service.obtener_tecnica(tecnica_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar la técnica: {str(e)}"
        )


@router.get("/grados", summary="Listar todos los grados académicos")
def listar_grados(
    service: CursoService = Depends(get_curso_service)
) -> List[Dict[str, Any]]:
    """
    Retorna la lista de grados académicos registrados.
    """
    try:
        return service.listar_grados()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener grados: {str(e)}"
        )


@router.get("/grados/{grado_id}", summary="Obtener grado por ID")
def obtener_grado(
    grado_id: int,
    service: CursoService = Depends(get_curso_service)
) -> Dict[str, Any]:
    """
    Retorna un grado académico por su ID.
    """
    try:
        return service.obtener_grado(grado_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al consultar el grado: {str(e)}"
        )
