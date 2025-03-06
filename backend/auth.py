from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException, status, APIRouter, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from models import User, LoginRequest, TokenData  # TokenData modelini import et

# Güvenlik ayarları
SECRET_KEY = 'ceyhunsahin'  # Güvenli bir anahtar kullanın
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
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Refresh token oluşturma
def create_refresh_token(data: dict):
    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return create_token(data, expires_delta, "refresh")

# Token doğrulama fonksiyonu
def verify_token(token: str):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")

        if email is None or token_type is None:
            raise credentials_exception

        # Token'ın süresini kontrol et
        expiration = payload.get("exp")
        if expiration is None or datetime.utcnow().timestamp() > expiration:
            raise credentials_exception

        return email, token_type
    except JWTError as e:
        print("JWTError:", e)  # Hata mesajını logla
        raise credentials_exception

# Mevcut kullanıcıyı getirme fonksiyonu
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        print(f"Validating token: {token[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            print("Token validation failed: no email in payload")
            raise credentials_exception
        
        # Admin kullanıcısı için özel kontrol
        if email == "admin@admin":
            return {
                "id": 1,
                "username": "admin",
                "email": "admin@admin",
                "firstName": "Admin",
                "lastName": "User",
                "role": "admin"
            }
        
        # Veritabanından kullanıcıyı al
        conn = get_db()
        cursor = conn.cursor()
        
        print(f"Looking up user with email: {email}")
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()
        
        if user is None:
            print(f"User not found for email: {email}")
            raise credentials_exception
        
        print(f"User found: {user['id']} - {user['username']}")
        # Kullanıcı bilgilerini dictionary olarak döndür
        return dict(user)
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise credentials_exception
    except Exception as e:
        print(f"Unexpected error in get_current_user: {e}")
        raise credentials_exception

# Admin kullanıcısını kontrol et
def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekiyor"
        )
    return current_user

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        # Veritabanı bağlantısı
        conn = get_db()
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
            "user_id": user[0]  # id
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
        
        print(f"Login attempt with: {email}")
        
        # Basit admin kontrolü
        if email == "admin@admin" and password == "admin":
            print("Admin login successful")
            # Admin kullanıcısı için token oluştur
            access_token = create_access_token(
                data={"sub": "admin@admin", "role": "admin"},
                expires_delta=timedelta(days=1)  # Admin için daha uzun süre
            )
            
            # Admin kullanıcı bilgilerini döndür
            user = {
                "id": 1,
                "username": "admin",
                "email": "admin@admin",
                "firstName": "Admin",
                "lastName": "User",
                "role": "admin"
            }
            
            return {"access_token": access_token, "token_type": "bearer", "user": user}
        
        # Normal kullanıcı kontrolü
        conn = get_db()
        cursor = conn.cursor()
        
        # Kullanıcıyı email veya username ile ara
        cursor.execute("SELECT * FROM users WHERE email = ? OR username = ?", (email, email))
        user = cursor.fetchone()
        
        if not user:
            print(f"User not found: {email}")
            raise HTTPException(status_code=401, detail="Email, nom d'utilisateur ou mot de passe incorrect")
        
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