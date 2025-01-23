from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import Event, EventUpdate, EventCreate
from auth import get_current_user,get_current_admin
from typing import List, Dict
import sqlite3

router = APIRouter()

@router.get("/events", response_model=List[Event])
def get_events():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
    SELECT * FROM events
    ''')
    events = cursor.fetchall()
    conn.close()

    return [dict(event) for event in events]

@router.get("/events/{event_id}")
async def get_event(event_id: int):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
    SELECT * FROM events WHERE id = ?
    ''', (event_id,))
    event = cursor.fetchone()
    conn.close()

    if event:
        return dict(event)  # Etkinliği sözlük olarak döndür
    else:
        raise HTTPException(status_code=404, detail="Événement non trouvé")

@router.post("/events/{event_id}/join")
async def join_event(event_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Kullanıcının etkinliğe daha önce katılıp katılmadığını kontrol et
        cursor.execute('''
        SELECT * FROM user_events WHERE user_email = ? AND event_id = ?
        ''', (current_user["email"], event_id))
        existing_entry = cursor.fetchone()

        if existing_entry:
            return {"message": "Vous avez déjà rejoint cet événement"}

        # Kullanıcıyı etkinliğe ekle
        cursor.execute('''
        INSERT INTO user_events (user_email, event_id)
        VALUES (?, ?)
        ''', (current_user["email"], event_id))
        conn.commit()

        return {"message": "Vous avez rejoint l'événement avec succès"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Erreur lors de la participation à l'événement")
    finally:
        conn.close()

@router.get("/users/me/events")
async def get_user_events(current_user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Kullanıcının katıldığı etkinlikleri veritabanından al
        cursor.execute('''
        SELECT events.* FROM events
        JOIN user_events ON events.id = user_events.event_id
        WHERE user_events.user_email = ?
        ''', (current_user["email"],))
        user_events = cursor.fetchall()

        return {"events": [dict(event) for event in user_events]}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

# Admin kullanıcıyı kontrol etme fonksiyonu
@router.post("/eventcreate")
async def create_event(event: EventCreate, current_user: dict = Depends(get_current_admin)):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Yeni etkinliği veritabanına ekle
        cursor.execute('''
        INSERT INTO events (title, date, description, image)
        VALUES (?, ?, ?, ?)
        ''', (event.title, event.date, event.description, event.image))
        conn.commit()

        # Eklenen etkinliği geri döndür
        cursor.execute('''
        SELECT * FROM events WHERE id = last_insert_rowid()
        ''')
        new_event = cursor.fetchone()

        return {
            "message": "Événement créé avec succès",
            "event": dict(new_event)
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Erreur lors de la création de l'événement")
    finally:
        conn.close()
        
@router.delete("/users/me/events/{event_id}")
async def delete_user_event(event_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Kullanıcının etkinliğe katılımını sil
        cursor.execute('''
        DELETE FROM user_events WHERE user_email = ? AND event_id = ?
        ''', (current_user["email"], event_id))
        conn.commit()

        return {"message": "Événement supprimé de votre profil avec succès"}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()
        
@router.delete("/events/{event_id}")
async def delete_event(event_id: int, current_user: dict = Depends(get_current_admin)):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Etkinliği veritabanından sil
        cursor.execute('''
        DELETE FROM events WHERE id = ?
        ''', (event_id,))
        conn.commit()

        return {"message": "Événement supprimé avec succès"}
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()