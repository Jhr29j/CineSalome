from typing import List, Optional, Dict, Any
from Schemas.user import ESTUDIANTE
from repositorios.registro_repository import RegistroRepository


class RegistroService:
    def __init__(self, repository: RegistroRepository = RegistroRepository):
        self.repository = repository

    def registrar_estudiante(self, estudiante: ESTUDIANTE) -> Dict[str, Any]:
        """
        Valida que el correo no esté registrado y procede a crear el estudiante.
        """
        if not estudiante.CORREO or "@" not in estudiante.CORREO:
            raise ValueError("El correo electrónico proporcionado no es válido.")

        estudiante_existente = self.repository.obtener_por_correo(estudiante.CORREO)
        if estudiante_existente:
            raise ValueError(f"Ya existe un estudiante registrado con el correo: {estudiante.CORREO}")

        creado = self.repository.crear(estudiante)
        if not creado:
            raise RuntimeError("No se pudo completar el registro del estudiante.")
        return creado[0] if isinstance(creado, list) and len(creado) > 0 else creado

    def listar_estudiantes(self) -> List[Dict[str, Any]]:
        """
        Obtiene la lista completa de estudiantes.
        """
        return self.repository.obtener_todos() or []

    def obtener_estudiante_por_id(self, estudiante_id: int) -> Optional[Dict[str, Any]]:
        """
        Busca un estudiante por su ID único.
        """
        return self.repository.obtener_por_id(estudiante_id)

    def actualizar_estudiante(self, estudiante_id: int, estudiante: ESTUDIANTE) -> Dict[str, Any]:
        """
        Valida la existencia del estudiante y actualiza sus datos.
        """
        estudiante_existente = self.repository.obtener_por_id(estudiante_id)
        if not estudiante_existente:
            raise ValueError(f"No se encontró ningún estudiante con el ID {estudiante_id}.")

        actualizado = self.repository.actualizar(estudiante_id, estudiante)
        return actualizado[0] if isinstance(actualizado, list) and len(actualizado) > 0 else actualizado

    def eliminar_estudiante(self, estudiante_id: int) -> Dict[str, Any]:
        """
        Verifica y elimina al estudiante por su ID.
        """
        estudiante_existente = self.repository.obtener_por_id(estudiante_id)
        if not estudiante_existente:
            raise ValueError(f"No se encontró ningún estudiante con el ID {estudiante_id}.")

        eliminado = self.repository.eliminar(estudiante_id)
        return eliminado[0] if isinstance(eliminado, list) and len(eliminado) > 0 else eliminado
