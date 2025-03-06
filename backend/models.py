# models.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List

class User(BaseModel):
    firstName: str
    lastName: str
    username: str
    email: str
    password: str
    role: Optional[str] = "user"
    profileImage: Optional[str] = None

class UserInDB(User):
    id: int

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Event(BaseModel):
    id: int
    title: str
    date: str
    description: str
    image: Optional[str] = None
    participant_count: Optional[int] = 0

class EventUpdate(BaseModel):
    title: str
    date: str
    description: str
    image: Optional[str] = None

class EventCreate(BaseModel):
    title: str
    description: str = None
    date: str
    location: str = None
    image: str = None
    max_participants: int = 50