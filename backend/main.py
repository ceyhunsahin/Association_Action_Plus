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
import os
import uvicorn
from pydantic import BaseModel
from datetime import datetime
from generateur_facture import generer_facture_utilisateur
import shutil
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# FastAPI uygulamasını oluştur
app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tüm originlere izin ver (geliştirme için)
    allow_credentials=True,
    allow_methods=["*"],  # Tüm HTTP metodlarına izin ver
    allow_headers=["*"],  # Tüm headerlara izin ver
)

# Routerları ekle
app.include_router(auth_router, prefix="/api/auth")
app.include_router(events_router, prefix="/api/events")
app.include_router(users_router, prefix="/api/users")

# Statik dosyalar için klasör oluştur
UPLOAD_DIR = "uploads"
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

@app.post("/api/test-create-user")
async def test_create_user_endpoint(user_data: dict = Body(...)):
    """Test endpoint for user creation"""
    print(f"Test create user called with data: {user_data}")
    return {"message": "Test endpoint working", "data": user_data}

# Dosya yükleme endpoint'i
@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...), current_admin: dict = Depends(get_current_admin)):
    """Tek resim dosyası yükle (sadece admin)"""
    try:
        # Dosya türünü kontrol et
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sadece resim dosyaları kabul edilir"
            )
        
        # Dosya boyutunu kontrol et (5MB limit)
        if file.size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dosya boyutu 5MB'dan büyük olamaz"
            )
        
        # Benzersiz dosya adı oluştur
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
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
    """Birden fazla resim dosyası yükle (sadece admin)"""
    try:
        uploaded_files = []
        
        for file in files:
            # Dosya türünü kontrol et
            if not file.content_type.startswith('image/'):
                continue  # Bu dosyayı atla
            
            # Dosya boyutunu kontrol et (5MB limit)
            if file.size > 5 * 1024 * 1024:
                continue  # Bu dosyayı atla
            
            # Benzersiz dosya adı oluştur
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")  # Mikrosaniye ekle
            file_extension = os.path.splitext(file.filename)[1]
            filename = f"event_{timestamp}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Dosyayı kaydet
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # URL'yi listeye ekle
            image_url = f"/uploads/{filename}"
            uploaded_files.append({
                "original_name": file.filename,
                "image_url": image_url,
                "filename": filename
            })
        
        return {
            "message": f"{len(uploaded_files)} resim başarıyla yüklendi",
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
        print(f"[DEBUG] Creating user with data: {user_data}")
        
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
        print(f"[DEBUG] Password hashed successfully")
        
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
        
        print(f"[DEBUG] Executing insert query: {insert_query}")
        print(f"[DEBUG] Insert values: {insert_values}")
        
        cursor.execute(insert_query, insert_values)
        
        user_id = cursor.lastrowid
        print(f"[DEBUG] User created with ID: {user_id}")
        
        conn.commit()
        print(f"[DEBUG] Database committed successfully")
        
        # Yeni kullanıcıyı getir
        cursor.execute("SELECT id, firstName, lastName, email, username, role, created_at FROM users WHERE id = ?", (user_id,))
        new_user = cursor.fetchone()
        
        conn.close()
        print(f"[DEBUG] User creation completed successfully")
        
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
            "membership": dict(new_membership)
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