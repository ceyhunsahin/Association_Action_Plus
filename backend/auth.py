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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT * FROM users WHERE email = ?
        ''', (token_data.email,))
        user = cursor.fetchone()
        
        if user is None:
            raise credentials_exception
        
        return dict(user)  # SQLite Row'u dict'e çevir
    finally:
        conn.close()

# Admin kullanıcısını kontrol et
def get_current_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Yetkilendirme başarısız",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()
        
        if user is None:
            raise credentials_exception
        
        user_dict = dict(user)
        
        # Kullanıcının admin olup olmadığını kontrol et
        if user_dict.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlem için admin yetkisi gerekiyor"
            )
        
        return user_dict
    except JWTError:
        raise credentials_exception

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
async def login(login_data: LoginRequest):
    try:
        # Veritabanı bağlantısı
        conn = get_db()
        cursor = conn.cursor()
        
        # Kullanıcıyı email veya kullanıcı adı ile bul
        cursor.execute('''
            SELECT * FROM users WHERE email = ? OR username = ?
        ''', (login_data.email, login_data.email))  # email alanını hem email hem de username için kullanıyoruz
        
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email, nom d'utilisateur ou mot de passe incorrect"
            )

        # Şifreyi doğrula
        if not pwd_context.verify(login_data.password, user["password"]):
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email, nom d'utilisateur ou mot de passe incorrect"
            )

        # Token için kullanıcı verilerini hazırla
        token_data = {
            "sub": user["email"],
            "user_id": user["id"]
        }

        # Access token oluştur
        access_token = create_access_token(
            data=token_data,
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        # Kullanıcı bilgilerini hazırla
        user_data = {
            "id": user["id"],
            "email": user["email"],
            "firstName": user["firstName"],
            "lastName": user["lastName"],
            "username": user["username"],
            "role": user["role"]
        }
        
        # profileImage varsa ekle
        if "profileImage" in user and user["profileImage"]:
            user_data["profileImage"] = user["profileImage"]

        conn.close()
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data
        }

    except Exception as e:
        print(f"Login error: {str(e)}")  # Detaylı hata mesajını logla
        # Hata mesajını daha detaylı hale getirelim
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )