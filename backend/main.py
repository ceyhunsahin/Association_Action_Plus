# main.py
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from endpoints import users, events, counter
from database import initialize_db

# Veritabanını başlat
initialize_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(events.router)
app.include_router(counter.router)