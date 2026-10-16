from typing import List, Optional, Dict, Any
from repositorios.curso_repository import CursoRepository


class CursoService:
    def __init__(self, repository: CursoRepository = CursoRepository):
        self.repository = repository

    def listar_tecnicas(self) -> List[Dict[str, Any]]:
        """
        Retorna el catálogo de todas las áreas técnicas.
        """
        return self.repository.obtener_todas_tecnicas() or []

    def obtener_tecnica(self, tecnica_id: int) -> Optional[Dict[str, Any]]:
        """
        Busca un área técnica por su identificador.
        """
        tecnica = self.repository.obtener_tecnica_por_id(tecnica_id)
        if not tecnica:
            raise ValueError(f"No se encontró el área técnica con el ID {tecnica_id}.")
        return tecnica

    def listar_grados(self) -> List[Dict[str, Any]]:
        """
        Retorna el catálogo de grados académicos.
        """
        return self.repository.obtener_todos_grados() or []

    def obtener_grado(self, grado_id: int) -> Optional[Dict[str, Any]]:
        """
        Busca un grado académico por su identificador.
        """
        grado = self.repository.obtener_grado_por_id(grado_id)
        if not grado:
            raise ValueError(f"No se encontró el grado con el ID {grado_id}.")
        return grado
