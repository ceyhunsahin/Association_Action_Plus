from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException, status, APIRouter, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from models import User, LoginRequest, TokenData  # TokenData modelini import et
import os
import requests
import json
import sqlite3
import secrets
import string



# Güvenlik ayarları
SECRET_KEY = "ceyhunsahin"  # Gerçek uygulamada güvenli bir şekilde saklayın
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Şifre hash'leme için kullanılacak context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 şeması
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Router'ı oluştur
router = APIRouter(
    tags=["authentication"]
)

# Firebase API key
FIREBASE_API_KEY = "AIzaSyAQxAEcxJB8A8Wmd5-uEKRf7mnry2wsEi4"

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Token oluşturma fonksiyonu
def create_token(data: dict, expires_delta: timedelta, token_type: str = "access"):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "type": token_type})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Access token oluşturma
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)  # 30 dakika
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Refresh token oluşturma
def create_refresh_token(data: dict):
    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return create_token(data, expires_delta, "refresh")

# Token doğrulama ve kullanıcı alma
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        print("[DEBUG] Verifying token")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")
        
        print(f"[DEBUG] Token payload: {payload}")
        print(f"[DEBUG] Email: {email}, Role: {role}")
        
        # Admin kontrolü - token'daki role bilgisini kullan
        if email == "admin@admin" and role == "admin":
            print("[DEBUG] Admin token verified")
            return {
                "id": 1,
                "email": "admin@admin",
                "firstName": "Admin",
                "lastName": "User",
                "role": "admin"
            }

        # Normal kullanıcı kontrolü devam eder...
        print(f"[DEBUG] Regular user token verification for: {email}")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Kullanıcı bilgilerini düzenle
        user_dict = {
            "id": user[0],
            "email": user[1],
            "firstName": user[2],
            "lastName": user[3],
            "username": user[4],
            "role": user[6] if len(user) > 6 else "user"  # role bilgisi varsa al, yoksa "user" olarak ayarla
        }
        print(f"User found: {user_dict}")
        return user_dict
    
    except JWTError as e:
        print(f"[DEBUG] JWT Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

# Admin kullanıcısını kontrol et
async def get_current_admin(current_user: dict = Depends(get_current_user)):
    """Admin kullanıcısını kontrol et"""
    print(f"[DEBUG] Current user: {current_user}")
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have admin privileges"
        )
    return current_user

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # Veritabanı bağlantısı
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Kullanıcıyı bul
        cursor.execute('''
            SELECT id, email, firstName, lastName, username, password, role 
            FROM users 
            WHERE email = ?
        ''', (form_data.username,))
        
        user = cursor.fetchone()
        conn.close()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )

        # Şifreyi doğrula
        if not pwd_context.verify(form_data.password, user[5]):  # user[5] password sütunu
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou mot de passe incorrect"
            )

        # Token için kullanıcı verilerini hazırla
        token_data = {
            "sub": user[1],  # email
            "user_id": user[0],  # id
            "role": user[6]  # role
        }

        # Access token oluştur
        access_token = create_access_token(
            data=token_data,
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        # Kullanıcı bilgilerini hazırla
        user_data = {
            "id": user[0],
            "email": user[1],
            "firstName": user[2],
            "lastName": user[3],
            "username": user[4],
            "role": user[6]
        }

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data
        }

    except Exception as e:
        print(f"Login error: {e}")  # Debug için
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.options("/register", status_code=200)
async def options_register():
    return Response(status_code=200)

@router.post("/register", status_code=201)
async def register(user: User):
    conn = get_db_connection()
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@router.post("/login")
async def login(request: Request):
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")
        
        print(f"[DEBUG] Login attempt for: {email}")

        # Admin kontrolü
        if email == "admin@admin":
            print("[DEBUG] Admin login attempt")
            if password == "admin":
                print("[DEBUG] Admin password verified")
                token_data = {
                    "sub": "admin@admin",
                    "role": "admin"
                }
                print(f"[DEBUG] Creating admin token with data: {token_data}")
                access_token = create_access_token(data=token_data)
                print(f"[DEBUG] Admin token created: {access_token[:20]}...")
                
                admin_user = {
                    "id": 1,
                    "email": "admin@admin",
                    "firstName": "Admin",
                    "lastName": "User",
                    "role": "admin"
                }
                
                print("[DEBUG] Admin token created successfully")
                return {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": admin_user
                }
            else:
                print("[DEBUG] Admin password incorrect")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )

        # Normal kullanıcı girişi için mevcut kod aynen devam eder...
        print("[DEBUG] Proceeding with regular user login")
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
            
        # Şifreyi doğrula
        if not pwd_context.verify(password, user["password"]):
            print(f"Invalid password for user: {email}")
            raise HTTPException(status_code=401, detail="Email, nom d'utilisateur ou mot de passe incorrect")
        
        # JWT token oluştur - email veya username kullan
        access_token = create_access_token(
            data={"sub": user["email"], "role": user["role"]}
        )
        
        # Kullanıcı bilgilerini döndür (şifre hariç)
        user_dict = dict(user)
        user_dict.pop("password")
        
        print(f"Login successful for user: {user_dict['email']}")
        print(f"Generated token: {access_token[:10]}...")
        
        return {"access_token": access_token, "token_type": "bearer", "user": user_dict}
    except HTTPException as e:
        print(f"Login error: {e.status_code}: {e.detail}")
        raise e
    except Exception as e:
        print(f"Unexpected error during login: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Firebase token doğrulama
def verify_firebase_token(id_token):
    try:
        print(f"Verifying Firebase token: {id_token[:10]}...")
        
        # Firebase Auth REST API kullanarak token'ı doğrula
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={FIREBASE_API_KEY}"
        headers = {"Content-Type": "application/json"}
        data = {"idToken": id_token}
        
        print(f"Sending request to Firebase API...")
        response = requests.post(url, headers=headers, data=json.dumps(data))
        
        print(f"Firebase API response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Firebase API error: {response.text}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Firebase token verification failed: {response.text}"
            )
        
        # JSON yanıtını parse et
        user_data = response.json()
        print(f"Firebase API response: {user_data}")
        
        # users dizisini kontrol et
        if "users" not in user_data or len(user_data["users"]) == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token: No user found"
            )
        
        return user_data["users"][0]
    except Exception as e:
        print(f"Firebase token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Failed to verify Firebase token: {str(e)}"
        )

# Google login endpoint
@router.post("/google-login")
async def google_login(request: Request):
    try:
        data = await request.json()
        user_data = data.get("userData", {})
        
        email = user_data.get("email")
        display_name = user_data.get("displayName", "")
        photo_url = user_data.get("photoURL", "")
        
        if not email:
            print("Email bulunamadı:", user_data)
            raise HTTPException(
                status_code=400,
                detail="Email is required"
            )
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Kullanıcıyı email ile ara
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            # Yeni kullanıcı oluştur
            cursor.execute("""
                INSERT INTO users (email, firstName, username, profileImage, role)
                VALUES (?, ?, ?, ?, ?)
            """, (
                email,
                display_name or email.split('@')[0],
                email.split('@')[0],
                photo_url,
                "user"
            ))
            conn.commit()
            
            # Yeni oluşturulan kullanıcıyı al
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
        
        # Token oluştur
        access_token = create_access_token(
            data={
                "sub": email,
                "id": user["id"],
                "role": user["role"]
            }
        )
        
        # Kullanıcı bilgilerini hazırla
        user_dict = dict(user)
        if "password" in user_dict:
            user_dict.pop("password")
        
        conn.close()
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_dict
        }
        
    except Exception as e:
        print(f"Google login error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/refresh-token")
async def refresh_token(request: Request):
    try:
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No token provided"
            )
            
        token = token.split(' ')[1]
        print(f"[DEBUG] Refreshing token")
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            print(f"[DEBUG] Token payload for refresh: {payload}")
            
            # Admin token kontrolü
            if payload.get("sub") == "admin@admin" and payload.get("role") == "admin":
                print("[DEBUG] Refreshing admin token")
                new_token = create_access_token(
                    data={
                        "sub": "admin@admin",
                        "role": "admin",
                        "type": "access"
                    }
                )
                
                return {
                    "access_token": new_token,
                    "token_type": "bearer",
                    "user": {
                        "id": 1,
                        "email": "admin@admin",
                        "firstName": "Admin",
                        "lastName": "User",
                        "role": "admin"
                    }
                }
                
            # Normal kullanıcı token yenileme devam eder...
            print("[DEBUG] Proceeding with regular token refresh")
            # Kullanıcıyı veritabanından al
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Kullanıcı ID'si sayı ise doğrudan kullan, email ise email ile ara
            if payload.get("sub").isdigit():
                cursor.execute("SELECT * FROM users WHERE id = ?", (int(payload.get("sub")),))
            else:
                cursor.execute("SELECT * FROM users WHERE email = ?", (payload.get("sub"),))
            
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            # Yeni access token oluştur
            access_token = create_access_token(
                data={"sub": str(user["id"]), "role": user["role"]},
                expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            )
            
            # Kullanıcı bilgilerini döndür (şifre hariç)
            user_dict = dict(user)
            if "password" in user_dict:
                user_dict.pop("password")
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": user_dict
            }
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except Exception as e:
        print(f"[DEBUG] Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )