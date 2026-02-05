"""Rutas de la API"""
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def root():
    """Endpoint raíz - verifica que la API está funcionando"""
    return {"status": "API funcionando 🚀", "message": "Backend de Tickets operativo"}

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
