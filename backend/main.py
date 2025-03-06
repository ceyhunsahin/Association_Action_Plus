# main.py
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from database import initialize_db
import auth
from endpoints import users, events, counter

# FastAPI uygulamasını oluştur
app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tüm originlere izin ver (geliştirme için)
    allow_credentials=True,
    allow_methods=["*"],  # Tüm HTTP metodlarına izin ver
    allow_headers=["*"],  # Tüm headerlara izin ver
)

# Veritabanını başlat
initialize_db()

# Auth router'ını ekle
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Diğer router'ları ekle
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(counter.router, prefix="/api/counter", tags=["counter"])

# Ana sayfa
@app.get("/")
async def root():
    return {"message": "Association Culturelle API"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.options("/{full_path:path}")
async def options_route(request: Request, full_path: str):
    return Response(status_code=200)