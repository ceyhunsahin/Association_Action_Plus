# main.py
from fastapi import FastAPI, Request, Response, HTTPException, Depends, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import List, Dict, Optional
import sqlite3
from database import get_db, init_db, get_user_donations, get_donation_by_id, create_donation
from auth import router as auth_router, get_current_user, get_current_admin
from endpoints.events import router as events_router
from endpoints.users import router as users_router
from fastapi.responses import JSONResponse
import os
import uvicorn
from pydantic import BaseModel
from datetime import datetime

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

# Bağış modeli
class DonationCreate(BaseModel):
    amount: float
    currency: str
    payment_method: str
    donor_name: str
    donor_email: str
    donor_address: Optional[str] = None
    donor_phone: Optional[str] = None
    donor_message: Optional[str] = None
    is_recurring: Optional[bool] = False
    receipt_needed: Optional[bool] = False
    status: Optional[str] = "PENDING"
    user_id: Optional[int] = None

# Bağış endpoint'leri
@app.get("/api/donations/user/{user_id}")
async def get_user_donations_endpoint(user_id: int):
    """Kullanıcının bağışlarını getir"""
    donations = get_user_donations(user_id)
    return donations

@app.get("/api/donations/{donation_id}")
async def get_donation_endpoint(donation_id: int):
    """Bağış detaylarını getir"""
    donation = get_donation_by_id(donation_id)
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Donation with ID {donation_id} not found"
        )
    return donation

@app.post("/api/donations")
async def create_donation_endpoint(donation_data: dict = Body(...)):
    """Yeni bağış oluştur"""
    try:
        print(f"Alınan bağış verileri: {donation_data}")
        
        # Bağışı oluştur
        result = create_donation(donation_data)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create donation"
            )
        return result
    except Exception as e:
        print(f"Bağış oluşturma hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create donation: {str(e)}"
        )

# Veritabanını başlat
@app.on_event("startup")
async def startup_event():
    init_db()

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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)