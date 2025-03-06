from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import User, LoginRequest
from auth import get_current_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
import sqlite3  # sqlite3'ü import etmeyi unutmayın
from passlib.context import CryptContext
from typing import Dict
from fastapi import status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


    
@router.post("/register")
async def register(user: User):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Şifreyi hash'le
        hashed_password = pwd_context.hash(user.password)

        # Kullanıcıyı veritabanına ekle
        cursor.execute('''
        INSERT INTO users (firstName, lastName, username, email, password)
        VALUES (?, ?, ?, ?, ?)
        ''', (user.firstName, user.lastName, user.username, user.email, hashed_password))
        conn.commit()

        # Yeni eklenen kullanıcıyı al
        cursor.execute('''
        SELECT * FROM users WHERE email = ?
        ''', (user.email,))
        new_user = cursor.fetchone()

        # Token oluştur
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user["email"]}, expires_delta=access_token_expires
        )

        return {
            "message": "Utilisateur enregistré avec succès",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": new_user["id"],
                "firstName": new_user["firstName"],
                "lastName": new_user["lastName"],
                "username": new_user["username"],
                "email": new_user["email"],
                "role": new_user["role"],
            }
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    finally:
        conn.close()

@router.post("/login")
async def login(login_data: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Kullanıcıyı veritabanında ara (e-posta ile)
        cursor.execute('''
        SELECT * FROM users WHERE email = ?
        ''', (login_data.email,))
        user = cursor.fetchone()

        if user:
            # Şifreyi doğrula
            if pwd_context.verify(login_data.password, user["password"]):
                # Token oluştur
                access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
                access_token = create_access_token(
                    data={"sub": user["email"]}, expires_delta=access_token_expires
                )

                return {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": user["id"],
                        "firstName": user["firstName"],
                        "lastName": user["lastName"],
                        "username": user["username"],
                        "email": user["email"],
                        "role": user["role"],
                    }
                }
            else:
                raise HTTPException(status_code=400, detail="Email ou mot de passe incorrect")
        else:
            raise HTTPException(status_code=400, detail="Email ou mot de passe incorrect")
    except Exception as e:
        print(f"Login error: {e}")  # Hata detayını logla
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        conn.close()
        
        
@router.get("/me", response_model=Dict)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    # Kullanıcı bilgilerini döndür (şifre hariç)
    user_info = {
        "id": current_user["id"],
        "firstName": current_user["firstName"],
        "lastName": current_user["lastName"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "profileImage": current_user.get("profileImage", None)  # Profil resmi ekleyelim
    }
    return user_info

@router.post("/register")
async def auth_register(user: User):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Şifreyi hash'le
        hashed_password = pwd_context.hash(user.password)

        # Kullanıcıyı veritabanına ekle
        cursor.execute('''
        INSERT INTO users (firstName, lastName, username, email, password)
        VALUES (?, ?, ?, ?, ?)
        ''', (user.firstName, user.lastName, user.username, user.email, hashed_password))
        conn.commit()

        # Yeni eklenen kullanıcıyı al
        cursor.execute('''
        SELECT * FROM users WHERE email = ?
        ''', (user.email,))
        new_user = cursor.fetchone()

        # Token oluştur
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user["email"]}, expires_delta=access_token_expires
        )

        return {
            "message": "Utilisateur enregistré avec succès",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": new_user["id"],
                "firstName": new_user["firstName"],
                "lastName": new_user["lastName"],
                "username": new_user["username"],
                "email": new_user["email"],
                "role": new_user["role"],
            }
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    finally:
        conn.close()

# Kullanıcının etkinliklerini getir
@router.get("/me/events", response_model=Dict)
async def get_user_events(current_user: dict = Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Kullanıcının katıldığı etkinlikleri getir
        cursor.execute('''
            SELECT e.* FROM events e
            JOIN event_participants ep ON e.id = ep.event_id
            WHERE ep.user_id = ?
        ''', (current_user["id"],))
        
        events = cursor.fetchall()
        
        # SQLite row'larını dict'e çevir
        events_list = []
        for event in events:
            event_dict = dict(event)
            events_list.append(event_dict)
        
        return {"events": events_list}
    except Exception as e:
        print(f"Error in get_user_events: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        conn.close()