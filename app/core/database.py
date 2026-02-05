"""Configuración de la base de datos y cliente Prisma"""
from prisma import Prisma

# Instancia global del cliente Prisma
db = Prisma()

async def connect_database():
    """Conectar a la base de datos"""
    await db.connect()

async def disconnect_database():
    """Desconectar de la base de datos"""
    await db.disconnect()
