from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from database import get_db
from auth import get_current_user

router = APIRouter(
    prefix="/api",  # Tüm endpoint'lere /api prefix'i ekle
    tags=["events"]
)

# Tüm etkinlikleri getir
@router.get("/events", response_model=List[Dict])
async def get_events():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM events')
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
        return events_list
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

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
            JOIN user_events ue ON e.id = ue.event_id
            WHERE ue.user_id = ?
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

# Yeni etkinlik oluştur
@router.post("/events/create")
async def create_event(event: dict, current_user: dict = Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO events (title, date, description, image)
            VALUES (?, ?, ?, ?)
        ''', (event["title"], event["date"], event["description"], event["image"]))
        conn.commit()
        event_id = cursor.lastrowid
        conn.close()
        return {"message": "Événement créé avec succès", "event_id": event_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Etkinliğe katıl
@router.post("/events/{event_id}/join")
async def join_event(event_id: int, current_user: dict = Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Kullanıcının zaten katılıp katılmadığını kontrol et
        cursor.execute('''
            SELECT * FROM user_events 
            WHERE user_id = ? AND event_id = ?
        ''', (current_user["id"], event_id))
        
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous participez déjà à cet événement"
            )
            
        # Kullanıcıyı etkinliğe ekle
        cursor.execute('''
            INSERT INTO user_events (user_id, event_id)
            VALUES (?, ?)
        ''', (current_user["id"], event_id))
        
        conn.commit()
        conn.close()
        return {"message": "Inscription à l'événement réussie"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Etkinliği sil (sadece admin)
@router.delete("/events/{event_id}")
async def delete_event(event_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs peuvent supprimer des événements"
        )
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM events WHERE id = ?', (event_id,))
        conn.commit()
        conn.close()
        return {"message": "Événement supprimé avec succès"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Event detaylarını getir
@router.get("/events/{event_id}")
async def get_event_detail(event_id: int):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Event'i getir
        cursor.execute('''
            SELECT * FROM events WHERE id = ?
        ''', (event_id,))
        
        event = cursor.fetchone()
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Événement non trouvé"
            )
            
        # Katılımcı sayısını getir
        cursor.execute('''
            SELECT COUNT(*) FROM user_events WHERE event_id = ?
        ''', (event_id,))
        
        participant_count = cursor.fetchone()[0]
        conn.close()

        return {
            "id": event[0],
            "title": event[1],
            "date": event[2],
            "description": event[3],
            "image": event[4],
            "participant_count": participant_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )