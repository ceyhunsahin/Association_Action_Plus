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

# FastAPI uygulamasını oluştur
app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.actionplusmetz.org"],  # Tüm originlere izin ver (geliştirme için)
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)