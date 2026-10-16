# repositories/registro_repository.py
from Schemas.user import ESTUDIANTE
from config.supabase_client import supabase


class RegistroRepository:
    TABLE_NAME = "ESTUDIANTE"

    @staticmethod
    def crear(estudiante: ESTUDIANTE):
        respuesta = (
            supabase
            .table(RegistroRepository.TABLE_NAME)
            .insert(estudiante.model_dump())
            .execute()
        )
        return respuesta.data

    @staticmethod
    def obtener_todos():
        respuesta = (
            supabase
            .table(RegistroRepository.TABLE_NAME)
            .select("*")
            .execute()
        )
        return respuesta.data

    @staticmethod
    def obtener_por_id(estudiante_id: int):
        respuesta = (
            supabase
            .table(RegistroRepository.TABLE_NAME)
            .select("*")
            .eq("ID_ESTUDIANTE", estudiante_id)
            .execute()
        )
        return respuesta.data[0] if respuesta.data else None

    @staticmethod
    def obtener_por_correo(correo: str):
        respuesta = (
            supabase
            .table(RegistroRepository.TABLE_NAME)
            .select("*")
            .eq("CORREO", correo)
            .execute()
        )
        return respuesta.data[0] if respuesta.data else None


    @staticmethod
    def actualizar(estudiante_id: int, estudiante: ESTUDIANTE):
        respuesta = (
            supabase
            .table(RegistroRepository.TABLE_NAME)
            .update(estudiante.model_dump(exclude_unset=True))
            .eq("ID_ESTUDIANTE", estudiante_id)
            .execute()
        )
        return respuesta.data

    @staticmethod
    def eliminar(estudiante_id: int):
        respuesta = (
            supabase
            .table(RegistroRepository.TABLE_NAME)
            .delete()
            .eq("ID_ESTUDIANTE", estudiante_id)
            .execute()
        )
        return respuesta.data
