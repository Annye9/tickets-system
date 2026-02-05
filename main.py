from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI
from prisma import Prisma
from pydantic import BaseModel

# 🔹 Crear app y conexión UNA SOLA VEZ
app = FastAPI()
db = Prisma()

# 🔹 Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)

# 🔹 Conectar Prisma al iniciar FastAPI
@app.on_event("startup")
async def startup():
    await db.connect()

# 🔹 Desconectar al apagar
@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

# 🔹 Ruta raíz

@app.get("/")
async def root():
    return {
        "status": "API funcionando 🚀",
        "message": "Backend de Tickets operativo"
    }

# 🔹 Obtener tickets
@app.get("/tickets")
async def get_tickets():
    return await db.ticket.find_many()

# 🔹 Modelo para crear ticket
class TicketCreate(BaseModel):
    titulo: str
    estado: str

# 🔹 Crear ticket
@app.post("/tickets")
async def create_ticket(ticket: TicketCreate):
    return await db.ticket.create(
        data={
            "titulo": ticket.titulo,
            "estado": ticket.estado
        }
    )

# 🔹 Modelo para cambiar estado
class EstadoUpdate(BaseModel):
    estado: str

# 🔹 Cambiar estado del ticket
@app.put("/tickets/{ticket_id}")
async def cambiar_estado(ticket_id: int, data: EstadoUpdate):
    ticket = await db.ticket.find_unique(
        where={"id": ticket_id}
    )

    if not ticket:
        return {"error": "Ticket no encontrado"}

    return await db.ticket.update(
        where={"id": ticket_id},
        data={"estado": data.estado},
    )
from fastapi import HTTPException

@app.delete("/tickets/{ticket_id}")
async def eliminar_ticket(ticket_id: int):
    ticket = await db.ticket.find_unique(
        where={"id": ticket_id}
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket no encontrado"
        )

    await db.ticket.delete(
        where={"id": ticket_id}
    )

    return {
        "message": "Ticket eliminado correctamente"
    }
