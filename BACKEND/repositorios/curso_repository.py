from Schemas.course import TECNICA, GRADO
from config.supabase_client import supabase


class CursoRepository:
    TECNICA_TABLE = "TECNICA"
    GRADO_TABLE = "GRADO"

    @staticmethod
    def obtener_todas_tecnicas():
        respuesta = (
            supabase
            .table(CursoRepository.TECNICA_TABLE)
            .select("*")
            .execute()
        )
        return respuesta.data

    @staticmethod
    def obtener_tecnica_por_id(tecnica_id: int):
        respuesta = (
            supabase
            .table(CursoRepository.TECNICA_TABLE)
            .select("*")
            .eq("ID_TECNICA", tecnica_id)
            .execute()
        )
        return respuesta.data[0] if respuesta.data else None

    @staticmethod
    def obtener_todos_grados():
        respuesta = (
            supabase
            .table(CursoRepository.GRADO_TABLE)
            .select("*")
            .execute()
        )
        return respuesta.data

    @staticmethod
    def obtener_grado_por_id(grado_id: int):
        respuesta = (
            supabase
            .table(CursoRepository.GRADO_TABLE)
            .select("*")
            .eq("ID_GRADO", grado_id)
            .execute()
        )
        return respuesta.data[0] if respuesta.data else None
