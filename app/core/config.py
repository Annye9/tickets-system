"""Configuración de la aplicación"""
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/tickets_db")
FASTAPI_ENV = os.getenv("FASTAPI_ENV", "development")

# Configuración de FastAPI
DEBUG = FASTAPI_ENV == "development"
