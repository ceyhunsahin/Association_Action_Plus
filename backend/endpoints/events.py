from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Dict
from database import get_db
from auth import get_current_user, get_current_admin, oauth2_scheme
from models import Event, EventCreate, EventUpdate
import sqlite3
from jose import JWTError, jwt
from datetime import datetime
import json

router = APIRouter(
    tags=["events"]
)
# SECRET_KEY ve ALGORITHM değerlerini auth.py'den alın
SECRET_KEY = 'ceyhunsahin'
ALGORITHM = "HS256"

# Admin kontrolü için özel bir fonksiyon
def check_admin_token(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Yetkilendirme başarısız",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        
        if email is None:
            raise credentials_exception
        
        # Admin kontrolü - doğrudan token'dan kontrol edelim
        if role == "admin":
            return True
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekiyor"
        )
    except JWTError:
        raise credentials_exception

# Tüm etkinlikleri getir
@router.get("", response_model=List[Dict])
async def get_events():
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM events")
        events = cursor.fetchall()
        
        # SQLite Row'ları dictionary'e çevir
        events_list = []
        for event in events:
            event_dict = dict(event)
            if event_dict.get("images"):
                try:
                    event_dict["images"] = json.loads(event_dict["images"])
                except Exception:
                    event_dict["images"] = []
            else:
                event_dict["images"] = []
            if event_dict.get("videos"):
                try:
                    event_dict["videos"] = json.loads(event_dict["videos"])
                except Exception:
                    event_dict["videos"] = []
            else:
                event_dict["videos"] = []
            if "participant_count" not in event_dict or event_dict["participant_count"] is None:
                event_dict["participant_count"] = 0
            events_list.append(event_dict)
        
        return events_list
    except Exception as e:
        print(f"Error in get_events: {str(e)}")  # Hata mesajını logla
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Kullanıcının etkinliklerini getir
@router.get("/users/me/events")
async def get_user_events(current_user: dict = Depends(get_current_user)):
    """Kullanıcının katıldığı etkinlikleri getir"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Kullanıcı ID'sini al
        user_id = current_user.get("id")
        if not user_id and "@" in current_user.get("sub", ""):
            # Email ile kullanıcıyı bul
            cursor.execute("SELECT id FROM users WHERE email = ?", (current_user["sub"],))
            result = cursor.fetchone()
            if result:
                user_id = result["id"]
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Kullanıcının etkinliklerini getir
        cursor.execute("""
            SELECT e.* 
            FROM events e
            JOIN event_participants ep ON e.id = ep.event_id
            WHERE ep.user_id = ?
        """, (user_id,))
        
        events = cursor.fetchall()
        conn.close()
        
        return {"events": [dict(event) for event in events]}
        
    except Exception as e:
        print(f"Error getting user events: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Yeni etkinlik oluştur (sadece admin)
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_event(
    event: dict,
    current_user: dict = Depends(get_current_admin)
):
    """Yeni etkinlik oluştur (sadece admin)"""
    try:
        print(f"[DEBUG] Creating event with data: {event}")
        print(f"[DEBUG] Current user: {current_user}")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Etkinliği oluştur
        images_value = None
        if isinstance(event.get("images"), list):
            images_value = json.dumps(event.get("images"))
        videos_value = None
        if isinstance(event.get("videos"), list):
            videos_value = json.dumps(event.get("videos"))

        cursor.execute("""
            INSERT INTO events (
                title, description, date, location, 
                image, images, videos, max_participants, participant_count, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event.get("title"),
            event.get("description"),
            event.get("date"),
            event.get("location"),
            event.get("image"),
            images_value,
            videos_value,
            event.get("max_participants"),
            event.get("participant_count", 0),
            current_user.get("id", 1)  # Admin ID'si varsayılan olarak 1
        ))
        
        conn.commit()
        
        # Yeni oluşturulan etkinliği getir
        event_id = cursor.lastrowid
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        new_event = cursor.fetchone()
        
        conn.close()
        new_event_dict = dict(new_event)
        if new_event_dict.get("images"):
            try:
                new_event_dict["images"] = json.loads(new_event_dict["images"])
            except Exception:
                new_event_dict["images"] = []
        else:
            new_event_dict["images"] = []
        if new_event_dict.get("videos"):
            try:
                new_event_dict["videos"] = json.loads(new_event_dict["videos"])
            except Exception:
                new_event_dict["videos"] = []
        else:
            new_event_dict["videos"] = []
        return new_event_dict
        
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Etkinlik güncelleme (sadece admin)
@router.put("/{event_id}", status_code=status.HTTP_200_OK)
async def update_event(
    event_id: int,
    event: dict,
    current_user: dict = Depends(get_current_admin)
):
    """Etkinliği güncelle (sadece admin)"""
    try:
        print(f"[DEBUG] Updating event {event_id} with data: {event}")
        print(f"[DEBUG] Current user: {current_user}")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Etkinliğin var olup olmadığını kontrol et
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        existing_event = cursor.fetchone()
        
        if not existing_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Événement non trouvé"
            )
        
        # Etkinliği güncelle - updated_at sütununu kaldırdık
        images_value = None
        if isinstance(event.get("images"), list):
            images_value = json.dumps(event.get("images"))
        videos_value = None
        if isinstance(event.get("videos"), list):
            videos_value = json.dumps(event.get("videos"))

        cursor.execute("""
            UPDATE events SET
                title = ?,
                description = ?,
                date = ?,
                location = ?,
                image = ?,
                images = ?,
                videos = ?,
                max_participants = ?
            WHERE id = ?
        """, (
            event.get("title"),
            event.get("description"),
            event.get("date"),
            event.get("location"),
            event.get("image"),
            images_value,
            videos_value,
            event.get("max_participants"),
            event_id
        ))
        
        conn.commit()
        
        # Güncellenmiş etkinliği getir
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        updated_event = cursor.fetchone()
        
        conn.close()
        updated_event_dict = dict(updated_event)
        if updated_event_dict.get("images"):
            try:
                updated_event_dict["images"] = json.loads(updated_event_dict["images"])
            except Exception:
                updated_event_dict["images"] = []
        else:
            updated_event_dict["images"] = []
        if updated_event_dict.get("videos"):
            try:
                updated_event_dict["videos"] = json.loads(updated_event_dict["videos"])
            except Exception:
                updated_event_dict["videos"] = []
        else:
            updated_event_dict["videos"] = []
        return updated_event_dict
        
    except Exception as e:
        print(f"Error updating event: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Etkinliği sil (sadece admin)
@router.delete("/{event_id}")
async def delete_event(event_id: int, current_user: dict = Depends(get_current_admin)):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
        SELECT * FROM events WHERE id = ?
        ''', (event_id,))
        existing_event = cursor.fetchone()
        
        if not existing_event:
            raise HTTPException(status_code=404, detail="Événement non trouvé")
        
        # Etkinliği sil
        cursor.execute('''
        DELETE FROM events WHERE id = ?
        ''', (event_id,))
        
        # Etkinliğe katılımları da sil
        cursor.execute('''
        DELETE FROM event_participants WHERE event_id = ?
        ''', (event_id,))
        
        conn.commit()
        
        return {"message": "Événement supprimé avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Belirli bir etkinliği getir
@router.get("/{event_id}", response_model=Dict)
async def get_event(event_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Etkinliği bul
        cursor.execute('''
        SELECT * FROM events WHERE id = ?
        ''', (event_id,))
        event = cursor.fetchone()
        
        if not event:
            raise HTTPException(status_code=404, detail="Événement non trouvé")
        
        # Katılımcıları bul
        cursor.execute('''
        SELECT u.id, u.firstName, u.lastName, u.username, u.email
        FROM event_participants ep
        JOIN users u ON ep.user_id = u.id
        WHERE ep.event_id = ?
        ''', (event_id,))
        participants = cursor.fetchall()
        
        # Katılımcıları dictionary'e çevir
        participants_list = []
        for participant in participants:
            participants_list.append({
                "id": participant["id"],
                "firstName": participant["firstName"],
                "lastName": participant["lastName"],
                "username": participant["username"],
                "email": participant["email"]
            })
        
        # Etkinliği dictionary'e çevir
        images = []
        if event["images"]:
            try:
                images = json.loads(event["images"])
            except Exception:
                images = []
        videos = []
        if event["videos"]:
            try:
                videos = json.loads(event["videos"])
            except Exception:
                videos = []

        event_dict = {
            "id": event["id"],
            "title": event["title"],
            "date": event["date"],
            "description": event["description"],
            "location": event["location"],
            "image": event["image"],
            "images": images,
            "videos": videos,
            "max_participants": event["max_participants"],
            "participant_count": len(participants_list),
            "participants": participants_list
        }
        
        return event_dict
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error in get_event: {str(e)}")  # Hata mesajını logla
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Etkinliğe katıl
@router.post("/{event_id}/join")
async def join_event(event_id: int, current_user: dict = Depends(get_current_user)):
    print(f"Join event request received for event {event_id}")
    print(f"Current user: {current_user}")
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Etkinliği bul
        cursor.execute('''
        SELECT * FROM events WHERE id = ?
        ''', (event_id,))
        event = cursor.fetchone()
        
        if not event:
            raise HTTPException(status_code=404, detail="Événement non trouvé")
        
        # Kullanıcının zaten katılıp katılmadığını kontrol et
        cursor.execute('''
            SELECT * FROM event_participants 
            WHERE user_id = ? AND event_id = ?
        ''', (current_user["id"], event_id))
        
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous participez déjà à cet événement"
            )
            
        # Kullanıcıyı etkinliğe ekle
        cursor.execute('''
            INSERT INTO event_participants (user_id, event_id)
            VALUES (?, ?)
        ''', (current_user["id"], event_id))
        
        # Etkinliğin katılımcı sayısını güncelle
        cursor.execute('''
        UPDATE events
        SET participant_count = COALESCE(participant_count, 0) + 1
        WHERE id = ?
        ''', (event_id,))
        
        conn.commit()
        return {"message": "Inscription à l'événement réussie"}
    except sqlite3.IntegrityError as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erreur d'intégrité de la base de données"
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        conn.close()

# Etkinlikten ayrıl
@router.delete("/{event_id}/register")
async def unregister_event(event_id: int, current_user: dict = Depends(get_current_user)):
    """Kullanıcıyı etkinlikten çıkar"""
    try:
        print(f"Unregister event request received for event {event_id}")
        print(f"Current user: {current_user}")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Etkinliğin var olup olmadığını kontrol et
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        event = cursor.fetchone()
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Kullanıcının kayıtlı olup olmadığını kontrol et
        cursor.execute(
            "SELECT * FROM event_participants WHERE user_id = ? AND event_id = ?",
            (current_user["id"], event_id)
        )
        existing_registration = cursor.fetchone()
        
        if not existing_registration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not registered for this event"
            )
        
        # Kullanıcıyı etkinlikten çıkar
        cursor.execute(
            "DELETE FROM event_participants WHERE user_id = ? AND event_id = ?",
            (current_user["id"], event_id)
        )
        
        conn.commit()
        conn.close()
        
        return {"message": "Successfully unregistered from event"}
    
    except Exception as e:
        print(f"Error unregistering from event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error unregistering from event: {str(e)}"
        )

# Kullanıcının etkinliğe kayıtlı olup olmadığını kontrol et
@router.get("/{event_id}/check-registration")
async def check_registration(event_id: int, current_user: dict = Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Kullanıcının etkinliğe kayıtlı olup olmadığını kontrol et
        cursor.execute('''
        SELECT * FROM event_participants
        WHERE event_id = ? AND user_id = ?
        ''', (event_id, current_user["id"]))
        
        registration = cursor.fetchone()
        conn.close()
        
        return {"registered": registration is not None}
    except Exception as e:
        print(f"Error in check_registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
