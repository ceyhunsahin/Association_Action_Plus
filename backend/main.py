# main.py
from fastapi import FastAPI, Request, Response, HTTPException, Depends, status, Body, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import List, Dict, Optional
import sqlite3
from database import get_db, init_db, get_user_membership, renew_membership, get_membership_history, create_membership_payment, get_user_payment_history, create_membership
from auth import router as auth_router, get_current_user, get_current_admin
from endpoints.events import router as events_router
from endpoints.users import router as users_router
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
import uvicorn
from pydantic import BaseModel
from datetime import datetime
from generateur_facture import generer_facture_utilisateur, generer_recu_don_utilisateur
import shutil
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from database import create_donation, get_donation_by_id, get_all_donations, update_donation_status, get_donations_by_user, track_visit, get_site_stats

# .env dosyasını yükle
load_dotenv()

# FastAPI uygulamasını oluştur
app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://actionplusmetz.fly.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Tüm HTTP metodlarına izin ver
    allow_headers=["*"],  # Tüm headerlara izin ver
)

# Routerları ekle
app.include_router(auth_router, prefix="/api/auth")
app.include_router(events_router, prefix="/api/events")
app.include_router(users_router, prefix="/api/users")

# Statik dosyalar için klasör oluştur
DATA_DIR = os.getenv("DATA_DIR", "")
UPLOAD_DIR = os.path.join(DATA_DIR, "uploads") if DATA_DIR else "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Email gönderme fonksiyonu
def send_email(to_email, subject, message):
    """Email gönderme fonksiyonu - Hostinger SMTP"""
    try:
        from email.message import EmailMessage
        
        # Email mesajı oluştur
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = "contact@actionplusmetz.org"
        msg["To"] = to_email
        msg.set_content(message, charset='utf-8')
        
        # Hostinger SMTP ayarları (.env'den oku)
        smtp_server = os.getenv("EMAIL_HOST", "smtp.hostinger.com")
        smtp_port = int(os.getenv("EMAIL_PORT", "465"))  # SSL port
        sender_email = os.getenv("EMAIL_USER", "contact@actionplusmetz.org")
        sender_password = os.getenv("EMAIL_PASSWORD", "")  # .env'den şifreyi oku
        
        # SMTP bağlantısı ve email gönderme

        
        try:
            with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:

                server.login(sender_email, sender_password)
                server.login(sender_email, sender_password)
                server.send_message(msg)
            

            return True
        except smtplib.SMTPAuthenticationError as e:
            print(f"SMTP Authentication Error: {e}")
            return False
        except smtplib.SMTPException as e:
            print(f"SMTP Error: {e}")
            return False
        
    except Exception as e:
        print(f"Email sending error: {str(e)}")
        return False

# Statik dosyaları serve et
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Ziyaretçi ve istatistik endpointleri
@app.post("/api/visits/track")
async def track_visit_endpoint(request: Request):
    try:
        forwarded = request.headers.get("x-forwarded-for", "")
        client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "")
        total = track_visit(client_ip)
        return {"visitors": total}
    except Exception:
        # Fail soft for stats tracking
        return {"visitors": 0}


@app.get("/api/stats")
async def get_stats_endpoint():
    return get_site_stats()

# Frontend build'i varsa aynı backend üzerinden servis et (SPA)
FRONTEND_BUILD_DIR = Path(__file__).resolve().parent.parent / "frontend" / "build"
if FRONTEND_BUILD_DIR.exists():
    app.mount(
        "/static",
        StaticFiles(directory=str(FRONTEND_BUILD_DIR / "static")),
        name="static",
    )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # API ve upload yollarını SPA fallback'inden hariç tut
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            raise HTTPException(status_code=404, detail="Not Found")

        file_path = FRONTEND_BUILD_DIR / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)

        return FileResponse(FRONTEND_BUILD_DIR / "index.html")

# Üyelik endpoint'leri
@app.get("/api/membership/my-membership")
async def get_my_membership_endpoint(current_user: dict = Depends(get_current_user)):
    """Kullanıcının mevcut üyelik bilgilerini getir"""
    membership = get_user_membership(current_user["id"])
    if not membership:
        # Üyelik yoksa oluştur
        membership = create_membership(current_user["id"])
    
    return membership

@app.post("/api/membership/renew")
async def renew_membership_endpoint(renewal_data: dict = Body(...), current_user: dict = Depends(get_current_user)):
    """Kullanıcının üyeliğini yenile"""
    try:
        plan_type = renewal_data.get('plan', 'standard')
        duration_months = renewal_data.get('duration', 12)
        amount = renewal_data.get('price', 25.0)
        
        result = renew_membership(current_user["id"], plan_type, duration_months, amount)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to renew membership"
            )
        
        # Son ödeme kaydını getir
        payment_history = get_user_payment_history(current_user["id"])
        latest_payment = payment_history[0] if payment_history else None
        
        # Fatura oluştur
        invoice_path = None
        if latest_payment:
            user_data = {
                'id': current_user["id"],
                'firstName': current_user.get("firstName", ""),
                'lastName': current_user.get("lastName", ""),
                'email': current_user.get("email", "")
            }
            invoice_path = generer_facture_utilisateur(user_data, result, latest_payment)
        
        return {
            "message": "Adhésion renouvelée avec succès!",
            "membership": result,
            "payment_id": latest_payment.get('id') if latest_payment else None,
            "invoice_available": invoice_path is not None
        }
    except Exception as e:
        print(f"Üyelik yenileme hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to renew membership: {str(e)}"
        )

@app.get("/api/membership/payment-history")
async def get_payment_history_endpoint(current_user: dict = Depends(get_current_user)):
    """Kullanıcının ödeme geçmişini getir"""
    history = get_user_payment_history(current_user["id"])
    return history

@app.get("/api/membership/history")
async def get_membership_history_endpoint(current_user: dict = Depends(get_current_user)):
    """Kullanıcının üyelik geçmişini getir"""
    history = get_membership_history(current_user["id"])
    return history

@app.get("/api/membership/download-invoice/{payment_id}")
async def download_invoice_endpoint(payment_id: int, current_user: dict = Depends(get_current_user)):
    """Kullanıcının fatura PDF'ini indir"""
    try:
        # Ödeme bilgilerini getir
        from database import get_user_payment_history
        payment_history = get_user_payment_history(current_user["id"])
        
        # Belirtilen ödeme ID'sini bul
        payment_data = None
        for payment in payment_history:
            if payment.get('id') == payment_id:
                payment_data = payment
                break
        
        if not payment_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paiement non trouvé"
            )
        
        # Kullanıcı bilgileri
        user_data = {
            'id': current_user["id"],
            'firstName': current_user.get("firstName", ""),
            'lastName': current_user.get("lastName", ""),
            'email': current_user.get("email", "")
        }
        
        # Üyelik bilgileri
        membership_data = get_user_membership(current_user["id"])
        
        # Fatura oluştur
        invoice_path = generer_facture_utilisateur(user_data, membership_data, payment_data)
        
        # PDF dosyasını döndür
        return FileResponse(
            path=invoice_path,
            filename=f"facture_adhésion_{payment_id}.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        print(f"Fatura oluşturma hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération de la facture: {str(e)}"
        )

# Admin endpoint'leri
@app.get("/api/admin/members")
async def get_all_members_endpoint(current_admin: dict = Depends(get_current_admin)):
    """Tüm üyeleri getir (admin only)"""
    try:
        from database import get_all_users_with_membership
        members = get_all_users_with_membership()
        return members
    except Exception as e:
        print(f"Üye listesi getirme hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des membres: {str(e)}"
        )

@app.post("/api/admin/members/{user_id}/renew")
async def admin_renew_membership_endpoint(user_id: int, renewal_data: dict = Body(...), current_admin: dict = Depends(get_current_admin)):
    """Admin tarafından üyelik yenileme"""
    try:
        plan_type = renewal_data.get('plan', 'standard')
        duration_months = renewal_data.get('duration', 12)
        amount = renewal_data.get('amount', 25.0)
        
        result = renew_membership(user_id, plan_type, duration_months, amount)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to renew membership"
            )
        
        # Son ödeme kaydını getir
        payment_history = get_user_payment_history(user_id)
        latest_payment = payment_history[0] if payment_history else None
        
        # Fatura oluştur
        invoice_path = None
        if latest_payment:
            # Kullanıcı bilgilerini getir
            from database import get_user_by_id
            user_data = get_user_by_id(user_id)
            if user_data:
                invoice_path = generer_facture_utilisateur(user_data, result, latest_payment)
        
        return {
            "message": "Adhésion renouvelée avec succès par l'administrateur!",
            "membership": result,
            "membership_id": result.get('id') if result else None,
            "payment_id": latest_payment.get('id') if latest_payment else None,
            "invoice_available": invoice_path is not None
        }
    except Exception as e:
        print(f"Admin üyelik yenileme hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du renouvellement: {str(e)}"
        )

@app.get("/api/admin/download-invoice/{payment_id}")
async def admin_download_invoice_endpoint(payment_id: int, current_admin: dict = Depends(get_current_admin)):
    """Admin tarafından fatura indirme"""
    try:
        # Ödeme bilgilerini getir
        from database import get_payment_by_id, get_user_by_id
        payment_data = get_payment_by_id(payment_id)
        
        if not payment_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paiement non trouvé"
            )
        
        # Kullanıcı bilgileri
        user_data = get_user_by_id(payment_data['user_id'])
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        # Üyelik bilgileri
        membership_data = get_user_membership(payment_data['user_id'])
        
        # Fatura oluştur
        invoice_path = generer_facture_utilisateur(user_data, membership_data, payment_data)
        
        # PDF dosyasını döndür
        return FileResponse(
            path=invoice_path,
            filename=f"facture_adhésion_{payment_id}.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        print(f"Admin fatura oluşturma hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération de la facture: {str(e)}"
        )

@app.get("/api/admin/download-invoice-membership/{membership_id}")
async def admin_download_invoice_membership_endpoint(membership_id: int, current_admin: dict = Depends(get_current_admin)):
    """Admin tarafından membership_id ile fatura indirme"""
    try:
        # Üyelik bilgilerini getir
        from database import get_user_by_id, get_db_connection
        conn = get_db_connection()
        if not conn:
            raise HTTPException(status_code=500, detail="Database connection error")
        
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM memberships WHERE id = ?
            ''', (membership_id,))
            membership_data = cursor.fetchone()
            
            if membership_data:
                membership_data = dict(zip([col[0] for col in cursor.description], membership_data))
            else:
                raise HTTPException(status_code=404, detail="Adhésion non trouvée")
        finally:
            conn.close()
        
        if not membership_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Adhésion non trouvée"
            )
        
        # Kullanıcı bilgileri
        user_data = get_user_by_id(membership_data['user_id'])
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        # Sahte ödeme verisi oluştur
        fake_payment_data = {
            'id': f"membership_{membership_id}",
            'amount': 25.0,
            'payment_type': 'renewal',
            'plan_type': membership_data.get('membership_type', 'standard'),
            'duration_months': 12,
            'payment_date': membership_data.get('start_date', datetime.now().isoformat())
        }
        
        # Fatura oluştur
        from generateur_facture import GenerateurFacture
        import os
        
        # Fatura klasörünü oluştur
        output_dir = "factures"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Fatura dosya adı
        invoice_filename = f"facture_adhésion_{membership_id}.pdf"
        invoice_path = os.path.join(output_dir, invoice_filename)
        
        # Fatura oluştur
        generateur = GenerateurFacture()
        invoice_path = generateur.generer_facture_adhésion(user_data, membership_data, fake_payment_data, invoice_path)
        
        # PDF dosyasını döndür
        return FileResponse(
            path=invoice_path,
            filename=f"facture_adhésion_{membership_id}.pdf",
            media_type="application/pdf"
        )
        
    except Exception as e:
        print(f"Admin membership fatura oluşturma hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la génération de la facture: {str(e)}"
        )

# Veritabanını başlat
@app.on_event("startup")
async def startup_event():
    init_db()

# Ana sayfa
@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

# Sağlık kontrolü
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Dosya yükleme endpoint'i
@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...), current_admin: dict = Depends(get_current_admin)):
    """Tek resim dosyası yükle (sadece admin)"""
    try:
        # Dosya türünü kontrol et
        content_type = (file.content_type or "")
        if not content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sadece resim dosyaları kabul edilir"
            )
        
        # Dosya boyutunu kontrol et (5MB limit)
        if file.size is not None and file.size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dosya boyutu 5MB'dan büyük olamaz"
            )
        
        # Benzersiz dosya adı oluştur
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename or "")[1] if file.filename else ""
        filename = f"event_{timestamp}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Dosyayı kaydet
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # URL'yi döndür
        image_url = f"/uploads/{filename}"
        
        return {
            "message": "Resim başarıyla yüklendi",
            "image_url": image_url,
            "filename": filename
        }
        
    except Exception as e:
        print(f"Dosya yükleme hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dosya yükleme hatası: {str(e)}"
        )

# Çoklu dosya yükleme endpoint'i
@app.post("/api/upload-multiple-images")
async def upload_multiple_images(files: List[UploadFile] = File(...), current_admin: dict = Depends(get_current_admin)):
    """Birden fazla resim/video dosyası yükle (sadece admin)"""
    try:
        uploaded_files = []
        allowed_image_ext = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
        allowed_video_ext = {'.mp4', '.webm', '.ogg', '.mov'}
        
        for file in files:
            if not file.filename:
                continue  # Dosya adı yoksa atla
            file_extension = os.path.splitext(file.filename)[1].lower()
            # Dosya türünü kontrol et
            content_type = (file.content_type or '').lower()
            is_image = content_type.startswith('image/') or file_extension in allowed_image_ext
            is_video = content_type.startswith('video/') or file_extension in allowed_video_ext
            if not (is_image or is_video):
                continue  # Bu dosyayı atla
            
            # Dosya boyutunu kontrol et (image 5MB, video 50MB limit)
            size_limit = 5 * 1024 * 1024 if is_image else 50 * 1024 * 1024
            if file.size is not None and file.size > size_limit:
                continue  # Bu dosyayı atla
            
            # Benzersiz dosya adı oluştur
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")  # Mikrosaniye ekle
            prefix = "event_img" if is_image else "event_vid"
            filename = f"{prefix}_{timestamp}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Dosyayı kaydet
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # URL'yi listeye ekle
            file_url = f"/uploads/{filename}"
            uploaded_files.append({
                "original_name": file.filename,
                "file_url": file_url,
                "filename": filename,
                "type": "image" if is_image else "video"
            })
        
        if len(uploaded_files) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aucun fichier valide n'a été téléchargé"
            )

        return {
            "message": f"{len(uploaded_files)} dosya başarıyla yüklendi",
            "uploaded_files": uploaded_files,
            "total_uploaded": len(uploaded_files)
        }
        
    except Exception as e:
        print(f"Çoklu dosya yükleme hatası: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Çoklu dosya yükleme hatası: {str(e)}"
        )

@app.options("/{full_path:path}")
async def options_route(request: Request, full_path: str):
    return Response(status_code=200)

# Admin endpoint'leri
@app.post("/api/admin/create-user")
async def create_user_endpoint(user_data: dict = Body(...), current_admin: dict = Depends(get_current_admin)):
    """Admin tarafından yeni kullanıcı oluştur"""
    try:
        
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        conn = get_db()
        if not conn:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )
        
        cursor = conn.cursor()
        
        # Email ve username kontrolü
        cursor.execute("SELECT id FROM users WHERE email = ? OR username = ?", 
                      (user_data['email'], user_data['username']))
        existing_user = cursor.fetchone()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email ou nom d'utilisateur déjà utilisé"
            )
        
        # Şifreyi hash'le
        hashed_password = pwd_context.hash(user_data['password'])
        
        # Kullanıcıyı oluştur
        insert_query = '''
            INSERT INTO users (firstName, lastName, email, username, password, role, created_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        '''
        insert_values = (
            user_data['firstName'],
            user_data['lastName'],
            user_data['email'],
            user_data['username'],
            hashed_password,
            user_data.get('role', 'user'),
            datetime.now().isoformat(),
            datetime.now().isoformat()  # last_login için şu anki zaman
        )
        
        
        cursor.execute(insert_query, insert_values)
        
        user_id = cursor.lastrowid
        
        conn.commit()
        
        # Yeni kullanıcıyı getir
        cursor.execute("SELECT id, firstName, lastName, email, username, role, created_at FROM users WHERE id = ?", (user_id,))
        new_user = cursor.fetchone()
        
        conn.close()
        
        return dict(new_user)
        
    except HTTPException:
        # HTTPException'ları yeniden fırlat
        raise
    except Exception as e:
        print(f"[ERROR] Kullanıcı oluşturma hatası: {str(e)}")
        print(f"[ERROR] Error type: {type(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

# Yeni üyelik oluşturma endpoint'i
@app.post("/api/admin/create-membership")
async def create_membership_endpoint(membership_data: dict = Body(...), current_admin: dict = Depends(get_current_admin)):
    """Admin tarafından yeni üyelik oluştur"""
    try:
        from datetime import datetime, timedelta
        from database import create_membership_payment, get_payment_by_id, get_user_by_id
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Kullanıcının var olup olmadığını kontrol et
        cursor.execute("SELECT id FROM users WHERE id = ?", (membership_data['userId'],))
        user = cursor.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        # Üyelik süresini hesapla
        start_date = datetime.now()
        end_date = start_date + timedelta(days=membership_data['duration'] * 30)
        
        # Üyeliği oluştur
        cursor.execute('''
            INSERT INTO memberships (user_id, membership_type, start_date, end_date, status, renewal_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            membership_data['userId'],
            membership_data['membershipType'],
            start_date.isoformat(),
            end_date.isoformat(),
            'active',
            0,
            datetime.now().isoformat()
        ))
        
        membership_id = cursor.lastrowid
        conn.commit()
        
        # Ödeme kaydı oluştur
        amount = membership_data.get('amount', 0)
        payment_id = create_membership_payment(
            membership_data['userId'],
            membership_id,
            amount,
            membership_data.get('membershipType', 'standard'),
            membership_data.get('duration', 12)
        )

        invoice_path = None
        if payment_id:
            payment_data = get_payment_by_id(payment_id)
            user_data = get_user_by_id(membership_data['userId'])
            membership_data_full = {
                "id": membership_id,
                "membership_type": membership_data.get('membershipType', 'standard'),
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "status": "active",
                "renewal_count": 0
            }
            if user_data and payment_data:
                invoice_path = generer_facture_utilisateur(user_data, membership_data_full, payment_data)

        # Yeni üyeliği getir
        cursor.execute('''
            SELECT m.*, u.firstName, u.lastName, u.email
            FROM memberships m
            JOIN users u ON m.user_id = u.id
            WHERE m.id = ?
        ''', (membership_id,))
        
        new_membership = cursor.fetchone()
        conn.close()
        
        return {
            "membership_id": membership_id,
            "membership": dict(new_membership),
            "payment_id": payment_id,
            "invoice_available": invoice_path is not None
        }
    except Exception as e:
        print(f"Membership creation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create membership: {str(e)}"
        )

@app.post("/api/contact")
async def contact_endpoint(contact_data: dict = Body(...)):
    """Contact form endpoint"""
    try:

        
        # Email bilgilerini al
        name = contact_data.get('name', '')
        email = contact_data.get('email', '')
        subject = contact_data.get('subject', 'Nouveau message de contact')
        message = contact_data.get('message', '')
        
        # Subject'i ASCII-safe yap
        subject = subject.encode('ascii', 'ignore').decode('ascii')
        
        # Email içeriğini oluştur
        email_content = f"""
        Nouveau message de contact reçu:
        
        Nom: {name}
        Email: {email}
        Sujet: {subject}
        
        Message:
        {message}
        
        ---
        Ce message a été envoyé depuis le formulaire de contact du site web.
        """.encode('utf-8').decode('utf-8')
        
        # Mesajı database'e kaydet
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO contact_messages (name, email, subject, message, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (name, email, subject, message, datetime.now().isoformat()))
        conn.commit()
        conn.close()
        
        # Gerçek email gönderme işlemi

        email_sent = send_email("contact@actionplusmetz.org", subject, email_content)
        
        if email_sent:
            pass
        else:
            print(f"Failed to send email to: contact@actionplusmetz.org")
            print("Check SMTP settings and credentials")
        

        
        return {
            "success": True,
            "message": "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais."
        }
    except Exception as e:
        print(f"Contact form error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'envoi du message"
        )

# Donation endpoints
@app.post("/api/donations")
async def create_donation_endpoint(donation_data: dict = Body(...)):
    try:
        amount = donation_data.get('amount')
        donor_name = donation_data.get('donor_name')
        donor_email = donation_data.get('donor_email')
        payment_method = donation_data.get('payment_method')

        if not amount or float(amount) <= 0:
            raise HTTPException(status_code=400, detail="Montant invalide")
        if not donor_name or not donor_email or not payment_method:
            raise HTTPException(status_code=400, detail="Informations du donateur manquantes")

        tx_id = f"DON-{datetime.now().strftime('%Y%m%d')}-{str(int(datetime.now().timestamp()))[-6:]}"
        donation_data['transaction_id'] = tx_id
        donation_data['status'] = donation_data.get('status', 'PENDING')

        donation = create_donation(donation_data)
        if not donation:
            raise HTTPException(status_code=500, detail="Erreur lors de la création du don")

        return donation
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Donation create error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/donations/{donation_id}/send-receipt")
async def send_donation_receipt_endpoint(donation_id: int, payload: dict = Body(...)):
    try:
        donation = get_donation_by_id(donation_id)
        if not donation:
            raise HTTPException(status_code=404, detail="Don non trouvé")

        email = payload.get('email') or donation.get('donor_email')
        name = payload.get('name') or donation.get('donor_name')

        subject = "Reçu de don - Action Plus"
        message = f"""
        Bonjour {name},

        Merci pour votre don de {donation.get('amount')} {donation.get('currency', 'EUR')}.
        Transaction: {donation.get('transaction_id')}
        Date: {donation.get('transaction_date') or donation.get('created_at')}

        Ce reçu peut être utilisé pour votre déclaration d'impôts.

        Action Plus
        """

        sent = send_email(email, subject, message)
        return {"sent": sent}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Donation receipt error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/donations/me")
async def get_my_donations_endpoint(current_user: dict = Depends(get_current_user)):
    try:
        return get_donations_by_user(current_user["id"])
    except Exception as e:
        print(f"My donations error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/donations/{donation_id}")
async def get_donation_endpoint(donation_id: int):
    try:
        donation = get_donation_by_id(donation_id)
        if not donation:
            raise HTTPException(status_code=404, detail="Don non trouvé")
        return donation
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Donation get error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/donations")
async def get_all_donations_endpoint(current_admin: dict = Depends(get_current_admin)):
    try:
        return get_all_donations()
    except Exception as e:
        print(f"Donation list error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/donations/{donation_id}/approve")
async def approve_donation_endpoint(donation_id: int, current_admin: dict = Depends(get_current_admin)):
    try:
        donation = get_donation_by_id(donation_id)
        if not donation:
            raise HTTPException(status_code=404, detail="Don non trouvé")
        if donation.get("status") == "COMPLETED":
            return {"status": "COMPLETED"}

        ok = update_donation_status(donation_id, "COMPLETED")
        if not ok:
            raise HTTPException(status_code=500, detail="Impossible de valider le don")

        # Receipt email after approval
        subject = "Reçu de don - Action Plus"
        message = f"""
        Bonjour {donation.get('donor_name')},

        Votre don de {donation.get('amount')} {donation.get('currency', 'EUR')} a été confirmé.
        Transaction: {donation.get('transaction_id')}
        Date: {donation.get('transaction_date') or donation.get('created_at')}

        Merci pour votre soutien.

        Action Plus
        """
        send_email(donation.get("donor_email"), subject, message)

        return {"status": "COMPLETED"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Donation approve error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/donations/{donation_id}/receipt")
async def download_donation_receipt(donation_id: int, current_user: dict = Depends(get_current_user)):
    try:
        donation = get_donation_by_id(donation_id)
        if not donation:
            raise HTTPException(status_code=404, detail="Don non trouvé")
        if donation.get("user_id") != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Accès refusé")
        if donation.get("status") != "COMPLETED":
            raise HTTPException(status_code=400, detail="Don non validé")
        invoice_path = generer_recu_don_utilisateur(donation)
        return FileResponse(
            path=invoice_path,
            filename=f"recu_don_{donation_id}.pdf",
            media_type="application/pdf"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Donation receipt error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/donations/{donation_id}/receipt")
async def admin_download_donation_receipt(donation_id: int, current_admin: dict = Depends(get_current_admin)):
    try:
        donation = get_donation_by_id(donation_id)
        if not donation:
            raise HTTPException(status_code=404, detail="Don non trouvé")
        if donation.get("status") != "COMPLETED":
            raise HTTPException(status_code=400, detail="Don non validé")
        invoice_path = generer_recu_don_utilisateur(donation)
        return FileResponse(
            path=invoice_path,
            filename=f"recu_don_{donation_id}.pdf",
            media_type="application/pdf"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Admin donation receipt error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/contact-messages")
async def get_contact_messages_endpoint(current_admin: dict = Depends(get_current_admin)):
    """Admin için contact mesajlarını getir"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, subject, message, created_at, status
            FROM contact_messages
            ORDER BY created_at DESC
        ''')
        
        messages = []
        rows = cursor.fetchall()

        
        for row in rows:
            try:
                # Row'un tipini kontrol et
                if isinstance(row, dict):
                    # Dictionary formatında geliyorsa
                    messages.append({
                        "id": row.get("id"),
                        "name": row.get("name"),
                        "email": row.get("email"),
                        "subject": row.get("subject"),
                        "message": row.get("message"),
                        "created_at": row.get("created_at"),
                        "status": row.get("status")
                    })
                else:
                    # Tuple formatında geliyorsa
                    messages.append({
                        "id": row[0],
                        "name": row[1],
                        "email": row[2],
                        "subject": row[3],
                        "message": row[4],
                        "created_at": row[5],
                        "status": row[6]
                    })
            except Exception as row_error:
                print(f"Error processing row {row}: {row_error}")
                continue
        
        conn.close()
        
        return {"messages": messages}
        
    except Exception as e:
        print(f"Error fetching contact messages: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch contact messages"
        )

@app.put("/api/admin/contact-messages/{message_id}/read")
async def mark_message_as_read_endpoint(message_id: int, current_admin: dict = Depends(get_current_admin)):
    """Mesajı okundu olarak işaretle"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE contact_messages 
            SET status = 'read' 
            WHERE id = ?
        ''', (message_id,))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Message marked as read"}
        
    except Exception as e:
        print(f"Error marking message as read: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark message as read"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
