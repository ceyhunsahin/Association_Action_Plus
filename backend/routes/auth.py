from fastapi import APIRouter, Request, HTTPException
from passlib.context import CryptContext
from backend.database import get_db, pwd_context
from backend.utils import create_access_token

router = APIRouter()

# Sabit admin kullanıcısı
ADMIN_USER = {
    "id": 1,
    "username": "admin",
    "email": "admin@admin",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "password": "$2b$12$1YGKNPUzWLJLLgNXN9jcpOQ9Nt5VGGh.YfpBZFC/TxWCGkpkK0F9q"  # "admin" şifresinin hash'i
}

@router.post("/login")
async def login(request: Request):
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email ve şifre gereklidir")
        
        # Admin kullanıcısı kontrolü
        if email == ADMIN_USER["email"] or email == ADMIN_USER["username"]:
            user = ADMIN_USER
            print(f"Admin kullanıcısı bulundu: {email}")
            
            # Şifreyi doğrula
            if not pwd_context.verify(password, user["password"]):
                print(f"Admin için geçersiz şifre")
                raise HTTPException(status_code=401, detail="Email, nom d'utilisateur ou mot de passe incorrect")
            
            # Admin kullanıcısı için token oluştur
            access_token = create_access_token(
                data={"sub": user["username"], "id": user["id"], "role": user["role"]}
            )
            
            # Şifreyi çıkar
            user_dict = dict(user)
            user_dict.pop("password")
            
            return {"access_token": access_token, "token_type": "bearer", "user": user_dict}
        
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
        
        # JWT token oluştur
        access_token = create_access_token(
            data={"sub": user["username"], "id": user["id"], "role": user["role"]}
        )
        
        # Kullanıcı bilgilerini döndür (şifre hariç)
        user_dict = dict(user)
        user_dict.pop("password")
        
        return {"access_token": access_token, "token_type": "bearer", "user": user_dict}
    except HTTPException as e:
        print(f"Login error: {e.status_code}: {e.detail}")
        raise e
    except Exception as e:
        print(f"Unexpected error during login: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 