import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client


# Lee las credenciales desde BACKEND/.env.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")

    if not url or not key:
        raise RuntimeError(
            "Configura SUPABASE_URL y SUPABASE_KEY en BACKEND/.env"
        )

    return create_client(url, key)


supabase = get_supabase_client()
