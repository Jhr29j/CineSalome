from pydantic import BaseModel



class TECNICA (BaseModel): 

    ID_TECNICA: int 
    NOMBRE_TECNICA: str



class GRADO (BaseModel): 

    ID_GRADO: int 
    NOMBRE_GRADO: str
