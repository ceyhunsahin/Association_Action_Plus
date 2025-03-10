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

class Donation(BaseModel):
    id: Optional[int] = None
    user_id: int
    amount: float
    currency: str = "EUR"
    payment_method: str
    transaction_id: Optional[str] = None
    status: str
    donor_name: str
    donor_email: str
    donor_address: Optional[str] = None
    donor_phone: Optional[str] = None
    donor_message: Optional[str] = None
    bank_info: Optional[dict] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None