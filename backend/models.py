# models.py
from pydantic import BaseModel

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

class EventUpdate(BaseModel):
    title: str
    date: str
    description: str
    image: str

class EventCreate(BaseModel):
    title: str
    date: str
    description: str
    image: str