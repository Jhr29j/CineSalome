from pydantic import BaseModel, EmailStr, Field, ConfigDict

class ESTUDIANTE(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    ID_ESTUDIANTE: int | None = None
    NOMBRE_COMPLETO: str = Field(min_length=3, max_length=120)
    NUMERO_DE_LISTA: int = Field(ge=1)
    CORREO: EmailStr
    ID_TECNICA: int = Field(ge=1)
    ID_GRADO: int = Field(ge=1)
    CONTRASEÑA: str = Field(min_length=8, max_length=128)

class LoginInput(BaseModel):
    CORREO: EmailStr
    CONTRASEÑA: str = Field(min_length=1, max_length=128)

class AdminLoginInput(BaseModel):
    USUARIO: str = Field(min_length=3, max_length=60)
    CONTRASEÑA: str = Field(min_length=1, max_length=128)
