# main.py
from fastapi import FastAPI, Request, Response, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import List, Dict
import sqlite3
from database import get_db
from auth import router as auth_router, get_current_user, get_current_admin
from endpoints.events import router as events_router
from endpoints.users import router as users_router

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

# Routerları ekle
app.include_router(auth_router, prefix="/api/auth")
app.include_router(events_router, prefix="/api/events")
app.include_router(users_router, prefix="/api/users")

# Ana sayfa
@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

# Sağlık kontrolü
@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.options("/{full_path:path}")
async def options_route(request: Request, full_path: str):
    return Response(status_code=200)