from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from database import get_db
from auth import get_current_user, get_current_admin
from models import Event, EventCreate, EventUpdate
import sqlite3

router = APIRouter(
    tags=["events"]
)

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
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Önce user_id'nin mevcut olduğundan emin olalım
        print("Current user:", current_user)  # Debug için
        
        cursor.execute('''
            SELECT e.* FROM events e
            JOIN event_participants ep ON e.id = ep.event_id
            WHERE ep.user_id = ?
        ''', (current_user.get("id"),))  # get() kullanarak güvenli erişim
        
        events = cursor.fetchall()
        conn.close()

        # SQLite row'larını dict'e çevir
        events_list = []
        for event in events:
            events_list.append({
                "id": event[0],
                "title": event[1],
                "date": event[2],
                "description": event[3],
                "image": event[4]
            })
        return {"events": events_list}
    except Exception as e:
        print("Error in get_user_events:", str(e))  # Debug için
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Yeni etkinlik oluştur (sadece admin)
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_event(event: EventCreate, current_admin: dict = Depends(get_current_admin)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Etkinliği veritabanına ekle
        cursor.execute('''
        INSERT INTO events (title, description, date, location, image, max_participants, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            event.title,
            event.description,
            event.date,
            event.location,
            event.image,
            event.max_participants,
            current_admin["id"]
        ))
        
        # Eklenen etkinliğin ID'sini al
        event_id = cursor.lastrowid
        
        conn.commit()
        
        # Eklenen etkinliği getir
        cursor.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        new_event = cursor.fetchone()
        
        conn.close()
        
        return dict(new_event)
    except Exception as e:
        print(f"Error creating event: {e}")  # Hata mesajını logla
        raise HTTPException(status_code=500, detail=str(e))

# Etkinliği güncelle (sadece admin)
@router.put("/{event_id}", response_model=Dict)
async def update_event(event_id: int, event: EventUpdate, current_user: dict = Depends(get_current_admin)):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Etkinliği bul
        cursor.execute('''
        SELECT * FROM events WHERE id = ?
        ''', (event_id,))
        existing_event = cursor.fetchone()
        
        if not existing_event:
            raise HTTPException(status_code=404, detail="Événement non trouvé")
        
        # Etkinliği güncelle
        cursor.execute('''
        UPDATE events
        SET title = ?, date = ?, description = ?, image = ?
        WHERE id = ?
        ''', (event.title, event.date, event.description, event.image, event_id))
        conn.commit()
        
        # Güncellenmiş etkinliği al
        cursor.execute('''
        SELECT * FROM events WHERE id = ?
        ''', (event_id,))
        updated_event = cursor.fetchone()
        
        return {
            "id": updated_event["id"],
            "title": updated_event["title"],
            "date": updated_event["date"],
            "description": updated_event["description"],
            "image": updated_event["image"],
            "participant_count": updated_event["participant_count"] or 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

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
        event_dict = {
            "id": event["id"],
            "title": event["title"],
            "date": event["date"],
            "description": event["description"],
            "image": event["image"],
            "participant_count": len(participants_list),
            "participants": participants_list
        }
        
        return event_dict
    except Exception as e:
        print(f"Error in get_event: {str(e)}")  # Hata mesajını logla
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Etkinliğe katıl
@router.post("/{event_id}/join")
async def join_event(event_id: int, current_user: dict = Depends(get_current_user)):
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
        SET participant_count = participant_count + 1
        WHERE id = ?
        ''', (event_id,))
        
        conn.commit()
        return {"message": "Inscription à l'événement réussie"}
    except sqlite3.IntegrityError as e:
        conn.rollback()
        print(f"SQLite error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erreur d'intégrité de la base de données"
        )
    except Exception as e:
        conn.rollback()
        print(f"Error in join_event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        conn.close()

# Etkinlikten ayrıl
@router.delete("/{event_id}/register")
async def unregister_from_event(event_id: int, current_user: dict = Depends(get_current_user)):
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
        
        # Kullanıcının kaydını bul
        cursor.execute('''
        SELECT * FROM event_participants
        WHERE event_id = ? AND user_id = ?
        ''', (event_id, current_user["id"]))
        registration = cursor.fetchone()
        
        if not registration:
            raise HTTPException(status_code=404, detail="Vous n'êtes pas inscrit à cet événement")
        
        # Kullanıcının kaydını sil
        cursor.execute('''
        DELETE FROM event_participants
        WHERE event_id = ? AND user_id = ?
        ''', (event_id, current_user["id"]))
        
        # Etkinliğin katılımcı sayısını güncelle
        cursor.execute('''
        UPDATE events
        SET participant_count = CASE WHEN participant_count > 0 THEN participant_count - 1 ELSE 0 END
        WHERE id = ?
        ''', (event_id,))
        
        conn.commit()
        
        return {"message": "Désinscription de l'événement réussie"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

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