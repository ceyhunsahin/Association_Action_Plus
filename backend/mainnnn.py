from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import sqlite3


app = FastAPI()

# SQLite veritabanı bağlantısı
def get_db():
    conn = sqlite3.connect('./database/database.db')
    conn.row_factory = sqlite3.Row  # Sorgu sonuçlarını dict olarak almak için
    return conn

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
global_counter = 0
ip_records: Dict[str, int] = {}
user_events: Dict[str, List[int]] = {}  # Store user events

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    firstName: str
    lastName: str
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class Event(BaseModel):
    id: int
    title: str
    date: str
    description: str
    image: str

# Kayıt endpoint'i
@app.post("/register")
async def register(user: User):
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute('''
        INSERT INTO users (firstName, lastName, username, email, password)
        VALUES (?, ?, ?, ?, ?)
        ''', (user.firstName, user.lastName, user.username, user.email, user.password))
        conn.commit()

        # Kaydedilen kullanıcıyı geri döndür
        cursor.execute('''
        SELECT * FROM users WHERE email = ?
        ''', (user.email,))
        new_user = cursor.fetchone()

        return {
            "message": "Utilisateur enregistré avec succès",
            "user": {
                "id": new_user["id"],
                "firstName": new_user["firstName"],
                "lastName": new_user["lastName"],
                "username": new_user["username"],
                "email": new_user["email"],
            }
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    finally:
        conn.close()

# Giriş endpoint'i

@app.post("/login")
async def login(login_data: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute('''
        SELECT * FROM users WHERE email = ? AND password = ?
        ''', (login_data.email, login_data.password))
        user = cursor.fetchone()

        if user:
            return {
                "firstName": user["firstName"],  # firstName'i doğrudan al
                "lastName": user["lastName"],    # lastName'i doğrudan al
                "email": user["email"],
            }
        else:
            raise HTTPException(status_code=400, detail="Email ou mot de passe incorrect")
    finally:
        conn.close()

# Kullanıcı bilgilerini getir
@app.get("/users/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute('''
        SELECT * FROM users WHERE email = ?
        ''', (token,))
        user = cursor.fetchone()

        if user:
            return {
                "id": user["id"],
                "firstName": user["firstName"],
                "lastName": user["lastName"],
                "username": user["username"],
                "email": user["email"],
            }
        else:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    finally:
        conn.close() 

# Etkinlikleri getir
@app.get("/events", response_model=List[Event])
def get_events():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
    SELECT * FROM events
    ''')
    events = cursor.fetchall()
    conn.close()

    return [dict(event) for event in events]

# Tek bir etkinliği getir
@app.get("/events/{event_id}")
async def get_event(event_id: int):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
    SELECT * FROM events WHERE id = ?
    ''', (event_id,))
    event = cursor.fetchone()
    conn.close()

    if event:
        return dict(event)
    else:
        raise HTTPException(status_code=404, detail="Événement non trouvé")

# Etkinliğe katıl
@app.post("/events/{event_id}/join")
async def join_event(event_id: int, token: str = Depends(oauth2_scheme)):
    if token not in user_events:
        user_events[token] = []

    if event_id not in user_events[token]:
        user_events[token].append(event_id)
        return {"message": "Vous avez rejoint l'événement avec succès"}
    else:
        return {"message": "Vous avez déjà rejoint cet événement"}

# Kullanıcının katıldığı etkinlikleri getir
@app.get("/users/me/events")
async def get_user_events(token: str = Depends(oauth2_scheme)):
    if token not in user_events:
        return {"events": []}
    
    # Kullanıcının katıldığı etkinliklerin tam bilgilerini al
    user_event_ids = user_events[token]
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
    SELECT * FROM events WHERE id IN ({})
    '''.format(','.join('?' for _ in user_event_ids)), user_event_ids)
    user_events_full = cursor.fetchall()
    conn.close()

    return {"events": [dict(event) for event in user_events_full]}

# IP kaydı ve global sayaç
@app.post("/counter/track-ip")
async def track_ip(request: Request):
    global global_counter
    client_ip = request.client.host

    if client_ip not in ip_records:
        global_counter += 1
        ip_records[client_ip] = global_counter
        return {"message": "IP tracked", "ip": client_ip, "counter": global_counter}
    else:
        return {"message": "IP already tracked", "ip": client_ip, "counter": ip_records[client_ip]}

# Global sayacı getir
@app.get("/counter")
async def get_counter():
    return {"global_counter": global_counter}