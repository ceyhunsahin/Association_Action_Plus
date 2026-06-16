from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List, Dict
from database import get_db
from auth import get_current_user, get_current_admin, oauth2_scheme
from models import Event, EventCreate, EventUpdate
import sqlite3
import re
import secrets
from jose import JWTError, jwt
from datetime import datetime
import json

router = APIRouter(
    tags=["events"]
)
# SECRET_KEY ve ALGORITHM değerlerini auth.py'den alın
SECRET_KEY = 'ceyhunsahin'
ALGORITHM = "HS256"

# ISO ay numarası -> Fransızca kısaltma (kart tarih rozeti için)
_FR_MONTHS = {
    1: "JANV.", 2: "FÉVR.", 3: "MARS", 4: "AVR.", 5: "MAI", 6: "JUIN",
    7: "JUIL.", 8: "AOÛT", 9: "SEPT.", 10: "OCT.", 11: "NOV.", 12: "DÉC.",
}


def _slugify(title: str) -> str:
    """Başlıktan URL dostu, benzersiz bir slug üret"""
    base = (title or "evenement").lower()
    base = base.encode("ascii", "ignore").decode("ascii")
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    if not base:
        base = "evenement"
    suffix = secrets.token_hex(4)
    return f"{base}-{suffix}"


def _derive_day_month(date_str: str):
    """ISO tarihten (YYYY-MM-DD) gün ve Fransızca ay rozeti üret"""
    if not date_str:
        return None, None
    try:
        d = datetime.fromisoformat(str(date_str)[:10])
        return f"{d.day:02d}", _FR_MONTHS.get(d.month)
    except Exception:
        return None, None


def _resolve_event_id(cursor, identifier):
    """slug veya sayısal id'den gerçek event id'sini döndür"""
    cursor.execute("SELECT id FROM events WHERE slug = ?", (str(identifier),))
    row = cursor.fetchone()
    if row:
        return row["id"]
    if str(identifier).isdigit():
        cursor.execute("SELECT id FROM events WHERE id = ?", (int(identifier),))
        row = cursor.fetchone()
        if row:
            return row["id"]
    return None


def _normalize_event(event_dict):
    """images/videos JSON çöz, eksik tasarım alanlarını doldur"""
    if event_dict.get("images"):
        try:
            event_dict["images"] = json.loads(event_dict["images"]) if isinstance(event_dict["images"], str) else event_dict["images"]
        except Exception:
            event_dict["images"] = []
    else:
        event_dict["images"] = []
    if event_dict.get("videos"):
        try:
            event_dict["videos"] = json.loads(event_dict["videos"]) if isinstance(event_dict["videos"], str) else event_dict["videos"]
        except Exception:
            event_dict["videos"] = []
    else:
        event_dict["videos"] = []
    if event_dict.get("participant_count") is None:
        event_dict["participant_count"] = 0
    # Kart tasarımı için eksik alanları tarihten türet
    if not event_dict.get("day") or not event_dict.get("month"):
        day, month = _derive_day_month(event_dict.get("date"))
        event_dict["day"] = event_dict.get("day") or day or ""
        event_dict["month"] = event_dict.get("month") or month or ""
    if not event_dict.get("categoryColor"):
        event_dict["categoryColor"] = "rencontre"
    if not event_dict.get("category"):
        event_dict["category"] = "RENCONTRE"
    return event_dict

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
        # En yeni eklenen üstte gelsin (frontend ayrıca etkinlik tarihine göre sıralar).
        cursor.execute(
            "SELECT * FROM events WHERE COALESCE(status, 'active') = 'active' "
            "ORDER BY datetime(created_at) DESC, id DESC"
        )
        events = cursor.fetchall()

        # SQLite Row'ları dictionary'e çevir
        events_list = [_normalize_event(dict(event)) for event in events]

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

        # Slug ve kart tasarımı alanlarını hazırla
        slug = event.get("slug") or _slugify(event.get("title"))
        day, month = _derive_day_month(event.get("date"))
        category = event.get("category") or "RENCONTRE"
        category_color = event.get("categoryColor") or "rencontre"

        cursor.execute("""
            INSERT INTO events (
                title, description, date, location,
                image, images, videos, max_participants, participant_count, created_by,
                slug, category, categoryColor, day, month
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            current_user.get("id", 1),  # Admin ID'si varsayılan olarak 1
            slug,
            category,
            category_color,
            day,
            month,
        ))

        conn.commit()

        # Yeni oluşturulan etkinliği getir
        event_id = cursor.lastrowid
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        new_event = cursor.fetchone()

        conn.close()
        return _normalize_event(dict(new_event))
        
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Etkinlik güncelleme (sadece admin)
@router.put("/{identifier}", status_code=status.HTTP_200_OK)
async def update_event(
    identifier: str,
    event: dict,
    current_user: dict = Depends(get_current_admin)
):
    """Etkinliği güncelle (sadece admin) - slug veya id ile"""
    try:
        print(f"[DEBUG] Updating event {identifier} with data: {event}")

        conn = get_db()
        cursor = conn.cursor()

        # slug veya id'den gerçek id'yi bul
        event_id = _resolve_event_id(cursor, identifier)
        if not event_id:
            conn.close()
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

        # Tarih değiştiyse gün/ay rozetini yeniden türet
        day, month = _derive_day_month(event.get("date"))

        cursor.execute("""
            UPDATE events SET
                title = ?,
                description = ?,
                date = ?,
                location = ?,
                image = ?,
                images = ?,
                videos = ?,
                max_participants = ?,
                day = COALESCE(?, day),
                month = COALESCE(?, month)
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
            day,
            month,
            event_id
        ))

        conn.commit()

        # Güncellenmiş etkinliği getir
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        updated_event = cursor.fetchone()

        conn.close()
        return _normalize_event(dict(updated_event))
        
    except Exception as e:
        print(f"Error updating event: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Etkinliği sil (sadece admin)
@router.delete("/{identifier}")
async def delete_event(identifier: str, current_user: dict = Depends(get_current_admin)):
    conn = get_db()
    cursor = conn.cursor()

    try:
        event_id = _resolve_event_id(cursor, identifier)
        if not event_id:
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

# Belirli bir etkinliği getir (slug veya id ile)
@router.get("/{identifier}", response_model=Dict)
async def get_event(identifier: str):
    conn = get_db()
    cursor = conn.cursor()

    try:
        # Etkinliği slug veya id ile bul
        event_id = _resolve_event_id(cursor, identifier)
        if not event_id:
            raise HTTPException(status_code=404, detail="Événement non trouvé")

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
            "slug": event["slug"] if "slug" in event.keys() else None,
            "title": event["title"],
            "date": event["date"],
            "description": event["description"],
            "location": event["location"],
            "image": event["image"],
            "images": images,
            "videos": videos,
            "category": event["category"] if "category" in event.keys() else None,
            "categoryColor": event["categoryColor"] if "categoryColor" in event.keys() else None,
            "day": event["day"] if "day" in event.keys() else None,
            "month": event["month"] if "month" in event.keys() else None,
            "max_participants": event["max_participants"],
            "participant_count": len(participants_list),
            "participants": participants_list
        }

        return _normalize_event(event_dict)
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
@router.get("/{identifier}/check-registration")
async def check_registration(identifier: str, current_user: dict = Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()

        event_id = _resolve_event_id(cursor, identifier)
        if not event_id:
            conn.close()
            return {"registered": False}

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
